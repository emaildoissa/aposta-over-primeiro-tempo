import { useEffect, useState } from "react";

type Game = {
  id: number;
  home_team: string;
  away_team: string;
};

type Stakes = {
  stake1: number;
  stake2: number;
};

export default function BetForm() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [odd1, setOdd1] = useState(1.2);
  const [odd2, setOdd2] = useState(2.5);
  const [total, setTotal] = useState(100);
  const [stakes, setStakes] = useState<Stakes | null>(null);
  const [market, setMarket] = useState<"Over0.5HT"|"Over1.5HT">("Over0.5HT");
  const [bets, setBets] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/games")
      .then(res => res.json())
      .then(setGames)
      .catch(console.error);
  }, []);

  async function calcDutching() {
    const resp = await fetch("http://localhost:8080/api/bets/dutching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ odd1, odd2, total }),
    });
    const data = await resp.json();
    setStakes(data);
  }

  async function submitBet() {
    if (!selectedGame) return alert("Selecione um jogo");

    if (!stakes) return alert("Calcule os stakes antes de enviar");

    // Criar apostas para as 2 odds com seus stakes
    const betsPayload = [
      { game_id: selectedGame, market: "Over0.5HT", odd: odd1, stake: stakes.stake1, result: "" },
      { game_id: selectedGame, market: "Over1.5HT", odd: odd2, stake: stakes.stake2, result: "" },
    ];

    for (const bet of betsPayload) {
      await fetch("http://localhost:8080/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bet),
      });
    }

    alert("Apostas cadastradas com sucesso!");
    setStakes(null);
    setOdd1(1.2);
    setOdd2(2.5);
    setTotal(100);
  }

  return (
    <div>
      <h2>Cadastro de Apostas + Calculadora Dutching</h2>
      <div>
        <label>Jogo: </label>
        <select onChange={e => setSelectedGame(Number(e.target.value))} value={selectedGame ?? ""}>
          <option value="" disabled>Selecione</option>
          {games.map(g => (
            <option key={g.id} value={g.id}>
              {g.home_team} vs {g.away_team}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Odd Over 0.5 HT:</label>
        <input type="number" step="0.01" value={odd1} onChange={e => setOdd1(Number(e.target.value))} />
      </div>
      <div>
        <label>Odd Over 1.5 HT:</label>
        <input type="number" step="0.01" value={odd2} onChange={e => setOdd2(Number(e.target.value))} />
      </div>
      <div>
        <label>Valor Total (T):</label>
        <input type="number" step="0.01" value={total} onChange={e => setTotal(Number(e.target.value))} />
      </div>
      <button onClick={calcDutching}>Calcular Dutching</button>
      {stakes && (
        <div>
          <p>Stake Over 0.5 HT: {stakes.stake1.toFixed(2)}</p>
          <p>Stake Over 1.5 HT: {stakes.stake2.toFixed(2)}</p>
          <button onClick={submitBet}>Cadastrar Apostas</button>
        </div>
      )}
    </div>
  );
}
