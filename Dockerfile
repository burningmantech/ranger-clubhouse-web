# -----------------------------------------------------------------------------
# This stage builds the Ember application
# -----------------------------------------------------------------------------
# Note we need a version of Node that is supported by ember-cli.
# See: https://github.com/ember-cli/ember-cli/blob/master/docs/node-support.md
#
FROM node:10.15-alpine as build

# Install Yarn
RUN apk add --no-cache yarn;

# Install Ember CLI
# "unsafe-perm" step is a workaround for a bug.
# See: https://github.com/npm/uid-number/issues/7
RUN npm config set unsafe-perm true;
RUN npm install -g ember-cli;

# Install ESLint, used by test_lint
RUN npm install -g eslint;
RUN npm install -g eslint-plugin-ember;
RUN npm install -g babel-eslint;

RUN yarn --version; ember --version;

WORKDIR /build
COPY ./ ./

# Install dependencies
RUN yarn install;

# Build the application
RUN ember build --environment production;


# -----------------------------------------------------------------------------
# This stage builds the application container using Nginx
# -----------------------------------------------------------------------------
FROM nginx:1.15-alpine

# Copy the application with dependencies from the build container
COPY --from=build /build/dist /var/www/application/client

# Replace Nginx default site config
COPY ./docker/nginx-default.conf /etc/nginx/conf.d/default.conf

# Set working directory to document root
WORKDIR /var/www/application/client
