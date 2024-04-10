FROM node:18.17.0-alpine
RUN apk update && apk add bash
WORKDIR /
COPY package*.json ./
RUN npm install
RUN npm install dotenv
COPY . .
CMD npm run start