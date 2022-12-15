# syntax=docker/dockerfile:1

FROM node:16
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app
# WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

WORKDIR /usr/src/app/frontend

RUN npm run build

WORKDIR /usr/src/app

EXPOSE 5501

CMD [ "node", "server.js" ]