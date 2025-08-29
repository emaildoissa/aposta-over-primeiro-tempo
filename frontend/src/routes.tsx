import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import SmartGameDutch from "./components/PrimaryBetForm";
import MarkBetResult from "./components/MarkBetResult";
import Dashboard from "./components/Dashboard/Dashboard";

// Menu superior para navegação entre telas
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <nav
        style={{
          display: "flex",
          background: "#fff",
          boxShadow: "0 2px 8px #0001",
          padding: "0 22px",
          alignItems: "center",
          gap: 24,
          minHeight: 60,
          marginBottom: 28,
          borderRadius: "0 0 16px 16px",
        }}
      >
        <span style={{
          fontWeight: 700,
          fontSize: 20,
          color: "#2274a5",
          letterSpacing: "1.5px",
        }}>
          BetAnalyzer
        </span>
        <NavLink
          to="/"
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive ? "#2274a5" : "#232a31",
            borderBottom: isActive ? "2.5px solid #2274a5" : "2.5px solid transparent",
            fontWeight: isActive ? 700 : 500,
            padding: "7px 0",
            fontSize: "1.05rem",
            transition: "border 0.2s",
          })}
          end
        >
          Cadastro Inteligente
        </NavLink>
        <NavLink
          to="/dashboard"
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive ? "#2274a5" : "#232a31",
            borderBottom: isActive ? "2.5px solid #2274a5" : "2.5px solid transparent",
            fontWeight: isActive ? 700 : 500,
            padding: "7px 0",
            fontSize: "1.05rem",
            transition: "border 0.2s",
          })}
        >
          Dashboard
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={
          <div>
            <SmartGameDutch />
          </div>
        } />
        <Route path="/markresult" element={<MarkBetResult />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
