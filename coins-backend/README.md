# Backend REST API - Moedas de Ouro

Backend Node.js + Express para gerenciamento de moedas de ouro, com sistema de autenticação admin e API pública.

## Estrutura do Projeto

```
coins-backend/
├── src/
│   ├── index.js              # Entry point da aplicação
│   ├── db.js                 # Pool de conexões PostgreSQL
│   ├── middlewares/
│   │   ├── authApiKey.js    # Validação de x-api-key
│   │   └── authAdminToken.js # Validação de JWT admin
│   └── routes/
│       ├── coins.js         # Rotas públicas (POST /coins)
│       ├── adminAuth.js     # Rotas de autenticação admin
│       └── adminCoins.js    # Rotas admin de gerenciamento
├── package.json
├── Dockerfile
└── README.md
```

## Variáveis de Ambiente

### Obrigatórias

- `API_KEY` - Chave de API para autenticação nas rotas públicas e admin
- `PGHOST` - Host do PostgreSQL (ou use `DATABASE_URL`)
- `PGPORT` - Porta do PostgreSQL (padrão: 5432)
- `PGDATABASE` - Nome do banco de dados
- `PGUSER` - Usuário do PostgreSQL
- `PGPASSWORD` - Senha do PostgreSQL
- `ADMIN_EMAIL` - Email do administrador
- `ADMIN_PASSWORD` - Senha do administrador
- `JWT_SECRET` - Chave secreta para assinar tokens JWT

### Opcionais

- `DATABASE_URL` - URL completa de conexão (substitui PGHOST, PGPORT, etc.)
- `JWT_EXPIRES_IN` - Tempo de expiração do token JWT (padrão: '8h')
- `PORT` - Porta do servidor (padrão: 3000)
- `NODE_ENV` - Ambiente de execução (development/production)

## Instalação

```bash
npm install
```

## Execução

```bash
npm start
```

Para desenvolvimento com auto-reload:

```bash
npm run dev
```

## Endpoints

### Públicos (requerem apenas x-api-key)

#### `POST /coins`
Busca moedas de um usuário pelo e-mail.

**Headers:**
```
x-api-key: <API_KEY>
Content-Type: application/json
```

**Body:**
```json
{
  "email": "usuario@exemplo.com"
}
```

**Respostas:**
- `200 OK`: `{ "email": "usuario@exemplo.com", "coins": 123 }`
- `404 Not Found`: `{ "error": "Email not found" }`
- `400 Bad Request`: `{ "error": "Email is required" }` ou `{ "error": "Invalid email format" }`

### Admin - Autenticação (requerem x-api-key)

#### `POST /admin/login`
Autentica o administrador e retorna token JWT.

**Headers:**
```
x-api-key: <API_KEY>
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@exemplo.com",
  "password": "senha_secreta"
}
```

**Resposta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@exemplo.com"
}
```

**Respostas de erro:**
- `401 Unauthorized`: `{ "error": "Invalid credentials" }`
- `400 Bad Request`: `{ "error": "Email and password are required" }`

#### `GET /admin/me`
Valida a sessão do admin e retorna informações.

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <JWT_TOKEN>
```

**Resposta 200:**
```json
{
  "email": "admin@exemplo.com",
  "role": "admin"
}
```

**Respostas de erro:**
- `401 Unauthorized`: `{ "error": "Invalid or expired token" }` ou `{ "error": "Missing or invalid Authorization header" }`

### Admin - Gerenciamento (requerem x-api-key + JWT)

**Importante:** Todas as rotas `/admin/*` (exceto `/admin/login` e `/admin/me`) exigem **dupla proteção**:
1. Header `x-api-key` válido
2. Header `Authorization: Bearer <JWT_TOKEN>` válido

#### `GET /admin/coins`
Lista registros da tabela `coins` com filtros opcionais.

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters (opcionais):**
- `name` - Filtro por nome (busca parcial, case-insensitive)
- `email` - Filtro por email (busca parcial, case-insensitive)

**Exemplo:**
```
GET /admin/coins?name=João&email=exemplo
```

**Resposta 200:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "coins": 150,
      "user_consults_quantity": 5,
      "user_consulted_at": "2024-01-15T10:30:00.000Z",
      "admin_consulted_at": "2024-01-20T14:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-20T14:00:00.000Z",
      "spend_history": []
    }
  ],
  "count": 1
}
```

#### `PATCH /admin/coins`
Atualiza a quantidade de moedas de um usuário.

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body (opção 1 - valor absoluto):**
```json
{
  "email": "usuario@exemplo.com",
  "coins": 200
}
```

**Body (opção 2 - delta):**
```json
{
  "email": "usuario@exemplo.com",
  "coinsDelta": 50
}
```

**Regras:**
- `email` é obrigatório
- Pelo menos um entre `coins` ou `coinsDelta` deve ser fornecido
- Se ambos forem fornecidos, `coins` tem prioridade e `coinsDelta` é ignorado
- O valor final de `coins` não pode ser negativo

**Resposta 200:**
Retorna o registro atualizado completo (mesmo formato da listagem).

**Respostas de erro:**
- `404 Not Found`: `{ "error": "Email not found" }`
- `400 Bad Request`: `{ "error": "Email is required" }` ou `{ "error": "Coins cannot be negative" }` ou `{ "error": "At least one of \"coins\" or \"coinsDelta\" is required" }`

## Estrutura da Tabela `coins`

```sql
CREATE TABLE coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  coins INTEGER NOT NULL DEFAULT 0,
  user_consults_quantity INTEGER NOT NULL DEFAULT 0,
  user_consulted_at TIMESTAMP WITH TIME ZONE,
  admin_consulted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  spend_history JSONB NOT NULL DEFAULT '[]'::jsonb
);
```

## Deploy no Easypanel

1. Configure todas as variáveis de ambiente no Easypanel
2. Use o `Dockerfile` fornecido
3. O servidor estará disponível na porta configurada em `PORT` (padrão: 3000)

## Segurança

- Todas as rotas (exceto `/health`) exigem `x-api-key` válido
- Rotas admin de gerenciamento exigem JWT válido além do `x-api-key`
- Tokens JWT expiram após o tempo configurado em `JWT_EXPIRES_IN` (padrão: 8 horas)
- Use HTTPS em produção
- Mantenha `JWT_SECRET` e `ADMIN_PASSWORD` seguros

## Front-end Admin

O front-end admin é uma one page HTML (`coins-admin-widget.html`) que deve ser colada em um widget HTML do Elementor. Configure:

- `API_BASE_URL`: URL pública do backend no Easypanel
- `API_KEY`: Mesma chave configurada na variável de ambiente `API_KEY`

