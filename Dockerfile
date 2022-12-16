# syntax=docker/dockerfile:1

FROM --platform=linux/amd64 node:16
ENV NODE_ENV=production

# backend
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js /usr/src/app

# frontend
RUN mkdir -p /usr/src/app/frontend
COPY frontend /usr/src/app/frontend/
WORKDIR /usr/src/app/frontend
RUN npm ci --omit=dev
RUN npm run build

# run
WORKDIR /usr/src/app
EXPOSE 5501
CMD [ "node", "server.js" ]
