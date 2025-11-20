# 🪙 Backend REST API - Coins

Backend REST em Node.js que serve como ponte entre o front-end (Elementor) e o banco de dados PostgreSQL para gerenciamento de moedas de ouro.

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
API_KEY=sua-api-key-aqui
PGHOST=localhost
PGPORT=5432
PGDATABASE=clients&sales
PGUSER=seu-usuario
PGPASSWORD=sua-senha
```

**⚠️ Importante:** Substitua `sua-api-key-aqui` pela sua API key real. Nunca compartilhe sua API key publicamente!

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
x-api-key: sua-api-key-aqui

{
  "email": "usuario@exemplo.com"
}
```

**⚠️ Nota:** Substitua `sua-api-key-aqui` pela sua API key real ao fazer requisições.

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

### 1. Preparação

Certifique-se de que todos os arquivos estão no repositório:
- `package.json`
- `Dockerfile`
- `src/` (todos os arquivos)

### 2. Configuração no Easypanel

1. **Crie um novo projeto** no Easypanel
2. **Selecione "Aplicativo"** como tipo de aplicação
3. **Configure o repositório** (GitHub, GitLab, etc.) ou faça upload dos arquivos
4. **Configure as variáveis de ambiente:**

   No painel do Easypanel, adicione as seguintes variáveis de ambiente:

   ```
   PORT=3000
   API_KEY=sua-api-key-aqui
   PGHOST=seu-host-postgresql
   PGPORT=5432
   PGDATABASE=clients&sales
   PGUSER=seu-usuario
   PGPASSWORD=sua-senha
   ```

   **⚠️ Importante:** Substitua `sua-api-key-aqui` pela sua API key real. Configure essa variável diretamente no painel do Easypanel, nunca no código!

   **Ou use DATABASE_URL:**
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

5. **Configure a porta:** O Easypanel geralmente detecta automaticamente, mas certifique-se de que a porta 3000 está exposta

6. **Deploy:** Clique em "Deploy" e aguarde o build e inicialização

### 3. Obter a URL Pública

Após o deploy, o Easypanel fornecerá uma URL pública (ex: `https://seu-app.easypanel.host`).

### 4. Configurar no Front-end

No arquivo `coins-widget.html`, atualize a constante `API_BASE_URL`:

```javascript
const API_BASE_URL = 'https://seu-app.easypanel.host';
```

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

