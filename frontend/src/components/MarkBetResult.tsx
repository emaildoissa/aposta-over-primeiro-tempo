import { useEffect, useState } from "react";

type Bet = {
  id: number;
  game_id: number;
  market: string;
  odd: number;
  stake: number;
  result: string;
  pnl: number;
};

export default function MarkBetResult() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedBet, setSelectedBet] = useState<number | null>(null);
  const [result, setResult] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/bets")
      .then(res => res.json())
      .then(setBets)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBet || !result) {
      alert("Selecione a aposta e o resultado.");
      return;
    }
    try {
      await fetch(`http://localhost:8080/api/bets/${selectedBet}/result`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      });
      alert("Resultado atualizado!");
      setSelectedBet(null);
      setResult("");
      // Atualizar lista após salvar
      fetch("http://localhost:8080/api/bets")
        .then(res => res.json())
        .then(setBets)
        .catch(console.error);
    } catch {
      alert("Erro ao marcar resultado.");
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "20px auto", padding: "20px", backgroundColor: "#f6f9f7", borderRadius: 22, boxShadow: "0 2px 6px #0002" }}>
      <h2 style={{ fontWeight: "700", marginBottom: 16 }}>Marcar Resultado de Aposta</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Selecione a Aposta</label>
        <select
          value={selectedBet ?? ""}
          onChange={(e) => setSelectedBet(Number(e.target.value))}
          style={{
            width: "100%",
            padding: 10,
            fontSize: "1rem",
            borderRadius: 10,
            border: "1px solid #dde2e6",
            marginBottom: 20,
            fontFamily: "'Montserrat', Arial, sans-serif",
          }}
        >
          <option value="">Selecione...</option>
          {bets.map((b) => (
            <option key={b.id} value={b.id}>
              Jogo {b.game_id} | {b.market} | Odd: {b.odd}
            </option>
          ))}
        </select>

        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Resultado</label>
        <select
          value={result}
          onChange={(e) => setResult(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            fontSize: "1rem",
            borderRadius: 10,
            border: "1px solid #dde2e6",
            marginBottom: 24,
            fontFamily: "'Montserrat', Arial, sans-serif",
          }}
        >
          <option value="">Selecione...</option>
          <option value="GREEN">GREEN</option>
          <option value="RED">RED</option>
          <option value="MEIO_RED">MEIO_RED</option>
        </select>

        <button
          type="submit"
          disabled={!selectedBet || !result}
          style={{
            padding: "12px 0",
            width: "100%",
            backgroundColor: "#2274a5",
            color: "white",
            fontWeight: "bold",
            border: "none",
            borderRadius: 12,
            fontSize: "1.07rem",
            cursor: "pointer",
            opacity: (!selectedBet || !result) ? 0.6 : 1,
            transition: "opacity 0.3s ease"
          }}
        >
          Salvar Resultado
        </button>
      </form>
    </div>
  );
}
