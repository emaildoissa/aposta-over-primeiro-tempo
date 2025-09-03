// src/App.tsx
import { DataProvider } from './contexts/DataContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './components/Menu/Menu';
import Dashboard from './components/Dashboard/Dashboard';
import PrimaryBetForm from './components/PrimaryBetForm';
import RecoveryBetForm from './components/RecoveryBetForm';
import Backtester from './components/Backtester'; 
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './components/RegisterPage';
function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Menu />
        <main style={{ padding: '20px' }}>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<LoginPage />} />
             <Route path="/register" element={<RegisterPage />} />

            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cadastro" element={<PrimaryBetForm />} />
              <Route path="/recovery" element={<RecoveryBetForm />} />
              <Route path="/backtesting" element={<Backtester />} />
            </Route>
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;