FROM node:18-alpine

WORKDIR /app

# Copia apenas package.json primeiro (para cache de layers)
COPY package.json ./

# Instala dependências
RUN npm install --production --silent

# Copia o código fonte
COPY src ./src

# Expõe a porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "src/index.js"]

