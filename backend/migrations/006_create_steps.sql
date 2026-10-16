CREATE TABLE steps (
    id          SERIAL PRIMARY KEY,
    recipe_id   INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    position    INTEGER NOT NULL CHECK (position > 0),
    instruction TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (recipe_id, position)
);
