import { useEffect, useState } from "react";

type Game = {
  id: number;
  home_team: string;
  away_team: string;
  start_time: string;
};

type Bet = {
  id: number;
  game_id: number;
  market: string;
  odd: number;
  stake: number;
  result: string;
  pnl: number;
};

export default function Dashboard() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [totalStake, setTotalStake] = useState(0);

  // Filtro por data
  const [filterDate, setFilterDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch("http://localhost:8080/api/bets").then(res => res.json()),
      fetch("http://localhost:8080/api/games").then(res => res.json())
    ]).then(([betsData, gamesData]) => {
      setBets(betsData);
      setGames(gamesData);
      setSaldo(betsData.reduce((acc: number, b: Bet) => acc + b.pnl, 0));
      setTotalStake(betsData.reduce((acc: number, b: Bet) => acc + b.stake, 0));
    }).catch(console.error);
  };

  const roi = totalStake ? (saldo / totalStake) * 100 : 0;

  // Filtro: só jogos do dia escolhido
  const filteredGames = games.filter(game => {
    const dt = new Date(game.start_time);
    const dtStr = dt.toISOString().slice(0, 10);
    return dtStr === filterDate;
  });

  const getBetsForGame = (gameId: number) => bets.filter(bet => bet.game_id === gameId);

  const isFullGreen = (gameId: number) => {
    const bs = getBetsForGame(gameId);
    return bs.length > 0 && bs.every(bet => bet.result === "GREEN");
  };

  const getBgColor = (result: string) => {
    if (result === "GREEN") return "#d4edda";
    if (result === "RED") return "#f8d7da";
    if (result === "MEIO_RED") return "#fff3cd";
    return "";
  };

  // Edita resultado inline
  const handleResultInline = async (betId: number, newResult: string) => {
    try {
      await fetch(`http://localhost:8080/api/bets/${betId}/result`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: newResult }),
      });
      fetchData();
    } catch {
      alert("Erro ao atualizar resultado.");
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 12px" }}>
      <h2 style={{ marginBottom: 20 }}>Dashboard - Resumo da Banca</h2>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
        {/* Indicadores de banca, roi, taxa, lucro */}
        <div style={{ flex: "1 1 200px", background: "#e6f2ea", borderRadius: 20, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
          <h3>Banca Total</h3>
          <p style={{ fontSize: 28, margin: 0, fontWeight: "bold", color: "#227445" }}>R$ {saldo.toFixed(2)}</p>
          <p style={{ color: "#3c763d", fontWeight: "600" }}>{roi.toFixed(2)}%</p>
        </div>
        <div style={{ flex: "1 1 200px", background: "#d9e8fc", borderRadius: 20, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
          <h3>ROI</h3>
          <p style={{ fontSize: 28, margin: 0, fontWeight: "bold", color: "#335d9f" }}>{roi.toFixed(2)}%</p>
          <p style={{ color: "#4580df" }}>Total geral</p>
        </div>
        <div style={{ flex: "1 1 200px", background: "#e6f2ea", borderRadius: 20, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
          <h3>Taxa de Acerto</h3>
          <p style={{ fontSize: 28, margin: 0, fontWeight: "bold", color: "#227445" }}>
            {bets.length ? ((bets.filter(b => b.result === "GREEN").length / bets.length) * 100).toFixed(2) : "0.00"}%
          </p>
          <p style={{ color: "#3c763d" }}>
            {bets.filter(b => b.result === "GREEN").length} de {bets.length} apostas
          </p>
        </div>
        <div style={{ flex: "1 1 200px", background: "#e6f2ea", borderRadius: 20, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
          <h3>Lucro Total</h3>
          <p style={{ fontSize: 28, margin: 0, fontWeight: "bold", color: "#227445" }}>
            R$ {bets.reduce((acc, b) => acc + (b.result === "GREEN" ? b.pnl : 0), 0).toFixed(2)}
          </p>
          <p style={{ color: "#3c763d" }}>{bets.length} apostas</p>
        </div>
      </div>

      {/* Filtro por data */}
      <div style={{
        background: "#fff",
        padding: 12,
        borderRadius: 12,
        boxShadow: "0 0px 4px rgba(0,0,0,0.06)",
        maxWidth: 350,
        marginBottom: 18
      }}>
        <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>Filtrar por Data:</label>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          style={{
            padding: 8,
            fontSize: "1rem",
            borderRadius: 7,
            border: "1px solid #dde2e6",
            fontFamily: "'Montserrat', Arial, sans-serif"
          }}
        />
      </div>

      {/* Lista de jogos filtrados */}
      {filteredGames.length === 0 ? (
        <p>Nenhum jogo cadastrado para esta data.</p>
      ) : (
        filteredGames.map(game => {
          const gameBets = getBetsForGame(game.id);
          return (
            <div
              key={game.id}
              style={{
                border: "1px solid #ccc",
                marginBottom: 20,
                borderRadius: 20,
                padding: 14,
                backgroundColor: isFullGreen(game.id) ? "#e6ffe6" : "white",
                boxShadow: "0 1px 6px #0002",
              }}
            >
              <h3 style={{ marginBottom: 12 }}>
                {game.home_team} vs {game.away_team} — {new Date(game.start_time).toLocaleString()}
                {isFullGreen(game.id) && (
                  <span style={{ color: "#2a7c2a", fontWeight: "bold", marginLeft: 12 }}>
                    ✓ Acerto Total
                  </span>
                )}
              </h3>
              {gameBets.length === 0 ? (
                <p>Sem apostas para este jogo.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "6px", textAlign: "left" }}>Mercado</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "6px", textAlign: "right" }}>Odd</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "6px", textAlign: "right" }}>Stake</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "6px", textAlign: "center" }}>Resultado</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "6px", textAlign: "right" }}>PnL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameBets.map(bet => (
                      <tr key={bet.id} style={{ backgroundColor: getBgColor(bet.result) }}>
                        <td style={{ padding: "6px" }}>{bet.market}</td>
                        <td style={{ padding: "6px", textAlign: "right" }}>{bet.odd.toFixed(2)}</td>
                        <td style={{ padding: "6px", textAlign: "right" }}>{bet.stake.toFixed(2)}</td>
                        {/* Resultado inline */}
                        <td style={{ padding: "6px", textAlign: "center" }}>
                          <select
                            value={bet.result}
                            onChange={e => handleResultInline(bet.id, e.target.value)}
                            style={{
                              padding: "4px 10px",
                              fontSize: "1rem",
                              borderRadius: 7,
                              border: "1px solid #dde2e6",
                              fontFamily: "'Montserrat', Arial, sans-serif",
                              background: "#fff"
                            }}
                          >
                            <option value="">—</option>
                            <option value="GREEN">GREEN</option>
                            <option value="RED">RED</option>
                            <option value="MEIO_RED">MEIO_RED</option>
                          </select>
                        </td>
                        <td style={{ padding: "6px", textAlign: "right" }}>
                          {bet.result ? bet.pnl.toFixed(2) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
