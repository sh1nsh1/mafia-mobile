FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY .npmrc .
RUN npm ci
COPY . .
RUN npx expo export --platform web --output-dir dist

FROM nginx:1.28-alpine AS production
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]