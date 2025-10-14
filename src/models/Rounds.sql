CREATE TABLE IF NOT EXISTS Rounds(
    round_id SERIAL PRIMARY KEY,
    winning_numbers INTEGER[],
    is_active BOOLEAN NOT NULL
)