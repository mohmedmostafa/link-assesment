FROM node:19-alpine

WORKDIR /app

COPY package*.json ./
COPY package.json /app

RUN npm ci

COPY . .

RUN npm run build

ADD run.sh ./app/run.sh
RUN chmod +x ./app/run.sh
CMD [ "/bin/sh", "./run.sh" ]

