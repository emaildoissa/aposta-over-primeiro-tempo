import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { useNavigate } from "react-router-dom";
import * as api from '../services/api';
import { type Game } from "../types"; // Importe o tipo Game

export default function PrimaryBetForm() {
  const { refetchData } = useData();
  const navigate = useNavigate();

  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [startTime, setStartTime] = useState("");
  const [odd, setOdd] = useState("1.80");
  const [stake, setStake] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estilos
  const card = { background: "#f6f9f7", marginBottom: 28, padding: "24px", borderRadius: 22, boxShadow: "0 2px 6px #0002" };
  const labelStyle = { fontWeight: 500, marginBottom: 3, display: "block", fontSize: "1rem" };
  const inputStyle = { width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #dde2e6", marginBottom: 15, fontSize: "1rem" };
  const buttonStyle = { padding: "12px 0", width: "100%", backgroundColor: "#2274a5", color: "white", fontWeight: "bold", border: "none", borderRadius: "12px", fontSize: "1.07rem", cursor: "pointer" };
  
  const getStartTimeRFC3339 = (dt: string) => dt.length === 16 ? dt + ":00" : dt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const gamePayload = {
        home_team: homeTeam,
        away_team: awayTeam,
        start_time: getStartTimeRFC3339(startTime),
      };

      // 1. Cadastra o Jogo
      const gameResp = await api.createGame(gamePayload);

      // --- CORREÇÃO AQUI ---
      // Verifica se a resposta é um array. Se for, lança um erro, pois este formulário só deve criar um jogo.
      if (Array.isArray(gameResp)) {
        throw new Error("A API retornou uma lista de jogos, mas era esperado um único jogo.");
      }
      // Se não for um array, podemos usar o 'id' com segurança.
      const newGame: Game = gameResp; 
      
      // 2. Cadastra a Aposta Principal
      await api.createBet({
        game_id: newGame.id, // Agora 'newGame' é do tipo 'Game'
        market: "Over 1.5 HT",
        odd: parseFloat(odd.replace(',', '.')),
        stake: parseFloat(stake.replace(',', '.')),
        strategy: "principal_o15ht",
        result: '',
      });

      alert("Jogo e aposta principal cadastrados com sucesso!");
      await refetchData();
      navigate('/dashboard');

    } catch (error) {
      alert(error instanceof Error ? error.message : "Ocorreu um erro desconhecido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <form onSubmit={handleSubmit}>
        <div style={card}>
          <h2 style={{ margin: 0, marginBottom: 16 }}>Cadastro de Jogo e Aposta Principal</h2>
          
          <label style={labelStyle}>Time Mandante</label>
          <input style={inputStyle} type="text" value={homeTeam} onChange={e => setHomeTeam(e.target.value)} required />
          
          <label style={labelStyle}>Time Visitante</label>
          <input style={inputStyle} type="text" value={awayTeam} onChange={e => setAwayTeam(e.target.value)} required />
          
          <label style={labelStyle}>Data e Hora</label>
          <input style={inputStyle} type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          
          <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #eee'}} />

          <label style={labelStyle}>Odd Over 1.5 HT</label>
          <input style={inputStyle} type="text" value={odd} onChange={e => setOdd(e.target.value)} required />

          <label style={labelStyle}>Stake (R$)</label>
          <input style={inputStyle} type="text" value={stake} onChange={e => setStake(e.target.value)} required />

          <button type="submit" disabled={isSubmitting} style={{ ...buttonStyle, opacity: isSubmitting ? 0.6 : 1 }}>
            {isSubmitting ? "Cadastrando..." : "Cadastrar Jogo e Aposta"}
          </button>
        </div>
      </form>
    </div>
  );
}