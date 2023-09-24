# Use a lightweight base image
FROM nginx:latest

# Copy your custom Nginx configuration file into the container
COPY nginx.conf /etc/nginx/nginx.conf

# Copy your HTML file into the default nginx web root directory
COPY . /usr/share/nginx/html/
