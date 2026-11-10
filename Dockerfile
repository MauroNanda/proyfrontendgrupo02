# --- Etapa 1: Build ---
FROM node:22.22.3-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Etapa 2: Servidor Nginx ---
FROM nginx:alpine

# Limpiar la carpeta destino
RUN rm -rf /usr/share/nginx/html/*

# Copiar el contenido de la subcarpeta browser a la raíz de Nginx
COPY --from=build /app/dist/convoca-frontend/browser /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]