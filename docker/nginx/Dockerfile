FROM nginx:1.27-alpine

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/sites/ /etc/nginx/sites-available/
COPY public/ /var/www/public/

# Build assets are provided via shared volume from app container
# No separate npm build needed - eliminates hash mismatch issue

EXPOSE 80 443
