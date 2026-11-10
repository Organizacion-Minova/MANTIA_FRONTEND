import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Boton, BotonLink } from "../../../components/common/Button";
import { PageWelcome } from "../../../components/common/welcome";
import LoadingScreen from "../../../components/LoadingScreen";
import FormatoPapelMaquina from "./formpapermachine";
import { GetMachineRecord } from "../../../api/machinesapi";
import { TIPOS, rutaForm } from "../../../components/common/Formarchine";
import { exportarInspeccionMaquinaPdfUnitario, exportarInspeccionMaquinaExcelUnitario } from "../../../api/machinesapi";

export default function VerRegistroMaquina() {
    const { id, kind, recordId } = useParams();
    const tipo = TIPOS[kind];
    const [registro, setRegistro] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        GetMachineRecord(kind, recordId)
            .then((data) => setRegistro(data))
            .catch((err) => {
                console.error("Error al cargar el registro:", err);
                setError(true);
            })
            .finally(() => setCargando(false));
    }, [kind, recordId]);

    if (!tipo) return <p>Tipo de formato no válido.</p>;
    if (cargando) return <LoadingScreen indeterminado />;
    if (error || !registro) return <p>No se pudo cargar el registro.</p>;

    const fecha = tipo.diario ? registro.week_start : registro.inspection_date;

    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={`${tipo.titulo}: ${registro.machine.name}`}
                    descripcion="Formato diligenciado."
                    mostrarHistorial={true}
                />
            </header>

            <FormatoPapelMaquina kind={kind} record={registro} />

            <div className="btn-container">
                <BotonLink
                    link={`${rutaForm(id, kind, "/complete")}?date=${fecha.slice(0, 10)}`}
                    clase="btn-azul"
                    icono="fa-solid fa-pen"
                    texto="Editar este registro"
                    titulo="Editar este registro"
                />
                <Boton 
                    clase="btn-azul" 
                    icono="fa-solid fa-print" 
                    texto="Imprimir" 
                    onClick={() => window.print()} 
                />
                {kind === "inspection" ? (
                    <>
                        <Boton 
                            clase="btn-azul" 
                            icono="fa-solid fa-file-excel" 
                            texto="Exportar Excel" 
                            onClick={() => exportarInspeccionMaquinaExcelUnitario(recordId, registro.machine.name, fecha.slice(0, 10))} 
                            titulo="Exportar inspección en un archivo de Excel"
                        />
                        <Boton 
                            clase="btn-azul" 
                            icono="fa-solid fa-file-pdf" 
                            texto="Exportar PDF" 
                            onClick={() => exportarInspeccionMaquinaPdfUnitario(recordId, registro.machine.name, fecha.slice(0, 10))} 
                            titulo="Exportar inspección en un archivo PDF"
                        />
                    </>
                ) : (
                    <>
                        <Boton 
                            clase="btn-azul" 
                            icono="fa-solid fa-file-excel" 
                            texto="Exportar Excel" 
                            titulo="Exportar preoperacional en un archivo de Excel"
                        />
                        <Boton 
                            clase="btn-azul" 
                            icono="fa-solid fa-file-pdf" 
                            texto="Exportar PDF" 
                            titulo="Exportar preoperacional en un archivo PDF"
                        />
                    </>
                )}
                <BotonLink
                    link={rutaForm(id, kind, "/records")}
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Formatos guardados"
                    titulo="Ver formatos guardados"
                />
            </div>
        </div>
    );
}