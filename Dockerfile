# -----------------------------------------------------------------------------
# This stage builds the development image
# -----------------------------------------------------------------------------
# Note we need a version of Node that is supported by ember-cli.
# See: https://github.com/ember-cli/ember-cli/blob/master/docs/node-support.md
#
FROM node:10.15-alpine as development

# Install Yarn
RUN apk add --no-cache yarn;
RUN yarn --version;

# Install Ember CLI
# "unsafe-perm" step is a workaround for a bug.
# See: https://github.com/npm/uid-number/issues/7
RUN npm config set unsafe-perm true;
RUN npm install --global ember-cli;
RUN ember --version;

# Install ESLint, used by test_lint
RUN npm install --global eslint;
RUN eslint --version;

# Set up build directory
WORKDIR /build

COPY ./app/               ./app/
COPY ./config/            ./config/
COPY ./mirage/            ./mirage/
COPY ./public/            ./public/
COPY ./tests/             ./tests/
COPY ./vendor/            ./vendor/
COPY ./.ember-cli         ./
COPY ./.eslintignore      ./
COPY ./.eslintrc.js       ./
COPY ./ember-cli-build.js ./
COPY ./package.json       ./
COPY ./testem.js          ./
COPY ./yarn.lock          ./


# -----------------------------------------------------------------------------
# This stage builds the Ember application
# -----------------------------------------------------------------------------

FROM development as build

# Install dependencies
RUN yarn install;

# Build the application
RUN ember build --environment production;


# -----------------------------------------------------------------------------
# This stage builds the application container using Nginx
# -----------------------------------------------------------------------------
FROM nginx:1.15-alpine as application

# Copy the application with dependencies from the build container
COPY --from=build /build/dist /var/www/application/client

# Replace Nginx default site config
COPY ./docker/nginx-default.conf /etc/nginx/conf.d/default.conf

# Set working directory to document root
WORKDIR /var/www/application/client
