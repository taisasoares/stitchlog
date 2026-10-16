CREATE TABLE categories (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO categories (name)
SELECT DISTINCT COALESCE(NULLIF(TRIM(category), ''), 'Sem categoria')
FROM recipes
ON CONFLICT (name) DO NOTHING;

ALTER TABLE recipes ADD COLUMN category_id INTEGER;

UPDATE recipes r
SET category_id = c.id
FROM categories c
WHERE c.name = COALESCE(NULLIF(TRIM(r.category), ''), 'Sem categoria');

ALTER TABLE recipes
    ALTER COLUMN category_id SET NOT NULL,
    ADD CONSTRAINT recipes_category_id_fkey
        FOREIGN KEY (category_id) REFERENCES categories(id),
    ALTER COLUMN user_id DROP DEFAULT;

ALTER TABLE recipes DROP COLUMN category;
