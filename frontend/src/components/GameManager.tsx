import { useState } from "react";

export default function TestPostGame() {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [startTime, setStartTime] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getStartTimeRFC3339 = (dt: string) => {
    if (dt.length === 16) {
      return dt + ":00";
    }
    return dt;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    if (!homeTeam || !awayTeam || !startTime) {
      setError("Preencha todos os campos.");
      return;
    }

    const payload = {
      home_team: homeTeam,
      away_team: awayTeam,
      start_time: getStartTimeRFC3339(startTime),
    };

    try {
      const res = await fetch("http://localhost:8080/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(`Erro HTTP ${res.status}: ${text}`);
        return;
      }

      const data = await res.json();
      setResponse(`Jogo cadastrado com ID: ${data.id}`);
      setHomeTeam("");
      setAwayTeam("");
      setStartTime("");
    } catch (e) {
      setError("Falha na comunicação com API.");
    }
  };

  return (
    <div>
      <h2>Teste de Cadastro de Jogo</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Time Casa: </label>
          <input value={homeTeam} onChange={e => setHomeTeam(e.target.value)} />
        </div>
        <div>
          <label>Time Visitante: </label>
          <input value={awayTeam} onChange={e => setAwayTeam(e.target.value)} />
        </div>
        <div>
          <label>Data e Hora: </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </div>
        <button type="submit">Cadastrar</button>
      </form>
      {error && (
        <p style={{ color: "red", whiteSpace: "pre-wrap" }}>
          {error}
        </p>
      )}
      {response && <p style={{ color: "green" }}>{response}</p>}
    </div>
  );
}
