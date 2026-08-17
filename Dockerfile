FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run client:build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/server ./server
COPY --from=build /app/client ./client
COPY --from=build /app/uploads ./uploads

RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["node", "server/index.js"]
