CREATE TABLE bets (
    id SERIAL PRIMARY KEY,
    game_id INT REFERENCES games(id) ON DELETE CASCADE,
    market VARCHAR(20) NOT NULL,
    odd NUMERIC NOT NULL,
    stake NUMERIC NOT NULL,
    result VARCHAR(20),
    pnl NUMERIC
);
