# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Common commands for working with this codebase:

- `npm start` - Start development server at http://localhost:4200 (requires API server running at http://localhost:8000)
- `npm test` - Run full test suite (lint + all tests)
- `npm run test:ember` - Run Ember tests only
- `npm run lint` - Run all linters (JS, HBS, CSS)
- `npm run lint:fix` - Auto-fix linting issues
- `npm run lint:hbs` - Lint Handlebars templates
- `npm run lint:js` - Lint JavaScript files
- `npm run build` - Production build
- `ember test --server` - Run tests in watch mode
- `ember test --filter=unit` - Run specific test types

## Architecture Overview

### Framework Stack

- **Ember.js 5.12** (Octane Edition) with Glimmer components
- **Ember Data 5.3.13** for ORM/data layer
- **Bootstrap 5** with custom SCSS
- **QUnit + Mirage.js** for testing with API mocking
- **ember-changeset** for non-destructive form editing
- **ember-simple-auth** for authentication

### Key Architectural Patterns

**Components**:
- Glimmer components using `@tracked` properties and decorators (no classic components)
- Components located in `/app/components` (427 files) - most UI logic lives here
- Use `@action` decorator for component actions

**Forms**:
- Custom `ch-form` component for all forms (see README-ch-form.md for details)
- Uses ember-changeset to create non-destructive clones of models during editing
- Validation rules stored in `/app/validations` directory
- Field types: text, select, radio, checkbox, textarea, radioGroup, checkboxGroup, search
- Form submissions pass (model, isValid, originalModel) to onSubmit action

**Data Flow**:
- Ember Data models → Routes → Controllers → Components
- Models in `/app/models` (52 files)
- Routes handle data loading and model hooks
- Controllers manage page-level state and actions

**Services**:
- Singleton services for shared state: `house`, `session`, `ajax`, `modal`, `toast`, `shift-manage`
- Services are application-wide and persist across routes

**API Mocking**:
- Mirage.js provides mock API responses in development/testing
- Mirage configuration in `/mirage` directory
- Fixtures in `/mirage/fixtures`, factories in `/mirage/factories`
- API endpoint: http://localhost:8000/ (development)

**Directory Structure** (high-level):
```
/app
  /components       # 427 Glimmer components (most UI logic)
  /models          # 52 Ember Data models
  /routes          # Route handlers and data loading
  /controllers     # Page-level state and actions
  /services        # Application-wide singleton services
  /validations     # Form validation rules (per-form)
  /styles          # SCSS stylesheets
  /helpers         # Template helpers
/tests             # QUnit tests with Mirage fixtures
  /acceptance      # Full application flow tests
  /integration     # Component integration tests
  /unit            # Unit tests for models, services, etc.
/mirage            # API mocking for development/testing
  /factories       # Mirage data factories
  /fixtures        # Mock data fixtures
```

## Naming Conventions

Follow these conventions consistently throughout the codebase:

- **CSS classes**: `dash-case`
- **Form fields**: `snake_case`
- **API fields**: `snake_case` (API fields typically mirror database column names)
- **Variables/methods/objects**: `camelCase`
- **Numeric/string constants**: `UPPERCASE_SNAKE_CASE`
- **Array/object constants**: `Capitalized`
- **Class names**: `Capitalized`

## Important Patterns & Gotchas

### Bootstrap & Styling

- Uses Bootstrap 5 with custom utilities
- Custom width utilities: `w-5`, `w-10`, `w-15`, ..., `w-100` (5% increments)
  - Default Bootstrap only provides: `w-25`, `w-50`, `w-75`, `w-100`
- Standard table styling: `class="table table-striped table-hover"`
- SCSS stylesheets in `/app/styles`
- Printing: Use `d-print-none` class to hide elements when printing
  - Header, footer, and sidebar already have `d-print-none` set

### Form Handling with ch-form

**Basic Pattern**:
```handlebars
<ChForm @formId="unique-form-id"
        @formFor={{this.model}}
        @validator={{this.validationRules}}
        @onSubmit={{this.saveAction}}
        @onCancel={{this.cancelAction}} as |f|>
  <FormRow>
    <f.text @name="field_name" @label="Label:" />
  </FormRow>
  <f.submit @disabled={{this.isSubmitting}} />
</ChForm>
```

**Key Points**:
- Forms use ember-changeset to create a proxy/clone of the model
- Changes don't affect the original model until explicitly saved
- Validation rules defined in `/app/validations` directory
- onSubmit receives: (changeset, isValid, originalModel)
- Always set default values for `<select>` elements (SPA behavior differs from traditional forms)

**Available Field Types**:
- `f.text` - Text input
- `f.select` - Dropdown (supports multiple selection)
- `f.radio` - Single radio button
- `f.checkbox` - Single checkbox
- `f.textarea` - Multi-line text
- `f.radioGroup` - Group of radio buttons
- `f.checkboxGroup` - Group of checkboxes
- `f.search` - Live search with power-select-typeahead

### Known Gotchas

**EmberJS Link-to Errors**:
- EmberJS will show spurious "not enough parameters" errors for `{{link-to}}` when:
  - The backing router has a syntax error
  - The backing controller has a syntax error
  - The controller uses a non-existent variable
- Fix the syntax error or undefined variable to resolve

**Test Timers**:
- The testing framework waits for ALL active timers to expire before finishing a test
- Outstanding `setTimeout()` or `setInterval()` calls may cause tests to hang
- Ensure all timers are properly cleaned up in tests

**Select Elements in Forms**:
- Always set a default value for `<select>` elements
- In SPAs, form submission uses variable values, NOT the current DOM state
- If no default is set, the field may be undefined even if something appears selected in the UI

**API Configuration**:
- Development API endpoint: http://localhost:8000/
- Configured in `app/config/environment.js`
- Ensure the API server (ranger-clubhouse-api) is running before starting the web app

### Photo Storage

The Clubhouse supports two photo storage backends (controlled by PhotoStorage setting):

**Storage Methods**:
- `photos-s3`: Stores photos in S3 rangers-photo bucket
- `photos-local`: Stores photos in local directory `storage/photos`

**Photo Editing Requirements**:
- Uses CropperJS for image manipulation
- Requires CORS headers: `Access-Control-Allow-Origin: *`
- Without correct CORS headers, browser prevents the app from reading image contents

## Testing

**Test Framework**:
- QUnit for test framework
- qunit-dom for higher-level DOM assertions
- Mirage.js for API mocking

**Test Types**:
- Acceptance tests: Full application flow testing
- Integration tests: Component integration testing
- Unit tests: Models, services, utilities

**Test Data**:
- Mirage fixtures in `/mirage/fixtures`
- Mirage factories in `/mirage/factories`
- @faker-js/faker available for generating test data

**Running Tests**:
- `npm test` - Run all tests once
- `ember test --server` - Watch mode (reruns on changes)
- `ember test --filter=unit` - Filter by test type
- Visit http://localhost:4200/tests in browser for interactive testing

## Additional Documentation

### General Documentation
- `README.md` - General setup and installation
- `README-development.md` - Development guidelines and conventions
- `README-ch-form.md` - Detailed ch-form component documentation
- `README-photos.md` - Photo storage configuration

### UI/UX Design Documentation
- `DESIGN-GUIDELINES.md` - Comprehensive UI/UX design system and component library
- `AGENT-SKILLS.md` - Quick-reference guides for common UI tasks (creating pages, forms, modals, tables, components)
- `UI-CONSISTENCY-NOTES.md` - Identified UI inconsistencies and recommendations for improvement

## Prerequisites

- Node.js >= 20
- npm
- Ember CLI
- Git
- Google Chrome (for testing)
- ranger-clubhouse-api server running at http://localhost:8000
