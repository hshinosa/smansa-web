FROM node:20-alpine AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM php:8.4-cli-alpine AS composer-builder
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_pgsql mbstring exif pcntl bcmath gd intl redis opcache zip \
    && apk add --no-cache git unzip
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

FROM php:8.4-fpm-alpine AS app-runtime
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_pgsql mbstring exif pcntl bcmath gd intl redis opcache zip

WORKDIR /var/www
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY . .
COPY --from=composer-builder /var/www/vendor ./vendor
COPY --from=node-builder /app/public/build ./public/build
COPY --from=node-builder /app/public/build /opt/build-assets

RUN rm -f bootstrap/cache/*.php \
    && APP_ENV=production CACHE_STORE=array SESSION_DRIVER=file QUEUE_CONNECTION=sync php artisan package:discover --ansi \
    && chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

COPY docker/php-fpm/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php-fpm/zz-custom.conf /usr/local/etc/php-fpm.d/zz-custom.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]

FROM python:3.11-alpine AS scraper-runtime
WORKDIR /var/www/instagram-scraper
COPY instagram-scraper/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY instagram-scraper/ ./
RUN mkdir -p downloads runtime
CMD ["python3", "scraper.py"]
