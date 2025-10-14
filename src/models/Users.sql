CREATE TABLE IF NOT EXISTS Users(
    user_id VARCHAR(100) PRIMARY KEY,
    nickname VARCHAR(50),
    email VARCHAR(100),
    card_id VARCHAR(20) UNIQUE
)
