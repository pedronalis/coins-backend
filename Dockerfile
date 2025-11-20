# Imagem base Node.js LTS
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json package-lock.json* ./

# Instala as dependências
RUN npm install --production

# Copia o código da aplicação
COPY . .

# Expõe a porta (padrão 3000, pode ser sobrescrita via PORT env)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "src/index.js"]

