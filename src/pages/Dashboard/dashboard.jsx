import { PageWelcome } from "../../components/common/welcome";
import AlertsBanner from "../../components/dashboard/AlertsBanner";
import DashboardSummarySection from "../../components/dashboard/DashboardSummarySection";  
import DashboardInsightsSection from "../../components/dashboard/DashboardInsightsSection";
import DashboardLookupSection from "../../components/dashboard/DashboardLookupSection";



export default function Dashboard() {
  return (
    <div className="dashboard-grid">
      <PageWelcome 
        titulo="Panel poderoso de control OMG"
        descripcion="Monitorea todas tus actividades 100% real no fake"
      />
      <AlertsBanner criticalCount={null} />
      <DashboardSummarySection />
      <DashboardInsightsSection />
      <DashboardLookupSection />
    </div>
  );
}

