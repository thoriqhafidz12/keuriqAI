#!/bin/sh
set -e

echo "🚀 keuriqAI Backend — Starting..."

# Wait briefly for MySQL to be reachable (shorter timeout)
echo "⏳ Checking database connection..."
max_attempts=10
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if php -r "
        try {
            new PDO(
                'mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_DATABASE'),
                getenv('DB_USERNAME'),
                getenv('DB_PASSWORD'),
                [
                    PDO::MYSQL_ATTR_SSL_CA => '/etc/ssl/certs/ca-certificates.crt',
                    PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
                ]
            );
            echo 'connected';
        } catch (Exception \$e) {
            exit(1);
        }
    " 2>/dev/null; then
        echo "✅ Database connected!"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts — retrying in 3s..."
    sleep 3
done

if [ $attempt -ge $max_attempts ]; then
    echo "⚠️  Could not connect to database — starting server anyway"
fi

# Cache configuration
echo "📦 Caching configuration..."
php artisan config:cache || echo "⚠️  config:cache skipped"
php artisan route:cache || echo "⚠️  route:cache skipped"
php artisan view:cache || echo "⚠️  view:cache skipped"

# Run migrations (idempotent — safe to run on every deploy)
echo "🔄 Running migrations..."
php artisan migrate --force --no-interaction || echo "⚠️  migrate skipped"

# Start PHP built-in server
PORT="${PORT:-8000}"
echo "🌐 Starting server on 0.0.0.0:$PORT..."
exec php artisan serve --host=0.0.0.0 --port="$PORT"
