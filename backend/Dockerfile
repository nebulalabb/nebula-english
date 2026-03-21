FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
# If using workspaces, we might need more files, but for a single service Dockerfile:
# COPY pnpm-workspace.yaml ./ 

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN pnpm run build

# Production image
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/prisma ./prisma

EXPOSE 4001

CMD ["node", "dist/app.js"]
