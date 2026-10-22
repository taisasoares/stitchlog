BEGIN;

TRUNCATE saved_recipes, favorites, executions, steps, recipe_materials, materials,
         recipe_tags, tags, recipes, categories, users
RESTART IDENTITY CASCADE;

INSERT INTO users (name, email, password_hash, password_reset_required) VALUES
('Taisa Artesã', 'taisa@example.com', '$2b$12$fAU8yq8CdsHNizj63CeJUO.acoR3o6XZ5TMA9eIrBYw25LqxSydom', FALSE),
('Gabriel Crochê', 'gabriel@example.com', '$2b$12$fAU8yq8CdsHNizj63CeJUO.acoR3o6XZ5TMA9eIrBYw25LqxSydom', FALSE);

INSERT INTO categories (name) VALUES
('Amigurumi'),
('Acessórios'),
('Decoração');

INSERT INTO recipes (title, description, difficulty, category_id, user_id) VALUES
('Amigurumi Urso Pelúcia', 'Um ursinho feito com fio de veludo e agulha 4,5 mm.', 'Intermediário', 1, 1),
('Cachecol de Lã Clássico', 'Cachecol simples para iniciantes usando ponto alto.', 'Iniciante', 2, 1),
('Manta de Sofá Boho', 'Manta texturizada com franjas e pontos variados.', 'Avançado', 3, 2);

INSERT INTO tags (name) VALUES
('presente'),
('iniciante'),
('casa'),
('inverno');

INSERT INTO recipe_tags (recipe_id, tag_id) VALUES
(1, 1),
(2, 2),
(2, 4),
(3, 3);

INSERT INTO materials (name, kind) VALUES
('Fio de veludo', 'material'),
('Lã acrílica', 'material'),
('Barbante de algodão', 'material'),
('Agulha de crochê 4,5 mm', 'tool'),
('Agulha de crochê 5 mm', 'tool'),
('Tesoura', 'tool');

INSERT INTO recipe_materials (recipe_id, material_id, quantity, unit, color) VALUES
(1, 1, 2, 'novelos', 'caramelo'),
(1, 4, 1, 'unidade', NULL),
(1, 6, 1, 'unidade', NULL),
(2, 2, 3, 'novelos', 'azul'),
(2, 5, 1, 'unidade', NULL),
(3, 3, 8, 'novelos', 'cru'),
(3, 5, 1, 'unidade', NULL);

INSERT INTO steps (recipe_id, position, instruction, stitch_types) VALUES
(1, 1, 'Faça um anel mágico com quatro pontos baixos.', 'anel mágico, ponto baixo'),
(1, 2, 'Aumente os pontos até formar a metade de cima da cabeça do urso.', 'ponto baixo'),
(1, 3, 'Faça diminuições até formar a parte de baixo da cabeça do urso.', 'ponto baixo'),
(2, 1, 'Faça correntinhas até atingir o comprimento desejado.', 'correntinha'),
(2, 2, 'Trabalhe carreiras de ponto alto até o comprimento final.', 'ponto alto'),
(3, 1, 'Produza os quadrados de crochê conforme o padrão escolhido.', NULL),
(3, 2, 'Una os quadrados e faça o acabamento das bordas.', NULL);

INSERT INTO executions (
  user_id, recipe_id, status, progress, current_step_id,
  started_at, updated_at, completed_at
) VALUES
(1, 1, 'in_progress', 35, 2, NOW() - INTERVAL '3 days', NOW(), NULL),
(2, 2, 'completed', 100, 5, NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2, 3, 'not_started', 0, NULL, NOW(), NOW(), NULL);

INSERT INTO favorites (user_id, recipe_id) VALUES
(1, 3),
(2, 1);

INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(1, 2),
(2, 3);

COMMIT;
