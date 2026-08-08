FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
WORKDIR /app

COPY dist .
RUN npm --omit=dev -f install

CMD [ "node", "main.js" ]
