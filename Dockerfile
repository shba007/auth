FROM node:lts-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json prisma ./

RUN npm ci

COPY . .

ENV NODE_ENV=production

RUN npm run build

FROM node:lts-alpine AS deployer

ARG VERSION

WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV NITRO_APP_VERSION=$VERSION

EXPOSE 3000

ENTRYPOINT ["node", ".output/server/index.mjs"]
