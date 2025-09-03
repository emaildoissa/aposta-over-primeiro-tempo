import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await api.loginUser({ email, password });
      login(data.token); // Salva o token no contexto
      navigate('/dashboard'); // Redireciona para o dashboard
    } catch (err) {
      setError("Email ou senha inválidos.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '10px' }}>Entrar</button>
      </form>
    </div>
  );
}