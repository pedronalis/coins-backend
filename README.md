# 🪙 Backend REST API - Coins

Backend REST em Node.js que serve como ponte entre o front-end (Elementor) e o banco de dados PostgreSQL para gerenciamento de moedas de ouro.

## 📚 Guias Disponíveis

- **[GUIA_GITHUB.md](./GUIA_GITHUB.md)** - Guia completo para usar GitHub (criar conta, enviar código, conectar com Easypanel)
- **[GUIA_DEPLOY.md](./GUIA_DEPLOY.md)** - Guia passo a passo para fazer deploy no Easypanel
- **[COMO_ATUALIZAR_FRONTEND.md](./COMO_ATUALIZAR_FRONTEND.md)** - Como atualizar o front-end após o deploy
- **[RESUMO_RAPIDO.md](./RESUMO_RAPIDO.md)** - Resumo visual do processo de deploy

## 📋 Estrutura do Projeto

```
.
├── src/
│   ├── index.js              # Aplicação Express principal
│   ├── db.js                 # Pool de conexões PostgreSQL
│   ├── middlewares/
│   │   └── authApiKey.js     # Middleware de autenticação
│   └── routes/
│       └── coins.js          # Rota POST /coins
├── package.json
├── Dockerfile
├── .env.example
└── README.md
```

## 🗄️ Estrutura do Banco de Dados

O backend espera uma tabela `coins` no banco de dados PostgreSQL com a seguinte estrutura:

```sql
CREATE TABLE coins (
  email  TEXT PRIMARY KEY,
  coins  INTEGER NOT NULL DEFAULT 0
);
```

**Banco de dados:** `clients&sales`  
**Tabela:** `coins`

## 🚀 Instalação e Configuração

### Desenvolvimento Local

1. **Clone o repositório e instale as dependências:**

```bash
npm install
```

2. **Configure as variáveis de ambiente:**

Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
API_KEY=62ba341e-4a6d-4572-b395-6a99f51010d9
PGHOST=localhost
PGPORT=5432
PGDATABASE=clients&sales
PGUSER=seu-usuario
PGPASSWORD=sua-senha
```

3. **Execute o servidor:**

```bash
npm start
```

Para desenvolvimento com auto-reload:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 📡 API Endpoints

### POST /coins

Busca as moedas de um usuário pelo e-mail.

**Autenticação:** Requer header `x-api-key` com o valor da variável de ambiente `API_KEY`

**Request:**
```http
POST /coins
Content-Type: application/json
x-api-key: 62ba341e-4a6d-4572-b395-6a99f51010d9

{
  "email": "usuario@exemplo.com"
}
```

**Response 200 (Sucesso):**
```json
{
  "email": "usuario@exemplo.com",
  "coins": 123
}
```

**Response 400 (E-mail inválido ou ausente):**
```json
{
  "error": "Email is required"
}
```
ou
```json
{
  "error": "Invalid email format"
}
```

**Response 401 (API Key inválida):**
```json
{
  "error": "Invalid API key"
}
```

**Response 404 (E-mail não encontrado):**
```json
{
  "error": "Email not found"
}
```

### GET /health

Endpoint de health check (não requer autenticação).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🐳 Deploy no Easypanel

Para instruções detalhadas e passo a passo, consulte o **[GUIA_DEPLOY.md](./GUIA_DEPLOY.md)**.

### Resumo Rápido

1. **Preparar código no GitHub:**
   - Siga o **[GUIA_GITHUB.md](./GUIA_GITHUB.md)** para enviar seu código para o GitHub

2. **Criar projeto no Easypanel:**
   - Crie um novo projeto tipo "Aplicativo"
   - Conecte com seu repositório GitHub
   - Configure as variáveis de ambiente (veja abaixo)

3. **Variáveis de Ambiente Necessárias:**
   ```
   PORT=3000
   API_KEY=62ba341e-4a6d-4572-b395-6a99f51010d9
   PGHOST=seu-host-postgresql
   PGPORT=5432
   PGDATABASE=clients&sales
   PGUSER=seu-usuario
   PGPASSWORD=sua-senha
   ```
   
   **Ou use DATABASE_URL:**
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

4. **Fazer Deploy:**
   - Clique em "Deploy" e aguarde o build
   - Copie a URL pública fornecida

5. **Atualizar Front-end:**
   - Siga o **[COMO_ATUALIZAR_FRONTEND.md](./COMO_ATUALIZAR_FRONTEND.md)** para atualizar o `coins-widget.html`

## 🔒 Segurança

- Todas as credenciais são gerenciadas via variáveis de ambiente
- A API requer autenticação via header `x-api-key`
- Validação de formato de e-mail no endpoint
- Tratamento de erros sem expor informações sensíveis

## 🛠️ Tecnologias Utilizadas

- **Node.js** 18+ (LTS)
- **Express.js** - Framework web
- **pg** - Cliente PostgreSQL
- **dotenv** - Gerenciamento de variáveis de ambiente (desenvolvimento)

## 📝 Notas Importantes

- O endpoint `POST /coins` **não cria** novos registros. Se o e-mail não existir, retorna 404.
- A validação de e-mail é básica (formato). Para validação mais rigorosa, considere usar uma biblioteca como `validator.js`.
- O pool de conexões PostgreSQL é gerenciado automaticamente pela biblioteca `pg`.
- O servidor suporta tanto variáveis de ambiente individuais (`PGHOST`, `PGPORT`, etc.) quanto `DATABASE_URL`.
- **Nunca** commite o arquivo `.env` no Git! Ele contém informações sensíveis. Use `.env.example` como template.

## 🚀 Quick Start

### 1. Clone o repositório
```bash
git clone https://github.com/SEU-USUARIO/coins-backend.git
cd coins-backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### 4. Execute o servidor
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 📖 Documentação Adicional

- **[GUIA_GITHUB.md](./GUIA_GITHUB.md)** - Como usar GitHub do zero
- **[GUIA_DEPLOY.md](./GUIA_DEPLOY.md)** - Deploy completo no Easypanel
- **[COMO_ATUALIZAR_FRONTEND.md](./COMO_ATUALIZAR_FRONTEND.md)** - Atualizar o front-end
- **[RESUMO_RAPIDO.md](./RESUMO_RAPIDO.md)** - Resumo visual do deploy

## 🐛 Troubleshooting

### Erro de conexão com PostgreSQL

- Verifique se as variáveis de ambiente estão configuradas corretamente
- Confirme que o banco de dados está acessível a partir do servidor
- Teste a conexão manualmente usando `psql` ou outra ferramenta

### Erro 401 (Invalid API key)

- Verifique se o header `x-api-key` está sendo enviado
- Confirme que o valor da variável `API_KEY` no servidor corresponde ao valor enviado

### Erro 500 (Internal server error)

- Verifique os logs do servidor no Easypanel
- Confirme que a tabela `coins` existe no banco de dados
- Verifique se o nome do banco está correto (incluindo caracteres especiais como `&`)

