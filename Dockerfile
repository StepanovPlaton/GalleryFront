# --- Stage 1 ---
FROM node:latest as node

COPY . /application
WORKDIR /application

RUN ls -la .
RUN rm -rf node_modules && rm -rf package-lock.json && npm install
RUN npm install -g @angular/cli@14
RUN ng update @angular/core@14 @angular/cli@14
RUN npm run build --prod
RUN ls -la ./dist



# --- Stage 2 ---
FROM nginx:alpine as nginx

COPY --from=node /application/dist/gallery-front /usr/share/nginx/html
