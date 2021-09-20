# The Black Rock Rangers Clubhouse 2.0 - A Single Page Application (SPA) frontend

[![Build Status](https://github.com/burningmantech/ranger-clubhouse-web/workflows/CI%2fCD/badge.svg)](https://github.com/burningmantech/ranger-clubhouse-web/actions)

The Clubhouse is a volunteer coordination website to help manage the Burning Man Project's Black Rock Rangers department.

Want to know more about the Rangers? [Visit the Rangers' website](https://rangers.burningman.org) for more information.

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd ranger-clubhouse-web`
* `npm install`

## Running / Development

* Make sure the API server is running, see ranger-clubhouse-api/README.md

* Start the Clubhouse `npm start`
* Visit the Clubhouse at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

## API Server Endpoint

The API endpoint is specified in app/config/environment.js

For the development environment this is http://localhost:8000/

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test` runs all tests once, launching and quitting a browser
* `ember test --filter=unit` runs all tests whose module declaration includes “unit”
* `ember test --server` runs tests when changes are made
* Visiting http://localhost:4200/tests in a browser will run tests (optionally filtered) when changes are made to any code or test

Ember uses [QUnit](https://api.qunitjs.com/) for tests.
[qunit-dom](http://qunit-dom.com/) is included in the testing framework to provide higher level assertions for QUnit.

### Linting

* `npm run lint:hbs`
* `npm run lint:js`
* `npm run lint:js -- --fix`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

TODO

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
* [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
* [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
