# syntax=docker/dockerfile:1
# -----------------------------------------------------------------------------
# This stage builds the development image
# -----------------------------------------------------------------------------
# Note we need a version of Node that is supported by ember-cli.
# See: https://github.com/ember-cli/ember-cli/blob/master/docs/node-support.md
#
FROM node:24-alpine AS development

# Set up build directory
WORKDIR /build

# Install dependencies first so this layer is cached and only re-runs when
# package*.json (or a patch) changes.
#  - `npm ci` installs EXACTLY the tree in package-lock.json (deterministic,
#    matches the lint/test CI jobs) and fails loudly on lock/package mismatch.
#  - patches/ is copied BEFORE the install so the `postinstall: patch-package`
#    hook can apply them. Do NOT reorder these.
#  - The BuildKit cache mount persists npm's download cache across builds
#    (works in tandem with the buildx gha layer cache in CI).
COPY package*.json ./
COPY ./patches/           ./patches/
RUN --mount=type=cache,target=/root/.npm npm ci

# ember-cli is a project-local devDependency (governed by package-lock.json),
# so it is invoked via the local binary (npx) rather than an unpinned global
# install.
COPY ./app/               ./app/
COPY ./config/            ./config/
COPY ./mirage/            ./mirage/
COPY ./public/            ./public/
COPY ./tests/             ./tests/
COPY ["./.ember-cli.js", "./ember-cli-build.js", "./testem.js", "./"]


# -----------------------------------------------------------------------------
# This stage builds the Ember application
# -----------------------------------------------------------------------------

FROM development AS build

# Build the application using the project-local, lockfile-pinned ember-cli.
RUN npx ember build --environment production;

# -----------------------------------------------------------------------------
# This stage builds the application container using Nginx
# -----------------------------------------------------------------------------
FROM nginx:1.31-alpine AS application

# Copy ONLY the built client from the build container. node_modules, the
# toolchain, patches, and source never reach the shipped image.
COPY --from=build /build/dist /var/www/application/client

# Replace Nginx default site config
COPY ./docker/nginx-default.conf /etc/nginx/conf.d/default.conf

# Set working directory to document root
WORKDIR /var/www/application/client
