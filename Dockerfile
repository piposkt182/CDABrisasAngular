FROM node:20-alpine AS build-step
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

FROM nginx:1.25-alpine

# 👇 Copiamos directo el build
COPY --from=build-step /app/dist/CDABrisas/browser /usr/share/nginx/html

# 👇 NUEVO: configuración SPA para nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
