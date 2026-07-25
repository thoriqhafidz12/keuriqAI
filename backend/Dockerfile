# ─── Build Stage ───────────────────────────────────────────────────────────
FROM php:8.3-cli-alpine AS builder

WORKDIR /app

# System dependencies for PHP extensions
RUN apk add --no-cache \
    curl \
    git \
    unzip \
    # pdo_mysql
    mariadb-dev \
    # mbstring
    oniguruma-dev \
    # gd
    libpng-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    zlib-dev \
    # xml
    libxml2-dev \
    # bcmath (uses system lib)
    # Standard build tools
    linux-headers \
    $PHPIZE_DEPS

# Configure & install PHP extensions
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
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
    # pdo_mysql runtime
    mariadb-client \
    mariadb-connector-c \
    # mbstring runtime
    oniguruma \
    # gd runtime
    libpng \
    freetype \
    libjpeg-turbo \
    libwebp \
    # xml runtime
    libxml2 \
    # healthcheck
    busybox-extras \
    # PHP build tools (needed for docker-php-ext-install in runtime)
    $PHPIZE_DEPS

# Install PHP extensions (same as builder for consistency)
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        bcmath \
        gd \
    # Clean up build dependencies to keep image small
    && apk del --no-cache \
        autoconf \
        make \
        gcc \
        g++ \
        libc-dev \
        pkgconf \
        re2c \
        linux-headers \
        mariadb-dev \
        oniguruma-dev \
        libpng-dev \
        freetype-dev \
        libjpeg-turbo-dev \
        libwebp-dev \
        zlib-dev \
        libxml2-dev \
        binutils \
        file \
        isl \
        libatomic \
        libgomp \
        libstdc++-dev \
        mpc1 \
        mpfr-dev \
        gmp-dev \
        musl-dev

# Create user & group (drop root privileges)
RUN addgroup -g 1000 -S laravel && \
    adduser -u 1000 -S laravel -G laravel

# Copy from builder (vendor + app code with optimized autoloader)
COPY --from=builder /app /app

# Create storage symlink to /tmp (Railway ephemeral storage)
RUN rm -rf /app/storage && \
    mkdir -p /tmp/storage/app \
             /tmp/storage/framework/cache \
             /tmp/storage/framework/sessions \
             /tmp/storage/framework/views \
             /tmp/storage/logs \
    && ln -s /tmp/storage /app/storage \
    && mkdir -p /tmp/bootstrap/cache \
    && rm -rf /app/bootstrap/cache \
    && ln -s /tmp/bootstrap/cache /app/bootstrap/cache

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
