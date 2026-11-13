import { useState } from "react";
import { Boton } from "../../../components/common/Button";
import { Text, Textarea, Dropzone, Select, Date } from "../../../components/common/forms";
import {
    capitalizarPrimeraLetra,
    formatearFechaCorta,
    validarGroserias,
    sinCaracteresEspeciales
} from "../../../components/common/Validations";
import { urlImagen } from "../../../utils/imagenes";
import { TIPOS, DIAS, OPCIONES, letraSeccion, numerarPreguntas } from "../../../components/common/Formarchine";
import { useToast } from "../../../context/ToastContext";

const NUM_DIAS = [1, 2, 3, 4, 5, 6, 7];
const TIPOS_FIRMA = ["image/png", "image/jpeg"];
const PESO_MAXIMO_FIRMA = 2 * 1024 * 1024;

function estadoInicial(record, diario) {
    const valores = {};
    const observaciones = {};
    (record?.answers || []).forEach((a) => {
        if (a.value) valores[`${a.question_id}-${diario ? a.day : 0}`] = a.value;
        if (a.observation) observaciones[a.question_id] = a.observation;
    });
    return { valores, observaciones };
}

export default function FormularioRegistroMaquina({
    kind, machine, format, start, end, record, onSave, enviando,
}) {
    const diario = TIPOS[kind].diario;
    const columnas = diario ? 2 + NUM_DIAS.length : 4;

    const [valores, setValores] = useState(() => estadoInicial(record, diario).valores);
    const [observaciones, setObservaciones] = useState(() => estadoInicial(record, diario).observaciones);
    const [inspector, setInspector] = useState(record?.inspector || "");
    const [area, setArea] = useState(record?.area || "");
    const [duracion, setDuracion] = useState(record?.duration_minutes ?? "");
    const [revisor, setRevisor] = useState(record?.reviewed_by || "");
    const [fechaRevision, setFechaRevision] = useState(record?.review_date ? record.review_date.slice(0, 10) : "");
    const [generalObs, setGeneralObs] = useState(record?.general_observations || "");
    const [imagen, setImagen] = useState(null);   // { file, preview }
    const { advertencia } = useToast();

    const cambiar = (qid, dia, valor) =>
        setValores((prev) => ({ ...prev, [`${qid}-${dia}`]: valor }));

    const cambiarImagen = (e) => {
        const archivo = e.target?.files?.[0] || e.dataTransfer?.files?.[0];
        if (!archivo) return;

        if (!TIPOS_FIRMA.includes(archivo.type)) {
            advertencia("La firma debe ser una imagen PNG o JPG.");
            return;
        }
        if (archivo.size > PESO_MAXIMO_FIRMA) {
            advertencia("La firma es demasiado pesada (máx. 2 MB).");
            return;
        }

        if (imagen?.preview) URL.revokeObjectURL(imagen.preview);
        setImagen({ file: archivo, preview: URL.createObjectURL(archivo) });
    };

    const quitarImagen = () => {
        if (imagen?.preview) URL.revokeObjectURL(imagen.preview);
        setImagen(null);
    };

    const guardar = () => {
        const problemas = [];
        const camposTexto = [
            { campo: "inspector", nombre: "Persona que inspecciona", valor: inspector },
            { campo: "area", nombre: "Área", valor: area },
            { campo: "revisor", nombre: "Revisó", valor: revisor },
            { campo: "generalObs", nombre: "Observaciones generales", valor: generalObs },
            ...Object.entries(observaciones).map(([id, valor]) => ({
                campo: `observacion-${id}`,
                nombre: "Observaciones",
                valor,
            })),
        ];
        const erroresGroserias = validarGroserias(
            Object.fromEntries(camposTexto.map(({ campo, valor }) => [campo, valor]))
        );
        Object.keys(erroresGroserias).forEach((campo) => {
            const { nombre } = camposTexto.find((texto) => texto.campo === campo);
            problemas.push(`${nombre} contiene palabras inapropiadas.`);
        });
        if (!inspector.trim()) {
            problemas.push("Escribe el nombre de quien inspecciona.");
        }
        if (!area.trim()) problemas.push("Escribe el área.");
        const textoDuracion = String(duracion).trim();
        const minutos = Number(textoDuracion);
        if (!textoDuracion) {
            problemas.push("Escribe la duración en minutos.");
        } else if (!/^\d+$/.test(textoDuracion) || !Number.isSafeInteger(minutos) || minutos < 1) {
            problemas.push("La duración debe ser un número mayor que cero.");
        }
        if (!revisor.trim()) problemas.push("Escribe quién revisó.");
        if (!fechaRevision) problemas.push("Selecciona la fecha de revisión.");
        if (!imagen && !record?.signature) {
            problemas.push("Adjunta la imagen de la firma.");
        }
        if (problemas.length > 0) {
            advertencia(problemas.join(" "), "Revisa los datos obligatorios");
            return;
        }

        let answers;
        if (diario) {
            answers = Object.entries(valores)
                .filter(([, valor]) => valor)
                .map(([clave, value]) => {
                    const [question_id, day] = clave.split("-").map(Number);
                    return { question_id, day, value };
                });
        } else {
            const ids = new Set([
                ...Object.keys(valores).map((k) => Number(k.split("-")[0])),
                ...Object.keys(observaciones).map(Number),
            ]);
            answers = [...ids]
                .map((qid) => ({
                    question_id: qid,
                    value: valores[`${qid}-0`] || null,
                    observation: observaciones[qid]?.trim() || null,
                }))
                .filter((a) => a.value || a.observation);
        }

        onSave({
            inspector: inspector.trim(),
            area: area.trim() || null,
            duration_minutes: duracion === "" ? null : Number(duracion),
            reviewed_by: revisor.trim() || null,
            review_date: fechaRevision || null,
            general_observations: generalObs.trim() || null,
            answers,
            signature_image: imagen?.file || null,
        });
    };

    const celdas = (q) =>
        (diario ? NUM_DIAS : [0]).map((dia) => (
            <td key={dia} className="celda-letra">
                <Select
                    value={valores[`${q.id}-${dia}`] || ""}
                    onChange={(e) => cambiar(q.id, dia, e.target.value)}
                    opciones={[{ valor: "", etiqueta: "" }, ...OPCIONES.map((o) => ({ valor: o, etiqueta: o }))]}
                />
            </td>
        ));

    return (
        <div>
            <div className="card">
                <div className="table-responsive">
                <table className="form">
                    <tbody>
                        <tr>
                            <th>Máquina:</th>
                            <td>{machine.name}</td>
                            <th>Código:</th>
                            <td>{machine.code || "—"}</td>
                            <th>{diario ? "Semana:" : "Fecha:"}</th>
                            <td >
                                {diario
                                    ? `del ${formatearFechaCorta(start)} al ${formatearFechaCorta(end)}`
                                    : formatearFechaCorta(start)}
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>
                <br />

                <div className="form-grid">
                    <div className="col-span-3">
                        <Text 
                            label="Persona que inspecciona:" 
                            id="inspector" 
                            name="inspector"
                            value={inspector} 
                            onChange={(e) =>{
                                const valor = e.target.value;
                                if (valor === "" || sinCaracteresEspeciales(valor)){ 
                                    setInspector(capitalizarPrimeraLetra(valor))}
                                }
                                } 
                            maxLength={255}
                            required
                        />
                    </div>
                    <div className="col-span-3">
                        <Text 
                            label="Área:" 
                            id="area" 
                            name="area"
                            value={area} 
                            onChange={(e) => {
                                const valor = e.target.value;
                                if (valor === "" || sinCaracteresEspeciales(valor)){ 
                                    setArea(capitalizarPrimeraLetra(valor))}
                                }
                                } 
                            maxLength={255}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <Text 
                            label="Duración (minutos):" 
                            id="duracion" 
                            name="duracion" 
                            type="number"
                            min={1}
                            step={1}
                            value={duracion} 
                            onChange={(e) => {
                                const valor = e.target.value;
                                if (valor === "" || /^\d+$/.test(valor)) setDuracion(valor);
                            }}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <Text 
                            label="Revisó:" 
                            id="revisor" 
                            name="revisor"
                            value={revisor} 
                            onChange={(e) => {
                                const valor = e.target.value;
                                if (valor === "" || sinCaracteresEspeciales(valor)){ 
                                    setRevisor(capitalizarPrimeraLetra(valor))}
                                }
                                } 
                            maxLength={255}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <Date
                            label="Fecha de revisión:" 
                            id="fecha-revision" 
                            name="fecha-revision" 
                            type="date"
                            value={fechaRevision} 
                            onChange={(e) => setFechaRevision(e.target.value)} 
                            required
                        />
                    </div>
                </div>
            </div>
            <br />

            {format.sections.map((s) => (
                <>
                <div key={s.id} className="card">
                    <h3>{letraSeccion(s.position)}. {s.title}</h3>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>N.°</th>
                                    <th>Aspectos a verificar</th>
                                    {diario
                                        ? DIAS.map((d) => <th key={d}>{d}</th>)
                                        : <><th>Respuesta</th><th>Observaciones</th></>}
                                </tr>
                            </thead>
                            <tbody>
                                {numerarPreguntas(s.questions).map((f) =>
                                    f.type === "group" ? (
                                        <tr key={f.id} className="fila-grupo">
                                            <td>{f.numero}</td>
                                            <td colSpan={columnas - 1}>{f.text}</td>
                                        </tr>
                                    ) : (
                                        <tr key={f.id}>
                                            <td>{f.numero}</td>
                                            <td>{f.text}</td>
                                            {celdas(f)}
                                            {!diario && (
                                                <td>
                                                    <Text
                                                        className="celda-obs"
                                                        value={observaciones[f.id] || ""}
                                                        onChange={(e) => setObservaciones((prev) => ({
                                                            ...prev,
                                                            [f.id]: capitalizarPrimeraLetra(e.target.value),
                                                        }))}
                                                        maxLength={255}
                                                    />
                                                </td>
                                            )}
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <br />
                </>
            ))}

            <div className="card">
                <Textarea
                    label="Observaciones generales (opcional):"
                    id="observaciones-generales"
                    name="observaciones-generales"
                    rows={4}
                    value={generalObs}
                    onChange={(e) => setGeneralObs(capitalizarPrimeraLetra(e.target.value))}
                />
            </div>
            <br />

            <div className="card">
                <Dropzone
                    label="Firma del responsable (imagen):"
                    id="firma"
                    name="firma"
                    accept="image/png,image/jpeg"
                    ayuda="PNG o JPG, hasta 2 MB"
                    onChange={cambiarImagen}
                    onFileDrop={cambiarImagen}
                    onRemove={imagen ? quitarImagen : undefined}
                    preview={imagen?.preview || urlImagen(record?.signature)}
                    previewAlt="Firma del responsable"
                    previewLabel={imagen?.file.name || "Firma guardada"}
                    required
                />
            </div>

            <br />

            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-floppy-disk"
                    texto={enviando ? "Guardando..." : "Guardar"}
                    onClick={guardar}
                    titulo="Guardar el registro de inspección"
                />
            </div>
        </div>
    );
}