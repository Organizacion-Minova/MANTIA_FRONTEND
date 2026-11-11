import { Fragment, useState } from "react";
import { Boton } from "../../../components/common/Button";
import { Text, Textarea, Select, Dropzone } from "../../../components/common/forms";
import {
    capitalizarPrimeraLetra,
    formatearFechaCorta,
    sinCaracteresEspeciales,
    validarCaracteresEspeciales,
    validarGroserias,
} from "../../../components/common/Validations";
import { useToast } from "../../../context/ToastContext";
import api from "../../../api/axios";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const TIPOS_FIRMA = ["image/png", "image/jpeg"];
const PESO_MAXIMO_FIRMA = 2 * 1024 * 1024;

function urlFirma(firma) {
    if (!firma) return "";
    if (/^(data:|https?:\/\/)/i.test(firma)) return firma;

    const ruta = firma.replace(/^\/+/, "").replace(/^storage\//, "");
    return `${api.defaults.baseURL.replace(/\/+$/, "")}/storage/${ruta}`;
}

function aEstadoInicial(inspeccion) {
    const valores = {};
    const observaciones = {};
    (inspeccion?.answers || []).forEach((a) => {
        if (a.value) valores[`${a.question_id}-${a.day}`] = a.value;
        if (a.observation) observaciones[a.question_id] = a.observation;
    });
    const firmas = {};
    (inspeccion?.signatures || []).forEach((f) => {
        firmas[f.role] = {
            name: f.name || "",
            id_number: f.id_number || "",
            signature: f.signature || "",
        };
    });
    return { valores, observaciones, firmas };
}

export default function FormatoInspeccion({
    format,
    equipment,
    weekStart,
    weekEnd,
    inspection = null,
    readOnly = false,
    onSave,
    enviando = false,
}) {
    const [inicial] = useState(() => aEstadoInicial(inspection));
    const [valores, setValores] = useState(inicial.valores);
    const [observaciones, setObservaciones] = useState(inicial.observaciones);
    const [firmas, setFirmas] = useState(inicial.firmas);
    const [imagenesFirma, setImagenesFirma] = useState({});
    const [headerData, setHeaderData] = useState(inspection?.header_data || {});
    const [generalObs, setGeneralObs] = useState(inspection?.general_observations || "");
    const { advertencia, peligro } = useToast();

    const firmantes = format.signers?.length
        ? format.signers
        : [{ key: "inspector", label: "Realiza la inspección" }];

    const conRespuesta = new Set((inspection?.answers || []).map((a) => a.question_id));
    const preguntasVisibles = (seccion) =>
        seccion.questions.filter((q) => q.is_active || conRespuesta.has(q.id));

    const cambiarValor = (qid, dia, valor) =>
        setValores((prev) => ({ ...prev, [`${qid}-${dia}`]: valor }));
    const cambiarObs = (qid, texto) =>
        setObservaciones((prev) => ({
            ...prev,
            [qid]: capitalizarPrimeraLetra(texto),
        }));
    const cambiarFirma = (rol, campo, valor) =>
        setFirmas((prev) => ({ ...prev, [rol]: { ...prev[rol], [campo]: valor } }));
    const cambiarImagenFirma = (rol) => (e) => {
        const archivo = e.target.files[0];
        e.target.value = "";
        if (!archivo) return;
        if (!TIPOS_FIRMA.includes(archivo.type)) {
            advertencia("La firma debe ser una imagen PNG o JPG.");
            return;
        }
        if (archivo.size > PESO_MAXIMO_FIRMA) {
            advertencia("La firma es demasiado pesada (máx. 2 MB).");
            return;
        }

        const lector = new FileReader();
        lector.onload = () => {
            setImagenesFirma((prev) => ({ ...prev, [rol]: archivo }));
            cambiarFirma(rol, "signature", lector.result);
        };
        lector.onerror = () => peligro("No se pudo leer la imagen de la firma.");
        lector.readAsDataURL(archivo);
    };

    const guardar = () => {
        const problemas = [];
        const camposTexto = [
            ...(format.header_fields || []).map((campo) => ({
                key: `header-${campo.key}`,
                nombre: `El campo «${campo.label}»`,
                valor: headerData[campo.key] || "",
            })),
            ...firmantes.map((firmante) => ({
                key: `firma-${firmante.key}`,
                nombre: `El nombre del firmante «${firmante.label}»`,
                valor: firmas[firmante.key]?.name || "",
            })),
            ...Object.entries(observaciones).map(([qid, valor]) => ({
                key: `observacion-${qid}`,
                nombre: "La observación",
                valor,
            })),
            {
                key: "observaciones-generales",
                nombre: "Las observaciones generales",
                valor: generalObs,
            },
        ];
        const camposSinCaracteresEspeciales = Object.fromEntries(
            firmantes.map((firmante) => [
                `firma-${firmante.key}`,
                firmas[firmante.key]?.name || "",
            ])
        );
        const erroresCaracteresEspeciales = validarCaracteresEspeciales(
            camposSinCaracteresEspeciales
        );
        firmantes.forEach((firmante) => {
            if (erroresCaracteresEspeciales[`firma-${firmante.key}`]) {
                problemas.push(
                    `El nombre del firmante «${firmante.label}» solo puede contener letras, números y espacios.`
                );
            }
        });

        const erroresGroserias = validarGroserias(
            Object.fromEntries(camposTexto.map(({ key, valor }) => [key, valor]))
        );
        camposTexto.forEach(({ key, nombre }) => {
            if (erroresGroserias[key]) {
                problemas.push(`${nombre} contiene palabras inapropiadas.`);
            }
        });

        (format.header_fields || []).forEach((campo) => {
            if (!headerData[campo.key]?.trim()) {
                problemas.push(`Completa el campo «${campo.label}».`);
            }
        });
        firmantes.forEach((firmante) => {
            const firma = firmas[firmante.key];
            if (!firma?.name?.trim()) {
                problemas.push(`Escribe el nombre del firmante «${firmante.label}».`);
            }
            if (!firma?.id_number?.trim()) {
                problemas.push(`Escribe el número de C.C. del firmante «${firmante.label}».`);
            } else if (!/^\d+$/.test(firma.id_number.trim())) {
                problemas.push(`El número de C.C. del firmante «${firmante.label}» debe contener solo números.`);
            }
        });

        if (problemas.length > 0) {
            advertencia(problemas.join(" "), "Revisa los datos obligatorios");
            return;
        }

        const filas = new Map();
        Object.entries(valores).forEach(([clave, valor]) => {
            if (!valor) return;
            const [qid, dia] = clave.split("-").map(Number);
            filas.set(clave, { question_id: qid, day: dia, value: valor, observation: null });
        });
        Object.entries(observaciones).forEach(([qid, texto]) => {
            if (!texto.trim()) return;
            const clave = `${qid}-0`;
            const fila = filas.get(clave) || { question_id: Number(qid), day: 0, value: null };
            filas.set(clave, {
                ...fila,
                observation: capitalizarPrimeraLetra(texto.trim()),
            });
        });

        onSave({
            header_data: Object.fromEntries(
                (format.header_fields || []).map((campo) => [
                    campo.key,
                    capitalizarPrimeraLetra(headerData[campo.key].trim()),
                ])
            ),
            general_observations: capitalizarPrimeraLetra(generalObs.trim()) || null,
            answers: [...filas.values()],
            signatures: firmantes
                .map((f) => ({
                    role: f.key,
                    name: capitalizarPrimeraLetra(firmas[f.key].name.trim()),
                    id_number: firmas[f.key].id_number.trim(),
                })),
            signature_images: imagenesFirma,
        });
    };

    const celda = (qid, dia, seccion) => {
        const valor = valores[`${qid}-${dia}`] || "";
        if (readOnly) return valor;
        return (
            <Select
                value={valor}
                onChange={(e) => cambiarValor(qid, dia, e.target.value)}
                opciones={[
                    { valor: "", etiqueta: "" },
                    ...seccion.options.map((opcion) => ({
                        valor: opcion, etiqueta: opcion,
                    })),
                ]}
            />
        );
    };

    return (
        <div>
            <div className="card">
                <div className="table-responsive">
                    <table>
                        <tbody className="form">
                            <tr>
                                <th colSpan="6">Datos del equipo</th>
                            </tr>
                            <tr>
                                <th>Equipo:</th>
                                <td>{equipment.name}</td>
                                <th>Código:</th>
                                <td>{equipment.code || "—"}</td>
                                <th>Marca:</th>
                                <td>{equipment.brand}</td>
                            </tr>
                            <tr>
                                <th>Modelo:</th>
                                <td>{equipment.model || "—"}</td>
                                <th>Serie:</th>
                                <td>{equipment.serial_number || "—"}</td>
                                <th>Ubicación:</th>
                                <td>{equipment.ubicacion?.name || "—"}</td>
                            </tr>
                            <tr>
                                <th>Semana:</th>
                                <td>{formatearFechaCorta(weekStart)} al {formatearFechaCorta(weekEnd)}</td>
                                <th>Código del formato:</th>
                                <td>{format.code}</td>
                                <th>Versión:</th>
                                <td>{format.version}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <br />
                
                {(format.header_fields || []).length > 0 && (
                    <div className="form-grid">
                        {format.header_fields.map((c) => (
                            <div key={c.key} className="col-span-3">
                                {readOnly ? (
                                    <p><strong>{c.label}:</strong> {headerData[c.key] || "—"}</p>
                                ) : (
                                    <Text
                                        label={`${c.label}:`}
                                        id={`header-${c.key}`}
                                        name={`header-${c.key}`}
                                        value={headerData[c.key] || ""}
                                        required
                                        maxLength={255}
                                        onChange={(e) => setHeaderData((prev) => ({
                                            ...prev,
                                            [c.key]: capitalizarPrimeraLetra(e.target.value),
                                        }))}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <br />
            {format.sections.map((s, index) => (
                <Fragment key={s.id}>
                    <div className="card">
                        <h3>{s.position}. {s.title}</h3>
                        {s.instructions && <p>{s.instructions}</p>}
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>N.°</th>
                                        <th>Pregunta</th>
                                        {s.mode === "daily"
                                            ? DIAS.map((d) => <th key={d}>{d}</th>)
                                            : <th>Respuesta</th>}
                                        {s.has_observation && <th>Observaciones</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {preguntasVisibles(s).map((q) => (
                                        <tr key={q.id}>
                                            <th>{s.position}.{q.position}</th>
                                            <td>{q.text}</td>
                                            {s.mode === "daily"
                                                ? DIAS.map((_, i) => <td key={i}>{celda(q.id, i + 1, s)}</td>)
                                                : <td>{celda(q.id, 0, s)}</td>}
                                            {s.has_observation && (
                                                <td>
                                                    {readOnly ? (
                                                        observaciones[q.id] || ""
                                                    ) : (
                                                        <Text
                                                          value={observaciones[q.id] || ""}
                                                          onChange={(e) => cambiarObs(q.id, e.target.value)}
                                                          maxLength={255}
                                                        />
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {index < format.sections.length - 1 && <br />}
                </Fragment>
            ))}
            <br />

            <div className="card">
                <h3>Observaciones generales (Opcional)</h3>
                {readOnly ? (
                    <p>{generalObs || "—"}</p>
                ) : (
                    <Textarea
                        id="observaciones-generales"
                        name="observaciones-generales"
                        rows={4}
                        placeholder="Observaciones generales de la inspección"
                        value={generalObs}
                        onChange={(e) => setGeneralObs(capitalizarPrimeraLetra(e.target.value))}
                    />
                )}
            </div>
            <br />

            <div className="card">
                <h3>Firmas</h3>
                <div className="form-grid">
                    {firmantes.map((f) => (
                        <div key={f.key} className="col-span-3">
                            <h4>{f.label}</h4>
                            {readOnly ? (
                                <>
                                    {firmas[f.key]?.signature && (
                                        <img
                                            src={urlFirma(firmas[f.key].signature)}
                                            alt={`Firma de ${f.label}`}
                                            style={{ display: "block", maxWidth: "100%", maxHeight: "120px", marginBottom: "0.5rem" }}
                                        />
                                    )}
                                    <p>
                                        {firmas[f.key]?.name || "—"}
                                        {firmas[f.key]?.id_number ? ` · C.C. ${firmas[f.key].id_number}` : ""}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Text
                                        label="Nombre:"
                                        id={`firma-nombre-${f.key}`}
                                        name={`firma-nombre-${f.key}`}
                                        value={firmas[f.key]?.name || ""}
                                        required
                                        maxLength={255}
                                        onChange={(e) => {
                                            const valor = e.target.value;
                                            if (valor === "" || sinCaracteresEspeciales(valor)) {
                                                cambiarFirma(
                                                    f.key,
                                                    "name",
                                                    capitalizarPrimeraLetra(valor)
                                                );
                                            }
                                        }}
                                    />
                                    <Text
                                        label="C.C.:"
                                        id={`firma-cc-${f.key}`}
                                        name={`firma-cc-${f.key}`}
                                        value={firmas[f.key]?.id_number || ""}
                                        placeholder="Solo números"
                                        required
                                        maxLength={30}
                                        onChange={(e) => cambiarFirma(f.key, "id_number", e.target.value)}
                                    />
                                    <Dropzone
                                        label="Firma:"
                                        id={`firma-imagen-${f.key}`}
                                        name={`firma-imagen-${f.key}`}
                                        accept="image/png,image/jpeg"
                                        ayuda="PNG o JPG, hasta 2 MB"
                                        preview={urlFirma(firmas[f.key]?.signature)}
                                        previewAlt={`Vista previa de la firma de ${f.label}`}
                                        previewLabel={`Firma de ${f.label}`}
                                        onChange={cambiarImagenFirma(f.key)}
                                        required
                                    />
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <br />


            {!readOnly && (
                <div className="btn-container">
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-floppy-disk"
                        texto={enviando ? "Guardando..." : "Guardar inspección"}
                        onClick={guardar}
                        titulo="Guardar inspección"
                    />
                </div>
            )}
        </div>
    );
}