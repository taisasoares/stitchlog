DROP TRIGGER IF EXISTS recipe_must_have_step ON recipes;
DROP TRIGGER IF EXISTS recipe_must_keep_step ON steps;
DROP FUNCTION IF EXISTS ensure_recipe_has_step();
