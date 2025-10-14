CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS Tickets (
    ticket_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_numbers INTEGER[] NOT NULL,
    user_id  VARCHAR(100) REFERENCES Users(user_id) ON DELETE CASCADE,
    round_id INTEGER REFERENCES Rounds(round_id) ON DELETE CASCADE
);
