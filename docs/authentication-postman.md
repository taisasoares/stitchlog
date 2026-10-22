# Reproduzir o fluxo de autenticação no Postman

## Preparação

Na pasta `backend`, configure o arquivo `.env`:

```dotenv
DATABASE_URL=postgresql://usuario:senha@localhost:5432/stitchlog
PORT=3000
JWT_SECRET=troque-por-um-segredo-forte
JWT_EXPIRES_IN=1h
```

Prepare o banco e inicie a API:

```bash
npm install
npm run migrate
npm run seed
npm run dev
```

> A seed apaga os dados das tabelas da aplicação. Use somente um banco de
> desenvolvimento descartável.

## Importar a coleção

Importe `docs/stitchlog-auth.postman_collection.json` no Postman. A coleção usa
as variáveis `baseUrl`, `email`, `password`, `token`, `userId`, `userName` e
`userEmail`.

Execute as requisições na ordem em que aparecem:

1. **Login válido** — espera `200`, salva `token`, `userId`, `userName` e
   `userEmail` automaticamente.
2. **Login inválido** — espera `401 INVALID_CREDENTIALS`.
3. **Rota pública sem token** — espera `200` em `GET /api/users`.
4. **Rota privada sem token** — espera `401 AUTH_TOKEN_REQUIRED`.
5. **Rota privada com token** — envia `Authorization: Bearer {{token}}` e espera
   `200` ao atualizar a conta autenticada com os mesmos dados.

O script da requisição de login válido salva o token assim:

```javascript
const body = pm.response.json();
pm.collectionVariables.set('token', body.token);
pm.collectionVariables.set('userId', body.user.id);
```

## Reproduzir token expirado

1. Pare a API.
2. Altere temporariamente `JWT_EXPIRES_IN=1s`.
3. Inicie novamente com `npm run dev`.
4. Execute **Login válido**.
5. Aguarde mais de um segundo.
6. Execute **Rota privada com token**.

A resposta esperada é `401`:

```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Token de autenticação expirado."
  }
}
```

Ao terminar, restaure `JWT_EXPIRES_IN=1h`.
