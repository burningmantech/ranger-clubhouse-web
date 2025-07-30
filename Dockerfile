# -----------------------------------------------------------------------------
# This stage builds the development image
# -----------------------------------------------------------------------------
# Note we need a version of Node that is supported by ember-cli.
# See: https://github.com/ember-cli/ember-cli/blob/master/docs/node-support.md
#
FROM node:20-alpine as development


# Install Ember CLI
RUN npm install --global ember-cli && \
    ember --version && \
    npm install --global eslint && \
    eslint --version;

# Set up build directory
WORKDIR /build

# The copy creates a cache in the primary layer. The only time to re-run
# the npm install and related commands is if package*.json changes.
COPY package*.json ./
RUN npm install

COPY ./app/               ./app/
COPY ./config/            ./config/
COPY ./mirage/            ./mirage/
COPY ./public/            ./public/
COPY ./patches/           ./patches/
COPY ./tests/             ./tests/
COPY ["./.ember-cli.js", "./.eslintignore", "./.eslintrc.js", "./ember-cli-build.js", "./package.json", "./package-lock.json", "./testem.js", "./"]


# -----------------------------------------------------------------------------
# This stage builds the Ember application
# -----------------------------------------------------------------------------

FROM development as build

# Install dependencies & build the application
RUN ember build --environment production;

# -----------------------------------------------------------------------------
# This stage builds the application container using Nginx
# -----------------------------------------------------------------------------
FROM nginx:1.21.6-alpine as application

# Copy the application with dependencies from the build container
COPY --from=build /build/dist /var/www/application/client

# Replace Nginx default site config
COPY ./docker/nginx-default.conf /etc/nginx/conf.d/default.conf

# Set working directory to document root
WORKDIR /var/www/application/client
