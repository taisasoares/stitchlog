CREATE TABLE saved_recipes (
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id  INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, recipe_id)
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM recipes r
        WHERE NOT EXISTS (
            SELECT 1
            FROM steps s
            WHERE s.recipe_id = r.id
        )
    ) THEN
        RAISE EXCEPTION
            'Não é possível aplicar a migration: existem receitas sem passos.'
            USING ERRCODE = 'check_violation';
    END IF;
END;
$$;

CREATE FUNCTION ensure_recipe_has_step()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    checked_recipe_id INTEGER;
BEGIN
    IF TG_TABLE_NAME = 'recipes' THEN
        checked_recipe_id := NEW.id;
    ELSE
        checked_recipe_id := OLD.recipe_id;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM recipes r
        WHERE r.id = checked_recipe_id
          AND NOT EXISTS (
              SELECT 1
              FROM steps s
              WHERE s.recipe_id = r.id
          )
    ) THEN
        RAISE EXCEPTION
            'A receita % deve possuir ao menos um passo.', checked_recipe_id
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER recipe_must_have_step
AFTER INSERT OR UPDATE ON recipes
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION ensure_recipe_has_step();

CREATE CONSTRAINT TRIGGER recipe_must_keep_step
AFTER DELETE OR UPDATE OF recipe_id ON steps
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION ensure_recipe_has_step();
