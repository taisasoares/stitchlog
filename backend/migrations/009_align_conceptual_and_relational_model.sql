ALTER TABLE users
    ADD COLUMN password_hash TEXT,
    ADD COLUMN password_reset_required BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE users
SET password_hash = '$2b$12$u5HE.tUQ5gUhB9KpFntBZuMxmVl.v.kfFPTFO2F.ssyqjtJXJjUn6'
WHERE password_hash IS NULL;

ALTER TABLE users
    ALTER COLUMN password_hash SET NOT NULL,
    ADD CONSTRAINT users_password_hash_format
        CHECK (password_hash ~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$');

ALTER TABLE steps
    ADD COLUMN stitch_types TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM executions e
        JOIN steps s ON s.id = e.current_step_id
        WHERE s.recipe_id <> e.recipe_id
    ) THEN
        RAISE EXCEPTION
            'Não é possível aplicar a migration: existem execuções cujo passo atual pertence a outra receita.'
            USING ERRCODE = 'foreign_key_violation';
    END IF;
END;
$$;

ALTER TABLE steps
    ADD CONSTRAINT steps_recipe_id_id_key UNIQUE (recipe_id, id);

CREATE FUNCTION clear_execution_current_step()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE executions
        SET current_step_id = NULL
        WHERE current_step_id = OLD.id;
        RETURN OLD;
    END IF;

    IF OLD.recipe_id IS DISTINCT FROM NEW.recipe_id THEN
        UPDATE executions
        SET current_step_id = NULL
        WHERE current_step_id = OLD.id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER clear_execution_current_step_before_step_change
BEFORE DELETE OR UPDATE OF recipe_id ON steps
FOR EACH ROW
EXECUTE FUNCTION clear_execution_current_step();

ALTER TABLE executions
    DROP CONSTRAINT executions_current_step_id_fkey,
    ADD CONSTRAINT executions_recipe_current_step_fkey
        FOREIGN KEY (recipe_id, current_step_id)
        REFERENCES steps (recipe_id, id);

CREATE INDEX recipes_user_id_idx ON recipes (user_id);
CREATE INDEX recipes_category_id_idx ON recipes (category_id);
CREATE INDEX recipe_tags_tag_id_idx ON recipe_tags (tag_id);
CREATE INDEX recipe_materials_material_id_idx ON recipe_materials (material_id);
CREATE INDEX executions_user_id_idx ON executions (user_id);
CREATE INDEX executions_recipe_current_step_id_idx
    ON executions (recipe_id, current_step_id);
CREATE INDEX executions_current_step_id_idx
    ON executions (current_step_id)
    WHERE current_step_id IS NOT NULL;
CREATE INDEX favorites_recipe_id_idx ON favorites (recipe_id);
CREATE INDEX saved_recipes_recipe_id_idx ON saved_recipes (recipe_id);
