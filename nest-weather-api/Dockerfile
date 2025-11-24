FROM node:24-alpine

WORKDIR /app

RUN npm install -g @nestjs/cli

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9090

CMD ["npm", "run", "start:dev"]