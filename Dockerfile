# Build stage
FROM oven/bun:1 AS build
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the SvelteKit app
ARG DATABASE_URL
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS production
WORKDIR /app

# Copy built output from build stage
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./

# Install production dependencies only
RUN bun install --production --frozen-lockfile

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run the app
CMD ["bun", "./build"]
