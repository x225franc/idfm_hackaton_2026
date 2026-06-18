FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG BACKEND_URL=http://localhost:3001
ARG FRONTEND_URL=http://localhost
ARG GOOGLE_CLIENT_ID
ARG WEBSITE_NAME=Comutitres
ARG PAYMENT_ENABLED=false

# vite.config.js charge le .env depuis le dossier parent (/app -> /)
RUN printf "ENV=production\nBACKEND_URL=%s\nFRONTEND_URL=%s\nGOOGLE_CLIENT_ID=%s\nWEBSITE_NAME=%s\nPAYMENT_ENABLED=%s\n" \
    "${BACKEND_URL}" "${FRONTEND_URL}" "${GOOGLE_CLIENT_ID}" "${WEBSITE_NAME}" "${PAYMENT_ENABLED}" > /.env

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
