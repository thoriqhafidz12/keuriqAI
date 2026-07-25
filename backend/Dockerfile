# ─── Build Stage ───────────────────────────────────────────────────────────
FROM php:8.3-cli-alpine AS builder

WORKDIR /app

# System dependencies
RUN apk add --no-cache \
    curl \
    git \
    unzip \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev

# PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    bcmath \
    gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy composer files first (cache layer)
COPY composer.json composer.lock ./

# Install production dependencies only
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-autoloader \
    --no-scripts \
    --prefer-dist \
    --quiet

# Copy application code
COPY . .

# Generate optimized autoloader
RUN composer dump-autoload \
    --no-dev \
    --optimize \
    --classmap-authoritative

# ─── Runtime Stage ────────────────────────────────────────────────────────
FROM php:8.3-cli-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    libpng \
    oniguruma \
    libxml2 \
    fcgi \
    # For health checks
    busybox-extras

# PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    bcmath \
    gd

# Create user & group (drop root privileges)
RUN addgroup -g 1000 -S laravel && \
    adduser -u 1000 -S laravel -G laravel

# Copy from builder
COPY --from=builder /app /app

# Create storage symlink to /tmp (Railway ephemeral storage)
RUN rm -rf /app/storage && \
    mkdir -p /tmp/storage/app /tmp/storage/framework /tmp/storage/logs && \
    ln -s /tmp/storage /app/storage && \
    mkdir -p /tmp/bootstrap/cache && \
    rm -rf /app/bootstrap/cache && \
    ln -s /tmp/bootstrap/cache /app/bootstrap/cache

# Set permissions
RUN chown -R laravel:laravel /app /tmp/storage /tmp/bootstrap

# Switch to non-root user
USER laravel

# Expose port (Railway uses $PORT env var, default to 8000)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/up || exit 1

# Entrypoint script
COPY --chown=laravel:laravel docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
