CREATE TABLE materials (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    kind       VARCHAR(20) NOT NULL CHECK (kind IN ('material', 'tool')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (name, kind)
);

CREATE TABLE recipe_materials (
    recipe_id  INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    quantity   NUMERIC(10, 2),
    unit       VARCHAR(40),
    color      VARCHAR(80),
    PRIMARY KEY (recipe_id, material_id),
    CHECK (quantity IS NULL OR quantity > 0)
);
