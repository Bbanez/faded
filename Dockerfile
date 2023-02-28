FROM node:16-alpine

WORKDIR /app

COPY ./dist/ /app/

RUN npm i

ENTRYPOINT ["npm", "start"]
