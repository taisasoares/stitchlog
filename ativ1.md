# Atividade 1

## Quais tabelas você definiu inicialmente?

Inicialmente, resolvi definir duas tabelas no banco de dados relacional (PostgreSQL): <br>
  - users (para armazenar as pessoas/artesãos da plataforma) <br>
  - e recipes (para armazenar as receitas de crochê)

A tabela users foi modelada com atributos básicos como id (chave primária auto-incrementada), name (nome) e email (e-mail configurado com restrição de valor único).

A tabela recipes contém id, title (título), description (descrição), difficulty (dificuldade de execução), category (categoria da peça) e o carimbo de data created_at.

O relacionamento definido entre elas é de muitos-para-um (many-to-one), visto que um usuário pode criar e organizar várias receitas, mas cada receita é associada a exatamente um criador.

Essa conexão é materializada pela inclusão da chave estrangeira (foreign key) user_id na tabela de receitas, apontando para o identificador correspondente na tabela de usuários para garantir a integridade dos dados.

## Você utilizou migrations? Se sim, quantas migrations? Descreva em uma frase o que cada uma faz.

Sim, utilizei duas migrations (migrações) em arquivos SQL versionados e ordenados por prefixo numérico para garantir a reprodução incremental e segura do banco de dados do projeto.

- 001_create_recipes.sql: Cria a tabela principal de receitas (recipes) com seus atributos estruturais obrigatórios e opcionais, ainda sem a definição da chave estrangeira, pois a tabela relacionada ainda não existe no histórico do banco.

- 002_create_users_add_fk.sql: Cria a tabela de usuários (users) com a restrição de e-mail único e, de forma incremental, altera a tabela de receitas utilizando um comando ALTER TABLE para incluir o campo user_id como chave estrangeira referenciando o criador.

## Qual o caminho do arquivo que gera a seed do seu banco?

O caminho do arquivo de carga inicial de testes no projeto é `backend/seed.sql`.

Este arquivo executa um comando de limpeza inicial nas tabelas (TRUNCATE ... RESTART IDENTITY CASCADE) para esvaziar o banco e resetar os identificadores sequenciais.

Na sequência, ele realiza inserções via SQL para popular as tabelas de usuários e receitas com dados realistas e suficientes para que as interfaces frontend e mobile consigam renderizar informações na tela imediatamente.

##  Quais os endpoints que você irá implementar inicialmente? Cada endpoint deve ser um método e um path. Explique em um parágrafo por que você resolveu priorizar a implementação desses endpoints.

O endpoint definido para a implementação inicial da API é o `GET /api/recipes`.

A listagem de receitas é a funcionalidade central do StitchLog, servindo como o recurso de maior valor para o usuário final. Priorizar esse endpoint de leitura permite que validemos a comunicação de ponta a ponta entre o banco de dados e a rede de internet por meio de todas as camadas do sistema (Route $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ Repository) de forma segura. Como já possuímos dados realistas disponíveis no banco através do arquivo de seed, iniciar pelo método GET assegura que toda a infraestrutura de rede, conexão via pool de dados e mapeamento de rotas estejam operacionais e estáveis antes de avançarmos para as regras mais complexas de escrita e modificação de receitas.

## Você está usando algum framework para escrever os endpoints da sua API? Se sim, qual?

Sim, decidi utilizar o Express.

O Express é um framework HTTP minimalista para o ambiente Node.js que elimina a necessidade de gerenciar manualmente toda a "canalização" complexa e repetitiva de rede (como criar estruturas manuais de if/else para avaliar métodos HTTP e caminhos de URL, ou processar manualmente cabeçalhos e corpos de requisições).

Ao utilizar o Express para gerenciar essas rotinas de roteamento, o desenvolvimento da API do StitchLog fica estruturado de forma limpa, permitindo foco exclusivo na lógica de negócio das camadas da aplicação.