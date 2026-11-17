
import { useEffect, useRef, useState } from "react";
import { Boton } from "../common/Button";
import { Form, Text, Select } from "../common/forms";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { actualizarPerfil, cambiarPassword } from "../../api/profile";
import { avatarPorDefecto } from "../../utils/avatar";
import RequisitosContrasena from "../common/RequisitosContrasena.jsx";
import {
    REGLAS_DOCUMENTO, filtrarNombre, filtrarDocumento, filtrarContrasena,
    validarNombre, validarDocumento, validarContrasena,
} from "../../utils/validacionesUsuario";
import borrarIcono from "../../assets/icons/borrar.svg";
import fotoIcono from "../../assets/icons/fotografia.svg"
import llaveIcono from "../../assets/icons/llave.svg"

const TIPOS_DOCUMENTO = [
    { valor: "", etiqueta: "Seleccione el tipo de documento" },
    { valor: "CC", etiqueta: "Cédula de ciudadanía" },
    { valor: "CE", etiqueta: "Cédula de extranjería" },
    { valor: "TI", etiqueta: "Tarjeta de identidad" },
    { valor: "PA", etiqueta: "Pasaporte" },
];

const TAMANO_SALIDA = 400; // la foto guardada queda de 400 x 400 px

// Tamaño de la imagen dentro del círculo: siempre lo cubre por completo (como "cover").
function geometria(nat, lado, zoom) {
    const escala = Math.max(lado / nat.w, lado / nat.h) * zoom;
    return { w: nat.w * escala, h: nat.h * escala };
}

// Impide arrastrar la imagen hasta dejar huecos vacíos dentro del círculo.
function limitar(desplazamiento, g, lado) {
    const maxX = Math.max(0, (g.w - lado) / 2);
    const maxY = Math.max(0, (g.h - lado) / 2);
    return {
        x: Math.min(maxX, Math.max(-maxX, desplazamiento.x)),
        y: Math.min(maxY, Math.max(-maxY, desplazamiento.y)),
    };
}

function PerfilEditor({ vista: vistaInicial = "datos", onCerrar }) {
    const { usuario, cargarUsuarioActual } = useAuth();
    const { advertencia } = useToast();

    const [vista, setVista] = useState(vistaInicial);

    // Datos personales
    const [nombre, setNombre] = useState(usuario?.name ?? "");
    const [apellido, setApellido] = useState(usuario?.last_name ?? "");
    const [tipoDoc, setTipoDoc] = useState(usuario?.document_type ?? "");
    const [numDoc, setNumDoc] = useState(usuario?.document_number ?? "");

    // Foto
    const [archivo, setArchivo] = useState(null);
    const [imgSrc, setImgSrc] = useState("");
    const [nat, setNat] = useState(null);
    const [lado, setLado] = useState(160);
    const [zoom, setZoom] = useState(1);
    const [desplazamiento, setDesplazamiento] = useState({ x: 0, y: 0 });
    const [quitarFoto, setQuitarFoto] = useState(false);
    const inputRef = useRef(null);
    const marcoRef = useRef(null);
    const arrastre = useRef(null);

    // Contraseña
    const [actual, setActual] = useState("");
    const [nueva, setNueva] = useState("");
    const [confirmacion, setConfirmacion] = useState("");

    // Libera la imagen temporal del navegador al cambiarla o cerrar el overlay
    useEffect(() => {
        return () => {
            if (imgSrc) URL.revokeObjectURL(imgSrc);
        };
    }, [imgSrc]);

    const fotoGuardada = quitarFoto ? null : usuario?.photo_url;
    const editando = Boolean(imgSrc && nat);
    const g = editando ? geometria(nat, lado, zoom) : null;
    const o = editando ? limitar(desplazamiento, g, lado) : { x: 0, y: 0 };

    const alElegirFoto = (e) => {
        const elegido = e.target.files?.[0];
        e.target.value = ""; // permite volver a elegir el mismo archivo
        if (!elegido) return;

        if (!elegido.type.startsWith("image/")) {
            advertencia("El archivo debe ser una imagen.", "Archivo no válido");
            return;
        }
        if (elegido.size > 8 * 1024 * 1024) {
            advertencia("La imagen no puede superar los 8 MB.", "Imagen muy pesada");
            return;
        }

        setArchivo(elegido);
        setImgSrc(URL.createObjectURL(elegido));
        setNat(null);
        setZoom(1);
        setDesplazamiento({ x: 0, y: 0 });
        setQuitarFoto(false);
    };

    const alCargarImagen = (e) => {
        setNat({ w: e.target.naturalWidth, h: e.target.naturalHeight });
        setLado(marcoRef.current?.clientWidth || 160);
    };

    const quitarFotoActual = (e) => {
        e.preventDefault();
        setArchivo(null);
        setImgSrc("");
        setNat(null);
        setQuitarFoto(true);
    };

    // ---- Mover la imagen con el mouse o el dedo ----
    const iniciarArrastre = (e) => {
        if (!editando) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        arrastre.current = { x: e.clientX, y: e.clientY, base: o };
    };

    const moverArrastre = (e) => {
        if (!arrastre.current || !editando) return;
        const { x, y, base } = arrastre.current;
        setDesplazamiento(limitar({ x: base.x + e.clientX - x, y: base.y + e.clientY - y }, g, lado));
    };

    const terminarArrastre = () => {
        arrastre.current = null;
    };

    // Dibuja en un lienzo exactamente lo que se ve dentro del círculo
    const generarRecorte = () =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const lienzo = document.createElement("canvas");
                lienzo.width = TAMANO_SALIDA;
                lienzo.height = TAMANO_SALIDA;
                const ctx = lienzo.getContext("2d");
                const k = TAMANO_SALIDA / lado;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, TAMANO_SALIDA, TAMANO_SALIDA);
                ctx.drawImage(img, ((lado - g.w) / 2 + o.x) * k, ((lado - g.h) / 2 + o.y) * k, g.w * k, g.h * k);
                lienzo.toBlob(
                    (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar la imagen."))),
                    "image/jpeg",
                    0.9
                );
            };
            img.onerror = () => reject(new Error("No se pudo leer la imagen."));
            img.src = imgSrc;
        });

    // Los avisos de éxito y de error de las peticiones los muestra axios.
    const guardarDatos = async () => {
        const errorNombre = validarNombre(nombre, "El nombre") || validarNombre(apellido, "El apellido");
        if (errorNombre) {
            advertencia(errorNombre, "Datos no válidos");
            return;
        }
        const errorDocumento = validarDocumento(tipoDoc, numDoc.trim());
        if (errorDocumento) {
            advertencia(errorDocumento, "Documento no válido");
            return;
        }
        if (archivo && !nat) {
            advertencia("Espera a que termine de cargar la imagen.", "Imagen cargando");
            return;
        }

        try {
            const datos = new FormData();
            datos.append("name", nombre.trim());
            datos.append("last_name", apellido.trim());
            datos.append("document_type", tipoDoc);
            datos.append("document_number", numDoc.trim());

            if (archivo) {
                const recorte = await generarRecorte();
                datos.append("photo", recorte, "perfil.jpg");
            } else if (quitarFoto) {
                datos.append("remove_photo", "1");
            }

            await actualizarPerfil(datos);
            await cargarUsuarioActual();
            onCerrar();
        } catch (err) {
            if (!err.response) advertencia(err.message || "No se pudo guardar el perfil.", "No se pudo guardar");
        }
    };

    const guardarPassword = async () => {
        if (!actual || !nueva || !confirmacion) {
            advertencia("Completa los tres campos.", "Datos incompletos");
            return;
        }
        const errorNueva = validarContrasena(nueva, "La nueva contraseña");
        if (errorNueva) {
            advertencia(errorNueva, "Contraseña no válida");
            return;
        }
        if (nueva !== confirmacion) {
            advertencia("La confirmación no coincide con la nueva contraseña.", "No coinciden");
            return;
        }
        if (nueva === actual) {
            advertencia("La nueva contraseña debe ser diferente a la actual.", "Contraseña repetida");
            return;
        }

        try {
            await cambiarPassword(actual, nueva, confirmacion);
            onCerrar();
        } catch {
            setActual("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (vista === "datos") await guardarDatos();
        else await guardarPassword();
    };

    const cambiarVista = (e, nuevaVista) => {
        e.preventDefault();
        setVista(nuevaVista);
    };

    const nombreCompleto = `${nombre} ${apellido}`.trim();

    return (
        <Form
            titulo={vista === "datos" ? "Mi perfil" : "Cambiar contraseña"}
            descripcion={
                vista === "datos"
                    ? "Actualiza tus datos y tu foto. Arrastra la imagen para acomodarla dentro del círculo."
                    : "Escribe tu contraseña actual y la nueva. Se cerrarán tus otras sesiones abiertas."
            }
            onCancel={onCerrar}
            onSubmit={handleSubmit}
            textoBoton={vista === "datos" ? "Guardar cambios" : "Cambiar contraseña"}
            iconoBoton={vista === "datos" ? "fa-solid fa-floppy-disk" : "fa-solid fa-key"}
            tituloBoton={vista === "datos" ? "Guardar cambios del perfil" : "Guardar nueva contraseña"}
        >
            

            {vista === "datos" && (
                <>
                    <div className="col-span-6">
                        <div className="avatar-section">
                            <div className="avatar-container">
                                {(imgSrc || fotoGuardada) && (
                                    <Boton
                                        clase="btn-borrar avatar-remove-button"
                                        img={borrarIcono}
                                        titulo="Quitar mi foto de perfil"
                                        onClick={quitarFotoActual}
                                    />
                                )}
                                <div className="avatar-wrap">
                                    <div
                                        className="avatar-wrap-img"
                                        ref={marcoRef}
                                        onPointerDown={iniciarArrastre}
                                        onPointerMove={moverArrastre}
                                        onPointerUp={terminarArrastre}
                                        onPointerCancel={terminarArrastre}
                                        style={{ cursor: editando ? "grab" : "default", touchAction: "none" }}
                                    >
                                        {imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt="Foto nueva de perfil"
                                                draggable={false}
                                                onLoad={alCargarImagen}
                                                style={
                                                    editando
                                                        ? { position: "absolute", left: "50%", top: "50%", width: g.w, height: g.h, maxWidth: "none", transform: `translate(calc(-50% + ${o.x}px), calc(-50% + ${o.y}px))`, userSelect: "none", pointerEvents: "none" }
                                                        : { visibility: "hidden", position: "absolute" }
                                                }
                                            />
                                        ) : (
                                            <img
                                                src={fotoGuardada || avatarPorDefecto(nombreCompleto)}
                                                alt={`Foto de perfil de ${nombreCompleto}`}
                                                draggable={false}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-6">
                                <div className="btn-container__acciones" style={{marginTop:"10px"}}>
                                    <Boton
                                        // clase={vista === "password" ? "btn-azul" : "btn-2"}
                                            clase="btn-azul"
                                            img={llaveIcono}
                                            texto="Nueva contraseña"
                                            titulo="Cambiar mi contraseña"
                                            onClick={(e) => cambiarVista(e, "password")}
                                        />

                                    <Boton
                                        clase="btn-2"
                                        img={fotoIcono}
                                        texto={imgSrc || fotoGuardada ? "Nueva fotografia" : "Elegir foto"}
                                        titulo="Elegir una foto de tu equipo"
                                        onClick={(e) => { e.preventDefault(); inputRef.current?.click(); }}
                                    />       
                                </div>
                                    {/* <Boton
                                        clase={vista === "datos" ? "btn-azul" : "btn-2"}
                                        icono="fa-solid fa-user-pen"
                                        texto="Mis datos"
                                        titulo="Ver mis datos y mi foto"
                                        onClick={(e) => cambiarVista(e, "datos")}
                                    /> */}
                            </div>

                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={alElegirFoto}
                                aria-label="Elegir foto de perfil"
                            />

                            {editando && (
                                <div style={{ marginTop: "0.75rem" }}>
                                    <label htmlFor="zoom-foto" className="form-label">Acercar o alejar</label>
                                    <input
                                        id="zoom-foto"
                                        type="range"
                                        min="1"
                                        max="3"
                                        step="0.05"
                                        value={zoom}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-3">
                        <Text label="Nombre:" id="perfil-nombre" name="perfil-nombre" placeholder="Tu nombre" value={nombre} maxLength={50} onChange={(e) => setNombre(filtrarNombre(e.target.value))} required />
                    </div>
                    <div className="col-span-3">
                        <Text label="Apellido:" id="perfil-apellido" name="perfil-apellido" placeholder="Tu apellido" value={apellido} maxLength={50} onChange={(e) => setApellido(filtrarNombre(e.target.value))} required />
                    </div>
                    <div className="col-span-3">
                        <Select label="Tipo de documento:" id="perfil-tipo-doc" name="perfil-tipo-doc" value={tipoDoc} onChange={(e) => { setTipoDoc(e.target.value); setNumDoc((n) => filtrarDocumento(n, e.target.value)); }} opciones={TIPOS_DOCUMENTO} required />
                    </div>
                    <div className="col-span-3">
                        <Text label="Número de documento:" id="perfil-num-doc" name="perfil-num-doc" placeholder={REGLAS_DOCUMENTO[tipoDoc]?.ejemplo ?? "Tu número de documento"} maxLength={REGLAS_DOCUMENTO[tipoDoc]?.max ?? 12} value={numDoc} onChange={(e) => setNumDoc(filtrarDocumento(e.target.value, tipoDoc))} required />
                    </div>
                    <div className="col-span-6">
                        <Text label="Correo electrónico:" id="perfil-correo" name="perfil-correo" value={usuario?.email ?? ""} onChange={() => {}} disabled />
                    </div>
                </>
            )}

            {vista === "password" && (
                <>
                    <div className="col-span-6">
                        <Text label="Contraseña actual:" id="perfil-pass-actual" name="perfil-pass-actual" type="password" placeholder="Tu contraseña actual" value={actual} onChange={(e) => setActual(e.target.value)} required />
                    </div>
                    <div className="col-span-6">
                        <Text label="Nueva contraseña:" id="perfil-pass-nueva" name="perfil-pass-nueva" type="password" placeholder="Mínimo 8 caracteres" maxLength={64} value={nueva} onChange={(e) => setNueva(filtrarContrasena(e.target.value))} required />
                        <RequisitosContrasena valor={nueva} />
                    </div>
                    <div className="col-span-6">
                        <Text label="Confirmar nueva contraseña:" id="perfil-pass-confirmar" name="perfil-pass-confirmar" type="password" placeholder="Repite la nueva contraseña" maxLength={64} value={confirmacion} onChange={(e) => setConfirmacion(filtrarContrasena(e.target.value))} required />
                    </div>
                </>
            )}
        </Form>
    );
}

export default PerfilEditor;
