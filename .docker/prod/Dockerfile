# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Instala dependências do sistema necessárias para compilar dependências nativas
RUN apk add --no-cache libc6-compat python3 make g++

# Copia arquivos de configuração do npm (se existir)
COPY .npmrc* ./

# Copia apenas arquivos de dependências
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies para build)
# Usa npm install sem --frozen-lockfile para compatibilidade com legacy-peer-deps
RUN npm install

# Copia código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copia apenas arquivos necessários para produção
# O output standalone já inclui todas as dependências necessárias
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

CMD ["node", "server.js"]
