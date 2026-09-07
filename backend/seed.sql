TRUNCATE recipes, users RESTART IDENTITY CASCADE;

INSERT INTO users (name, email) VALUES
('Taisa Soares', 'taisa.croche@email.com'),
('Gabriel Ferreira', 'gabriel.pontos@email.com');

INSERT INTO recipes (title, description, difficulty, category, user_id) VALUES
('Amigurumi Urso Pelúcia', 'Um ursinho fofo feito com fio de veludo molhado e agulha 4.5mm.', 'Intermediário', 'Amigurumi', 1),
('Cachecol de Lã Clássico', 'Cachecol simples perfeito para iniciantes, usando ponto alto.', 'Iniciante', 'Acessórios', 1),
('Manta de Sofá Boho', 'Manta texturizada grande com franjas nas pontas e pontos complexos.', 'Avançado', 'Decoração', 2);