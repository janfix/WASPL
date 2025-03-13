# Étape 1 : Build du frontend Vue.js
FROM node:18 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Configuration du backend Node.js + Express
FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Copie du frontend buildé dans le backend (serveur statique)
COPY --from=builder /app/dist ./public

# Expose les ports pour le backend
EXPOSE 3011
CMD ["node", "server/index.js"]
