CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    user_id INT,
    home_team TEXT,
    away_team TEXT,
    start_time TIMESTAMPTZ,
    home_score INT,
    away_score INT,
    home_score_ht INT,
    away_score_ht INT,
    CONSTRAINT fk_users
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);