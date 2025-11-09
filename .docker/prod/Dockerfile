# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Instala dependências do sistema necessárias para compilar dependências nativas
RUN apk add --no-cache libc6-compat python3 make g++

# Copia apenas arquivos de dependências
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies para build)
RUN npm install --frozen-lockfile

# Copia código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copia apenas arquivos de dependências
COPY package*.json ./

# Instala APENAS dependências de produção
RUN npm install --frozen-lockfile --omit=dev && npm cache clean --force

# Copia apenas arquivos necessários para produção
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

CMD ["node", "server.js"]
