import { formatearFechaCorta } from "../../../components/common/Validations";
import { urlImagen } from "../../../utils/imagenes";
import { TIPOS, DIAS, OPCIONES, letraSeccion, numerarPreguntas } from "../../../components/common/Formarchine";

const NUM_DIAS = [1, 2, 3, 4, 5, 6, 7];

export default function FormatoPapelMaquina({ kind, record }) {
    const tipo = TIPOS[kind];
    const diario = tipo.diario;
    const { machine, format } = record;
    const columnas = diario ? 2 + NUM_DIAS.length * OPCIONES.length : 3 + OPCIONES.length;

    const valores = {};
    const observaciones = {};
    record.answers.forEach((a) => {
        if (a.value) valores[`${a.question_id}-${diario ? a.day : 0}`] = a.value;
        if (a.observation) observaciones[a.question_id] = a.observation;
    });
    const respondidas = new Set(record.answers.map((a) => a.question_id));

    const marca = (qid, dia, opcion) => (valores[`${qid}-${dia}`] === opcion ? "X" : "");

    return (
        <div className="table-responsive">
            <table className="form">
                <tbody>
                    <tr>
                        <td rowSpan="3" colSpan='2'>
                            <img className="logoSena" src="/src/assets/img/sena-logo-naranja.png" alt="SENA" />
                        </td>
                        <td rowSpan="3" colSpan="2">
                            {tipo.formato}<br />{machine.name.toUpperCase()}
                        </td>
                        <th>Código</th>
                        <td>{format.code || ""}</td>
                    </tr>
                    <tr>
                        <th>Versión</th>
                        <td>{format.version || ""}</td>
                    </tr>
                    <tr>
                        <th>Fecha</th>
                        <td>{format.valid_from ? formatearFechaCorta(format.valid_from) : ""}</td>
                    </tr>
                    <tr>
                        <th>{diario ? "Semana" : "Fecha de inspección"}</th>
                        <td>
                            {diario
                                ? `del ${formatearFechaCorta(record.week_start)} al ${formatearFechaCorta(record.week_end)}`
                                : formatearFechaCorta(record.inspection_date)}
                        </td>
                        <th>Persona que inspecciona</th>
                        <td>{record.inspector}</td>
                        <th>Nombre del equipo</th>
                        <td>{machine.name}</td>
                    </tr>
                    <tr>
                        <th>Duración</th>
                        <td>{record.duration_minutes != null ? `${record.duration_minutes} min` : "—"}</td>
                        <th>Área</th>
                        <td>{record.area || "—"}</td>
                        <th>Revisó</th>
                        <td>
                            {record.reviewed_by || "—"}
                            {record.review_date ? ` (${formatearFechaCorta(record.review_date)})` : ""}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan='6'>
                            {format.sections.map((s) => {
                                const filas = numerarPreguntas(
                                    s.questions.filter((q) => q.is_active || respondidas.has(q.id))
                                );

                                return (
                                    <table key={s.id} className="form">
                                        <tbody>
                                            <tr>
                                                <th colSpan={columnas} className="titulo-seccion">
                                                    {letraSeccion(s.position)}. {s.title}
                                                </th>
                                            </tr>
                                            {diario ? (
                                                <>
                                                    <tr>
                                                        <th rowSpan="2" className="col-num">N.°</th>
                                                        <th rowSpan="2" className="col-desc">Aspectos a verificar</th>
                                                        {DIAS.map((d) => <th key={d} colSpan={OPCIONES.length}>{d}</th>)}
                                                    </tr>
                                                    <tr>
                                                        {DIAS.flatMap((d) =>
                                                            OPCIONES.map((o) => <th key={`${d}-${o}`}>{o}</th>)
                                                        )}
                                                    </tr>
                                                </>
                                            ) : (
                                                <tr>
                                                    <th className="col-num">N.°</th>
                                                    <th className="col-desc">Aspectos a verificar</th>
                                                    {OPCIONES.map((o) => <th key={o}>{o}</th>)}
                                                    <th>Observaciones</th>
                                                </tr>
                                            )}
                                        
                                            {filas.map((f) =>
                                                f.type === "group" ? (
                                                    <tr key={f.id} className="fila-grupo">
                                                        <td className="col-num">{f.numero}</td>
                                                        <td colSpan={columnas - 1}>{f.text}</td>
                                                    </tr>
                                                ) : (
                                                    <tr key={f.id}>
                                                        <td className="col-num">{f.numero}</td>
                                                        <td className="col-desc">{f.text}</td>
                                                        {diario
                                                            ? NUM_DIAS.flatMap((dia) =>
                                                                OPCIONES.map((o) => (
                                                                    <td key={`${dia}-${o}`} className="celda-x">{marca(f.id, dia, o)}</td>
                                                                ))
                                                            )
                                                            : [
                                                                ...OPCIONES.map((o) => (
                                                                    <td key={o} className="celda-x">{marca(f.id, 0, o)}</td>
                                                                )),
                                                                <td key="obs">{observaciones[f.id] || ""}</td>,
                                                            ]}
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                );
                            })}
                        </td>
                    </tr>
                    <tr>
                        <th colSpan='6'>OBSERVACIONES</th>
                    </tr>
                    <tr>
                        <td colSpan='6'>
                            {record.general_observations || ""}
                        </td>
                    </tr>
                    <tr>
                        <th colSpan='3'>FIRMA RESPONSABLE</th>
                        <th colSpan='3'>NOMBRE</th>
                    </tr>
                    <tr>
                        <td colSpan='3'>
                            {record.signature && (
                                <img src={urlImagen(record.signature)} alt="Firma" 
                                style={{ maxWidth: "150px", maxHeight: "80px" }}
                                 />
                            )}
                        </td>
                        <td colSpan='3'>{record.inspector}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}