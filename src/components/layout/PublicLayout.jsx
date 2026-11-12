import TopbarPublic from "./TopbarPublic.jsx";
import FooterPublic from "./FooterPublic.jsx";
import "../../styles/variables.css";
import "../../styles/index.css";
import AccessibilityPanel from "../accessibility/AccessibilityPanel";
function PublicLayout({ children }) {
  return (
    <div className="mt-app">
      <TopbarPublic solid />
      <main className="mt-main" style={{ display: "block", width: "100%" }}>{children}</main>
      <AccessibilityPanel />
      <FooterPublic />
    </div>
  );
}

export default PublicLayout;