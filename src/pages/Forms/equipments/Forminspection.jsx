import { useState } from "react";
import { Boton } from "../../../components/common/Button";
import { Text, Textarea } from "../../../components/common/forms";
import { formatearFechaCorta } from "../../../components/common/Validations";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function aEstadoInicial(inspeccion) {
    const valores = {};
    const observaciones = {};
    (inspeccion?.answers || []).forEach((a) => {
        if (a.value) valores[`${a.question_id}-${a.day}`] = a.value;
        if (a.observation) observaciones[a.question_id] = a.observation;
    });
    const firmas = {};
    (inspeccion?.signatures || []).forEach((f) => {
        firmas[f.role] = { name: f.name || "", id_number: f.id_number || "" };
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
    errores = [],
}) {
    const [inicial] = useState(() => aEstadoInicial(inspection));
    const [valores, setValores] = useState(inicial.valores);
    const [observaciones, setObservaciones] = useState(inicial.observaciones);
    const [firmas, setFirmas] = useState(inicial.firmas);
    const [headerData, setHeaderData] = useState(inspection?.header_data || {});
    const [generalObs, setGeneralObs] = useState(inspection?.general_observations || "");
    const [aviso, setAviso] = useState("");

    const firmantes = format.signers?.length
        ? format.signers
        : [{ key: "inspector", label: "Realiza la inspección" }];

    const conRespuesta = new Set((inspection?.answers || []).map((a) => a.question_id));
    const preguntasVisibles = (seccion) =>
        seccion.questions.filter((q) => q.is_active || conRespuesta.has(q.id));

    const cambiarValor = (qid, dia, valor) =>
        setValores((prev) => ({ ...prev, [`${qid}-${dia}`]: valor }));
    const cambiarObs = (qid, texto) =>
        setObservaciones((prev) => ({ ...prev, [qid]: texto }));
    const cambiarFirma = (rol, campo, valor) =>
        setFirmas((prev) => ({ ...prev, [rol]: { ...prev[rol], [campo]: valor } }));

    const guardar = () => {
        if (!firmas.inspector?.name?.trim()) {
            setAviso("Escribe el nombre de quien realiza la inspección.");
            return;
        }
        setAviso("");

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
            filas.set(clave, { ...fila, observation: texto.trim() });
        });

        onSave({
            header_data: headerData,
            general_observations: generalObs.trim() || null,
            answers: [...filas.values()],
            signatures: firmantes
                .filter((f) => firmas[f.key]?.name?.trim())
                .map((f) => ({
                    role: f.key,
                    name: firmas[f.key].name.trim(),
                    id_number: firmas[f.key].id_number?.trim() || null,
                })),
        });
    };

    const celda = (qid, dia, seccion) => {
        const valor = valores[`${qid}-${dia}`] || "";
        if (readOnly) return valor;
        return (
            <select
                className="celda-inspeccion"
                value={valor}
                onChange={(e) => cambiarValor(qid, dia, e.target.value)}
            >
                <option value=""></option>
                {seccion.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        );
    };

    return (
        <div>
            <div className="card">
                <table>
                    <tbody className="form">
                        <tr>
                            <td colSpan="6">Datos del equipo</td>
                        </tr>
                        <tr>
                            <td>Equipo:</td>
                            <td>{equipment.name}</td>
                            <td>Código:</td>
                            <td>{equipment.code || "—"}</td>
                            <td>Marca:</td>
                            <td>{equipment.brand}</td>
                        </tr>
                        <tr>
                            <td>Modelo:</td>
                            <td>{equipment.model || "—"}</td>
                            <td>Serie:</td>
                            <td>{equipment.serial_number || "—"}</td>
                            <td>Ubicación:</td>
                            <td>{equipment.ubicacion?.name || "—"}</td>
                        </tr>
                        <tr>
                            <td>Semana:</td>
                            <td>{formatearFechaCorta(weekStart)} al {formatearFechaCorta(weekEnd)}</td>
                            <td>Código del formato:</td>
                            <td>{format.code}</td>
                            <td>Versión:</td>
                            <td>{format.version}</td>
                        </tr>
                    </tbody>
                </table>
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
                                        onChange={(e) =>
                                            setHeaderData((prev) => ({ ...prev, [c.key]: e.target.value }))
                                        }
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <br />
            {format.sections.map((s) => (
                <div key={s.id} className="card">
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
                                        <td>{s.position}.{q.position}</td>
                                        <td>{q.text}</td>
                                        {s.mode === "daily"
                                            ? DIAS.map((_, i) => <td key={i}>{celda(q.id, i + 1, s)}</td>)
                                            : <td>{celda(q.id, 0, s)}</td>}
                                        {s.has_observation && (
                                            <td>
                                                {readOnly ? (
                                                    observaciones[q.id] || ""
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className="celda-obs"
                                                        value={observaciones[q.id] || ""}
                                                        onChange={(e) => cambiarObs(q.id, e.target.value)}
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
            ))}
            <br />

            <div className="card">
                <h3>Observaciones generales</h3>
                {readOnly ? (
                    <p>{generalObs || "—"}</p>
                ) : (
                    <Textarea
                        id="observaciones-generales"
                        name="observaciones-generales"
                        rows={4}
                        placeholder="Observaciones generales de la inspección"
                        value={generalObs}
                        onChange={(e) => setGeneralObs(e.target.value)}
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
                                <p>
                                    {firmas[f.key]?.name || "—"}
                                    {firmas[f.key]?.id_number ? ` · C.C. ${firmas[f.key].id_number}` : ""}
                                </p>
                            ) : (
                                <>
                                    <Text
                                        label="Nombre:"
                                        id={`firma-nombre-${f.key}`}
                                        name={`firma-nombre-${f.key}`}
                                        value={firmas[f.key]?.name || ""}
                                        onChange={(e) => cambiarFirma(f.key, "name", e.target.value)}
                                    />
                                    <Text
                                        label="C.C.:"
                                        id={`firma-cc-${f.key}`}
                                        name={`firma-cc-${f.key}`}
                                        value={firmas[f.key]?.id_number || ""}
                                        onChange={(e) => cambiarFirma(f.key, "id_number", e.target.value)}
                                    />
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <br />

            {aviso && <p className="error-texto">{aviso}</p>}
            {errores.map((m, k) => (
                <p key={k} className="error-texto">{m}</p>
            ))}

            {!readOnly && (
                <div className="btn-container">
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-floppy-disk"
                        texto={enviando ? "Guardando..." : "Guardar inspección"}
                        onClick={guardar}
                    />
                </div>
            )}
        </div>
    );
}