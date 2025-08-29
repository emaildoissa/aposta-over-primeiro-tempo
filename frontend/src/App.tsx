// src/App.tsx
import { DataProvider } from './contexts/DataContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './components/Menu/Menu';
import Dashboard from './components/Dashboard/Dashboard';
import PrimaryBetForm from './components/PrimaryBetForm';
import RecoveryBetForm from './components/RecoveryBetForm';
import Backtester from './components/Backtester'; // 1. IMPORTE O NOVO COMPONENTE

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Menu />
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cadastro" element={<PrimaryBetForm />} /> 
            <Route path="/recovery" element={<RecoveryBetForm />} />
            
            {/* --- 2. ADICIONE A NOVA ROTA AQUI --- */}
            <Route path="/backtesting" element={<Backtester />} />

            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;