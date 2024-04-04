FROM node:18.17.1-alpine
RUN apk update && apk add bash
WORKDIR /admin
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
CMD npm run start