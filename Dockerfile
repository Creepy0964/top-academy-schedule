FROM node:26-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY . ./src

CMD ["node", "src/index.ts"]