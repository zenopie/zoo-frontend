# Use a lightweight base image
FROM nginx:latest

# Copy your HTML file into the default nginx web root directory
COPY . /usr/share/nginx/html/
