FROM php:8.3-cli-alpine

WORKDIR /app

# ─── System Dependencies ─────────────────────────────────────────────────
RUN apk add --no-cache \
    curl \
    git \
    unzip \
    # PHP extension build deps
    mariadb-dev \
    oniguruma-dev \
    libpng-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    zlib-dev \
    gmp-dev \
    libxml2-dev \
    autoconf \
    gcc \
    g++ \
    make \
    pkgconf \
    re2c \
    linux-headers

# ─── PHP Extensions ─────────────────────────────────────────────────────
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        bcmath \
        gmp \
        gd

# ─── Composer ───────────────────────────────────────────────────────────
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json ./
RUN composer install --no-dev --no-interaction --no-scripts --prefer-dist --quiet

# ─── Application ────────────────────────────────────────────────────────
COPY . .

# Generate dummy .env for artisan commands during build
RUN echo "APP_KEY=" > .env \
    && composer dump-autoload --optimize --no-dev \
    && rm .env

# ─── Storage (ephemeral for Railway) ────────────────────────────────────
RUN rm -rf storage bootstrap/cache \
    && mkdir -p /tmp/storage/app \
             /tmp/storage/framework/cache \
             /tmp/storage/framework/sessions \
             /tmp/storage/framework/views \
             /tmp/storage/logs \
    && ln -s /tmp/storage storage \
    && mkdir -p /tmp/bootstrap/cache \
    && ln -s /tmp/bootstrap/cache bootstrap/cache

# ─── User & Permissions ─────────────────────────────────────────────────
RUN addgroup -g 1000 -S laravel \
    && adduser -u 1000 -S laravel -G laravel \
    && chown -R laravel:laravel /app /tmp/storage /tmp/bootstrap

USER laravel

EXPOSE 8000

# ─── Entrypoint ─────────────────────────────────────────────────────────
COPY --chown=laravel:laravel docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
