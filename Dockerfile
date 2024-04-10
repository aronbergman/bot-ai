FROM node:18.17.0-alpine
RUN apk update && apk add bash
WORKDIR /
COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm install dotenv
COPY . .
CMD npm run start