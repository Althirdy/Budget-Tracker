FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
        unzip \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        intl \
        mbstring \
        pdo_mysql \
        zip

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

COPY docker/entrypoint.sh /usr/local/bin/budget-tracker-entrypoint
RUN chmod +x /usr/local/bin/budget-tracker-entrypoint

WORKDIR /var/www/html

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENTRYPOINT ["budget-tracker-entrypoint"]
CMD ["php-fpm"]
