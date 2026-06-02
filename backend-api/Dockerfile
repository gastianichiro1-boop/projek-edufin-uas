FROM php:8.2-cli

# 1. Pasang komponen sistem Linux & dukungan database
RUN apt-get update -y && apt-get install -y openssl zip unzip git libpq-dev libmariadb-dev
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql

# 2. Pasang sistem Composer terbaru
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 3. Tentukan folder kerja di dalam komputer cloud
WORKDIR /app
COPY . .

# 4. Rakit komponen bodi Laravel (Vendor)
RUN composer install --optimize-autoloader --no-dev

# 5. Nyalakan mesin otomatis & jalankan migrasi database setiap kali aktif
CMD sh -c "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"
