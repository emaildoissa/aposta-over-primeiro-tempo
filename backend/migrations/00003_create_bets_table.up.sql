CREATE TABLE IF NOT EXISTS bets (
    id SERIAL PRIMARY KEY,
    user_id INT,
    game_id INT,
    market TEXT,
    odd NUMERIC(10, 2),
    stake NUMERIC(10, 2),
    result TEXT,
    pnl NUMERIC(10, 2),
    strategy TEXT,
    notes TEXT,
    CONSTRAINT fk_users
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_games
        FOREIGN KEY(game_id)
        REFERENCES games(id)
        ON DELETE CASCADE
);