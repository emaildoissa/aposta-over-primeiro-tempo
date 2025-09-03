import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await api.registerUser({ email, password });
      alert('Usuário registrado com sucesso! Por favor, faça o login.');
      navigate('/login'); // Redireciona para a página de login
    } catch (err) {
      setError("Não foi possível registrar. O email já pode estar em uso.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{textAlign: 'center'}}>Registro de Novo Usuário</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px' }}>
          {isLoading ? 'Registrando...' : 'Registrar'}
        </button>
        <p style={{textAlign: 'center', marginTop: '16px'}}>Já tem uma conta? <Link to="/login">Faça o login</Link></p>
      </form>
    </div>
  );
}