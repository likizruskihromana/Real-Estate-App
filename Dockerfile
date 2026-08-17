FROM node:22-alpine AS build

ARG VITE_SENTRY_DSN
ARG VITE_APP_RELEASE
ARG VITE_POSTHOG_KEY
ARG VITE_POSTHOG_HOST
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN VITE_APP_RELEASE=$VITE_APP_RELEASE VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN SENTRY_ORG=$SENTRY_ORG SENTRY_PROJECT=$SENTRY_PROJECT

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
