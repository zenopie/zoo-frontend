# Use a lightweight base image
FROM nginx:latest

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom Nginx configuration file to the container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy your HTML file into the default nginx web root directory
COPY . /usr/share/nginx/html/
