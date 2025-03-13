# Étape 1 : Build du frontend Vue.js
FROM node:18 AS builder
WORKDIR /app
COPY package.json package-lock.json ./ 
RUN npm install --force
RUN npm install bcrypt --build-from-source
COPY . .
RUN npm run build

# Étape 2 : Configuration du backend + frontend
FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./ 
RUN npm install 
COPY . . 

# Copie du frontend buildé dans le backend (serveur statique)
COPY --from=builder /app/dist ./public

# Expose les ports du backend (4000) et du frontend (5173)
EXPOSE 4000 5173

# Commande pour lancer backend + frontend
CMD ["npx", "npm run dev"]
