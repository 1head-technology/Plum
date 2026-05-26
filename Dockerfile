# Build Vue application
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve static file with nginx
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Custom Nginx config to handle Vue routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose application
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
