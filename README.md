# 🧶 StitchLog

## Descrição

O StitchLog é uma aplicação para organização e acompanhamento de receitas de crochê. <br>
O usuário pode cadastrar e organizar suas próprias receitas, incluindo os materiais necessários e as instruções passo a passo, além de acompanhar o progresso durante a execução de uma peça.

A aplicação é composta por duas frentes, web e mobile, ambas com o mesmo conjunto de funcionalidades.

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

## Arquitetura e Estrutura do Projeto

O **StitchLog** foi estruturado em um modelo de **Monorepo** (monolito de código) para gerenciar o backend, o site web e o aplicativo mobile de forma unificada e organizada. 

O backend do projeto adota uma **Arquitetura em Camadas** (Route → Controller → Service → Repository), o que garante que cada parte do código tenha uma única responsabilidade clara.

### Mapa de Pastas e Arquivos (Backend)

```text
stitchlog/
├── .gitignore                              # Regras globais para evitar o envio de arquivos pesados ou senhas ao Git
├── README.md                               # Documentação geral da aplicação
├── backend/                                # Servidor API Express e Banco de Dados (PostgreSQL)
│   ├── migrations/                         # Histórico de alterações estruturais e criação das tabelas no banco
│   │   ├── 001_create_recipes.sql          # Criação da tabela de receitas
│   │   └── 002_create_users_add_fk.sql     # Criação de usuários e vínculo de relacionamento
│   ├── src/                                # Código-fonte principal do servidor
│   │   ├── recipes/                        # Módulo de Receitas (Feature Domain)
│   │   │   ├── recipes.routes.ts           # Rota: Associa URLs e ações HTTP às funções do controller
│   │   │   ├── recipes.controller.ts       # Controller: Trata dados HTTP de entrada e formata respostas JSON
│   │   │   ├── recipes.service.ts          # Service: Onde vivem as regras e lógicas de negócio do app
│   │   │   └── recipes.repository.ts       # Repository: Executa as queries SQL diretas no PostgreSQL
│   │   ├── errors/                         # Gerenciamento de respostas de erros padronizadas da API
│   │   │   ├── errorHandler.ts             # Middleware que captura falhas internas e envia JSON estruturado
│   │   │   └── notFoundHandler.ts          # Middleware que trata requisições para rotas inexistentes (404)
│   │   ├── config.ts                       # Carrega e valida se as variáveis de ambiente necessárias estão ativas
│   │   ├── db.ts                           # Inicializa o Pool de conexões simultâneas com o banco de dados
│   │   └── app.ts                          # Ponto de entrada do servidor (configura Express, rotas e middlewares)
│   ├── .env                                # Variáveis de ambiente locais com senhas e portas de rede (não enviado ao Git)
│   ├── migrate.ts                          # Script TypeScript que executa os arquivos de migração em ordem
│   ├── seed.sql                            # Script SQL para popular o banco de dados com dados de teste realistas
│   ├── package.json                        # Gerenciador de dependências e scripts de inicialização rápida (npm run)
│   └── tsconfig.json                       # Arquivo de configuração do compilador TypeScript
├── web/                                    # [Futuro] Aplicação Frontend Web
└── mobile/                                 # [Futuro] Aplicativo Mobile Multiplataforma (iOS & Android) em React Native
```
