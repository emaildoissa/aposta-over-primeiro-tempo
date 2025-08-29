import { useEffect, useState } from "react";

type Game = {
  id: number;
  home_team: string;
  away_team: string;
  start_time: string;
};

export default function GameList() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/games")
      .then(res => res.json())
      .then(setGames)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Jogos Cadastrados</h2>
      <ul>
        {games.map(game => (
          <li key={game.id}>
            {game.home_team} vs {game.away_team} - {new Date(game.start_time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
