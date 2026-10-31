import { formatearFechaCorta } from "../../../components/common/Validations";

const DIAS = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];

export default function FormatoPapel({ format, equipment, weekStart, weekEnd, inspection }) {
    const valores = {};
    const observaciones = {};
    (inspection?.answers || []).forEach((a) => {
        if (a.value) valores[`${a.question_id}-${a.day}`] = a.value;
        if (a.observation) observaciones[a.question_id] = a.observation;
    });

    const firmas = {};
    (inspection?.signatures || []).forEach((f) => {
        firmas[f.role] = f;
    });

    const headerData = inspection?.header_data || {};
    const generalObs = inspection?.general_observations || "";

    const firmantes = format.signers?.length
        ? format.signers
        : [{ key: "inspector", label: "Realiza la inspección" }];

    const conRespuesta = new Set((inspection?.answers || []).map((a) => a.question_id));
    const preguntasVisibles = (s) =>
        s.questions.filter((q) => q.is_active || conRespuesta.has(q.id));

    const celdasPregunta = (s, q) => {
        const dias = s.mode === "daily" ? [1, 2, 3, 4, 5, 6, 7] : [0];
        return dias.flatMap((dia) => {
            const valor = valores[`${q.id}-${dia}`] || "";

            if (s.marking === "columns") {
                return s.options.map((op) => (
                    <td key={`${dia}-${op}`} className="celda-x">
                        {valor === op ? "X" : ""}
                    </td>
                ));
            }

            return [
                <td key={dia} className="celda-letra">{valor}</td>,
            ];
        });
    };

    return (
        <div className="table-responsive">
            <table className="form">
                <tbody>
                    <tr>
                        <td rowSpan="3" colSpan="2">
                            <img className="logoSena" src="/src/assets/img/sena-logo-naranja.png" alt="SENA" />
                        </td>
                        <td rowSpan="3" colSpan="2">
                            INSPECCIÓN PREOPERACIONAL<br />{equipment.name.toUpperCase()}
                        </td>
                        <th>Código</th>
                        <td>{format.code || ""}</td>
                    </tr>
                    <tr>
                        <th>Versión</th>
                        <td>{format.version || ""}</td>
                    </tr>
                    <tr>
                        <th>Vigente desde</th>
                        <td>{format.valid_from ? formatearFechaCorta(format.valid_from) : ""}</td>
                    </tr>
                    <tr>
                        <th>Equipo</th><td>{equipment.name}</td>
                        <th>Marca</th><td>{equipment.brand || "—"}</td>
                        <th>Modelo</th><td>{equipment.model || "—"}</td>
                    </tr>
                    <tr>
                        <th>Serie</th><td>{equipment.serial_number || "—"}</td>
                        <th>Ubicación</th><td>{equipment.ubicacion?.name || "—"}</td>
                        <th>Cód. equipo</th><td>{equipment.code || "—"}</td>
                    </tr>
                    <tr>
                        <th>Semana</th>
                        <td colSpan="5">
                            del {formatearFechaCorta(weekStart)} al {formatearFechaCorta(weekEnd)}
                        </td>
                    </tr>
                    {(format.header_fields || []).map((c) => (
                        <tr key={c.key}>
                            <th>{c.label}</th>
                            <td colSpan="5">{headerData[c.key] || "—"}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="6">
                            {format.sections.map((s) => {
                                const diario = s.mode === "daily";
                                const porColumnas = s.marking === "columns";
                                const dosFilas = diario || porColumnas;
                                const rs = dosFilas ? 2 : 1;
                                return (
                                        <table key={s.id}>
                                            <tbody >
                                                <tr>
                                                    <th rowSpan={rs}>N.°</th>
                                                    <th rowSpan={rs}>{s.position}. {s.title}. ({s.instructions})</th>
                                                    {diario && porColumnas && DIAS.map((d) => (
                                                        <th key={d} colSpan={s.options.length}>{d}</th>
                                                    ))}
                                                    {diario && !porColumnas && <th colSpan="7">DÍAS</th>}
                                                    {!diario && porColumnas && <th colSpan={s.options.length}>RESPUESTA</th>}
                                                    {!diario && !porColumnas && <th>RESPUESTA</th>}
                                                    {s.has_observation && <th rowSpan={rs}>OBSERVACIONES</th>}
                                                </tr>
                                                {dosFilas && (
                                                    <tr>
                                                        {diario && porColumnas && DIAS.flatMap((d) =>
                                                            s.options.map((o) => <th key={`${d}-${o}`}>{o}</th>)
                                                        )}
                                                        {diario && !porColumnas && DIAS.map((d) => <th key={d}>{d}</th>)}
                                                        {!diario && porColumnas && s.options.map((o) => <th key={o}>{o}</th>)}
                                                    </tr>
                                                )}
                                                {preguntasVisibles(s).map((q) => (
                                                    <tr key={q.id}>
                                                        <td className="col-num">{s.position}.{q.position}</td>
                                                        <td className="col-desc">{q.text}</td>
                                                        {celdasPregunta(s, q)}
                                                        {s.has_observation && <td>{observaciones[q.id] || ""}</td>}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                );
                            })}
                        </td>
                    </tr>
                    <tr>
                        <th colSpan="6">OBSERVACIONES</th>
                    </tr>
                    <tr>
                        <td colSpan="6">{generalObs}</td>
                    </tr>
                    <tr>
                        <td colSpan="6">
                            <table className="form">
                                <tbody>
                                    <tr>
                                        <th></th>
                                        {firmantes.map((f) => <th key={f.key}>{f.label}</th>)}
                                    </tr>
                                    <tr>
                                        <th>FIRMA</th>
                                        {firmantes.map((f) => <td key={f.key} ></td>)}
                                    </tr>
                                    <tr>
                                        <th>NOMBRE</th>
                                        {firmantes.map((f) => <td key={f.key}>{firmas[f.key]?.name || ""}</td>)}
                                    </tr>
                                    <tr>
                                        <th>C.C.</th>
                                        {firmantes.map((f) => <td key={f.key}>{firmas[f.key]?.id_number || ""}</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                
                </tbody>     
            </table>

            {/* Firmas */}
            
        </div>
    );
}