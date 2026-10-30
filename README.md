# 🧶 StitchLog

## Descrição

O StitchLog é uma aplicação para organização e acompanhamento de receitas de crochê. <br>
O usuário pode cadastrar e organizar suas próprias receitas, incluindo os materiais necessários e as instruções passo a passo, além de acompanhar o progresso durante a execução de uma peça.

A aplicação é composta por duas frentes, web e mobile, ambas com o mesmo conjunto de funcionalidades.

## Documentação

- [Modelo conceitual](docs/modeloConceitual.pdf)

## Funcionalidades

### MVP

**1. Usuários** <br>
1.1 Cadastro de usuário <br>
1.2 Login e autenticação <br>
1.3 Edição do perfil

**2. Receitas** <br>
2.1 Criar receita <br>
2.2 Visualizar receita <br>
2.3 Editar receita <br>
2.4 Excluir receita <br>
2.5 Adicionar foto <br>
2.6 Informar dificuldade, categoria e descrição <br>
2.7 Adicionar tags

**3. Materiais** <br>
3.1 Cadastrar materiais necessários para cada receita <br>
3.2 Informar nome, quantidade, unidade e outras informações relevantes <br>
3.3 Adicionar ferramentas necessárias

**4. Passo a passo** <br>
4.1 Dividir a receita em etapas <br>
4.2 Adicionar instruções para cada etapa <br>
4.3 Organizar as etapas em ordem <br>
4.4 Editar e excluir etapas

**5. Execução da receita** <br>
5.1 Iniciar uma receita <br>
5.2 Marcar instruções e etapas como concluídas <br>
5.3 Visualizar o progresso da receita <br>
5.4 Salvar automaticamente o ponto em que o usuário parou <br>
5.5 Retomar uma receita posteriormente do ponto em que foi interrompida

**6. Organização** <br>
6.1 Listar receitas <br>
6.2 Pesquisar receitas <br>
6.3 Filtrar por categoria, dificuldade e tags <br>
6.4 Favoritar receitas

**7. Progresso** <br>
7.1 Visualizar receitas em andamento <br>
7.2 Visualizar percentual de conclusão <br>
7.3 Visualizar receitas concluídas

### Funcionalidades futuras

**8. Histórico de execução** <br>
8.1 Registrar sessões de execução <br>
8.2 Registrar quando e quanto tempo o usuário trabalhou em uma receita <br>
8.3 Exibir tempo total dedicado a cada receita

**9. Anotações** <br>
9.1 Adicionar anotações pessoais durante a execução <br>
9.2 Vincular uma anotação a uma etapa específica da receita

**10. Contador de pontos** <br>
10.1 Contador de pontos para cada etapa <br>
10.2 Definir quantidade de pontos esperados <br>
10.3 Salvar o progresso do contador

**11. Conquistas** <br>
11.1 Sistema de conquistas baseado no progresso do usuário

## Backend implementado

O backend utiliza Node.js, TypeScript, Express, PostgreSQL e o driver `pg`, sem ORM.
Cada recurso segue o fluxo:

```text
Route → Controller → Service → Repository → PostgreSQL
```

Os repositories convertem as linhas retornadas pelo PostgreSQL em instâncias das
classes de entidade. Cada classe possui atributos privados, construtor, getters e
setters para os atributos mutáveis.

### Entidades e relacionamentos

- `User`: usuário que cria receitas e acompanha execuções. A senha é persistida
  exclusivamente em `password_hash`; contas migradas exigem redefinição.
- `Recipe`: receita pertencente a um usuário e a uma categoria.
- `Category`: classificação normalizada das receitas.
- `Tag`: etiqueta associada a receitas por `recipe_tags`.
- `Material`: material ou ferramenta. Quantidade, unidade e cor ficam em
  `recipe_materials`, pois são informações específicas de cada receita.
- `Step`: instrução ordenada de uma receita, com texto livre opcional para os
  tipos de ponto utilizados.
- `Execution`: acompanhamento do progresso de um usuário em uma receita. Quando
  informado, o passo atual obrigatoriamente pertence à receita executada.
- `favorites`: associação entre usuários e suas receitas favoritas. Não possui
  endpoint independente nesta atividade.
- `saved_recipes`: associação independente entre usuários e receitas salvas.
  Não possui endpoint independente nesta atividade.

### Alinhamento entre o modelo conceitual e o relacional

| Conceito | Implementação relacional |
|---|---|
| Usuário cria receitas | `recipes.user_id` referencia `users.id` |
| Categoria classifica receitas | `recipes.category_id` referencia `categories.id` |
| Receita pode possuir passos | `steps.recipe_id` referencia `recipes.id` |
| Receita possui tags | associação muitos-para-muitos `recipe_tags` |
| Receita utiliza materiais | associação muitos-para-muitos `recipe_materials`, que também armazena quantidade, unidade e cor |
| Usuário salva ou favorita receitas | associações muitos-para-muitos independentes `saved_recipes` e `favorites` |
| Usuário executa receitas | entidade associativa `executions`, com estado e progresso |
| Execução possui passo atual | FK composta garante que o passo pertence à mesma receita |

`steps.stitch_types` descreve quais tipos de ponto são usados na instrução, como
`correntinha` ou `ponto baixo`. Ele não representa o contador quantitativo de
pontos/carreiras descrito nas funcionalidades futuras.

O backend possui login com comparação bcrypt e emissão de JWT. A aplicação nunca
envia `password_hash` nas respostas HTTP. As contas anteriores à migration `009`
permanecem com `password_reset_required = true` e não podem autenticar até uma
redefinição futura.

Rotas privadas usam o middleware `requireAuth` e esperam o token no formato
`Authorization: Bearer <token>`. A identidade validada fica disponível em
`req.auth.userId`; operações autenticadas não devem confiar em um `user_id`
enviado no corpo da requisição.

### Estrutura principal

```text
backend/
├── migrations/                  # Migrations SQL numeradas de 001 a 011
├── src/
│   ├── users/                   # Entity, repository, service, controller e routes
│   ├── auth/                    # Login com bcrypt e emissão de JWT
│   ├── recipes/                 # Entity, repository, service, controller e routes
│   ├── categories/              # Entity, repository, service, controller e routes
│   ├── tags/                    # Entity, repository, service, controller e routes
│   ├── materials/               # Entity, repository, service, controller e routes
│   ├── steps/                   # Entity, repository, service, controller e routes
│   ├── executions/              # Entity, repository, service, controller e routes
│   ├── errors/                  # Middlewares de erro e rota não encontrada
│   ├── app.ts                   # Configuração do Express e registro das rotas
│   ├── config.ts                # Leitura da configuração do ambiente
│   └── db.ts                    # Pool de conexões PostgreSQL
├── migrate.ts                   # Executor incremental de migrations
├── seed.ts                      # Executor da seed
├── seed.sql                     # Dados fictícios para desenvolvimento
├── package.json
└── tsconfig.json
```

## Endpoints disponíveis

Os endpoints disponíveis são:

| Método | Endpoint | Retorno |
|---|---|---|
| POST | `/api/login` | Token JWT e dados públicos do usuário |
| GET | `/api/users` | Lista de usuários |
| GET | `/api/users/:id` | Consulta pública de um usuário |
| POST | `/api/users` | Cadastra um usuário |
| PUT | `/api/users/:id` | Atualiza a própria conta (requer token) |
| DELETE | `/api/users/:id` | Exclui a própria conta (requer token) |
| GET | `/api/recipes` | Lista de receitas, categorias e criadores |
| GET | `/api/recipes/:id` | Consulta uma receita pelo ID |
| POST | `/api/recipes` | Cadastra uma receita para o usuário autenticado |
| PUT | `/api/recipes/:id` | Atualiza uma receita do usuário autenticado |
| DELETE | `/api/recipes/:id` | Exclui uma receita do usuário autenticado |
| GET | `/api/categories` | Lista de categorias |
| GET | `/api/tags` | Lista de tags |
| GET | `/api/materials` | Lista de materiais e ferramentas |
| GET | `/api/steps` | Lista de passos na ordem de cada receita |
| GET | `/api/executions` | Lista de execuções e seus progressos |

Uma tabela sem registros produz status `200` e o JSON `[]`. Rotas inexistentes
produzem status `404` com uma resposta JSON padronizada.

## Configuração e execução

### Pré-requisitos

- Node.js 22 ou versão compatível.
- PostgreSQL em execução.
- Um banco de desenvolvimento criado.

Entre na pasta do backend e instale as dependências:

```bash
cd backend
npm install
```

Crie `backend/.env` com a conexão do seu banco. O arquivo é ignorado pelo Git:

```dotenv
DATABASE_URL=postgresql://usuario:senha@localhost:5432/stitchlog
PORT=3000
JWT_SECRET=troque-por-um-segredo-forte
JWT_EXPIRES_IN=1h
```

Execute as migrations na ordem numérica:

```bash
npm run migrate
```

O executor registra os arquivos aplicados em `schema_migrations`, portanto novas
execuções aplicam somente migrations pendentes. Ele também reconhece bancos antigos
que já possuíam as tabelas `recipes` e `users`.

Para inserir dados fictícios em um banco de desenvolvimento:

```bash
npm run seed
```

A seed cria usuários de desenvolvimento com a senha `stitchlog123`.

Ao excluir uma conta, suas receitas, execuções, favoritos e receitas salvas são
removidos em cascata.

> Atenção: a seed esvazia as tabelas da aplicação antes de inserir os exemplos.
> Não a execute em um banco que contenha dados que devam ser preservados.

Inicie o servidor:

```bash
npm run dev
```

Para iniciar sem observação automática de arquivos, use `npm start`.

A documentação interativa da API fica disponível em
[`http://localhost:3000/api-docs`](http://localhost:3000/api-docs). O documento
OpenAPI em JSON pode ser consultado em `http://localhost:3000/api-docs.json`.

Para testar uma rota privada pelo Swagger UI, execute `POST /api/login`, copie o
campo `token` da resposta, clique em **Authorize** e informe somente o JWT. O
Swagger adicionará automaticamente o prefixo `Bearer` às requisições protegidas.

Para reproduzir login, acesso público, acesso privado e expiração de token no
Postman, consulte [`docs/authentication-postman.md`](docs/authentication-postman.md)
e importe [`docs/stitchlog-auth.postman_collection.json`](docs/stitchlog-auth.postman_collection.json).

## Compilação e testes manuais

Verifique os tipos sem gerar arquivos:

```bash
npm run typecheck
```

Compile o TypeScript:

```bash
npm run build
```

O comando de teste atual executa o typecheck:

```bash
npm test
```

Com o servidor em execução, os endpoints podem ser consultados, por exemplo:

```bash
curl http://localhost:3000/api/users
curl -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"taisa@example.com","password":"stitchlog123"}'
curl -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Nova Pessoa","email":"nova@example.com","password":"senha-segura"}'
curl -X PUT http://localhost:3000/api/users/1 \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Nome Atualizado","email":"taisa@example.com"}'
curl -X DELETE http://localhost:3000/api/users/1 \
  -H 'Authorization: Bearer <token>'
curl http://localhost:3000/api/recipes
curl -X DELETE http://localhost:3000/api/recipes/1 \
  -H 'Authorization: Bearer <token>'
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/tags
curl http://localhost:3000/api/materials
curl http://localhost:3000/api/steps
curl http://localhost:3000/api/executions
```

O escopo atual não inclui redefinição de senha, perfis administrativos, proteção
das demais rotas, frontend ou ORM.
