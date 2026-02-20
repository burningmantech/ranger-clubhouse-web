# Agent Skills Reference

This document provides quick-reference guides for common UI/UX tasks in the Clubhouse 2.0 application. Use these patterns when implementing features or making changes.

## Table of Contents

1. [Creating a New Page](#skill-creating-a-new-page)
2. [Adding a Button](#skill-adding-a-button)
3. [Creating a Form](#skill-creating-a-form)
4. [Creating a Modal](#skill-creating-a-modal)
5. [Creating a Table](#skill-creating-a-table)
6. [Creating a New UI Component](#skill-creating-a-new-ui-component)
7. [Adding Validation](#skill-adding-validation)
8. [Responsive Design](#skill-responsive-design)
9. [Styling Components](#skill-styling-components)

---

## SKILL: Creating a New Page

### Quick Pattern

**1. Create Route**:
```javascript
// app/routes/admin/example.js
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdminExampleRoute extends Route {
  @service store;

  model() {
    return this.store.findAll('example');
  }
}
```

**2. Create Controller** (optional, if you need actions/state):
```javascript
// app/controllers/admin/example.js
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class AdminExampleController extends Controller {
  @service house;
  @tracked selectedItem = null;

  @action
  async performAction() {
    // Action logic
  }
}
```

**3. Create Template**:
```handlebars
{{!-- app/templates/admin/example.hbs --}}
<main>
  <UiSection>
    <:title>
      Page Title
    </:title>
    <:actions>
      <UiButton @type="success" @onClick={{this.newItem}}>
        {{fa-icon "plus"}} New Item
      </UiButton>
    </:actions>
    <:body>
      {{!-- Page content here --}}
    </:body>
  </UiSection>
</main>
```

**4. Add Route to Router**:
```javascript
// app/router.js
Router.map(function() {
  this.route('admin', function() {
    this.route('example');
  });
});
```

### Checklist
- [ ] Route file created
- [ ] Controller created (if needed)
- [ ] Template created with proper layout
- [ ] Route added to router.js
- [ ] Navigation link added (if applicable)
- [ ] Page tested on mobile and desktop

---

## SKILL: Adding a Button

### Quick Patterns

**Primary Action Button**:
```handlebars
<UiButton @type="primary" @onClick={{this.handleClick}}>
  Button Text
</UiButton>
```

**Success Button (Save/Submit)**:
```handlebars
<UiButton @type="success" @onClick={{this.save}} @disabled={{this.isSaving}}>
  Save Changes
</UiButton>
```

**Cancel Button**:
```handlebars
<UiCancelButton @onClick={{this.cancel}} @disabled={{this.isProcessing}} />
```

**Delete Button**:
```handlebars
<UiDeleteButton @onClick={{this.confirmDelete}} />
```

**Edit Button**:
```handlebars
<UiEditButton @onClick={{fn this.edit item}} />
```

**Button with Icon**:
```handlebars
<UiButton @type="success" @onClick={{this.create}}>
  {{fa-icon "plus"}} Create New
</UiButton>
```

**Button Row (Horizontal Layout)**:
```handlebars
<UiButtonRow>
  <UiButton @type="success" @onClick={{this.save}}>Save</UiButton>
  <UiCancelButton @onClick={{this.cancel}} />
  <UiDeleteButton @onClick={{this.delete}} />
</UiButtonRow>
```

**Responsive Button (Full-width on Mobile)**:
```handlebars
<UiButton @type="primary" @responsive={{true}} @onClick={{this.action}}>
  Action
</UiButton>
```

### Button Types Reference

| Type | Color | Use Case |
|------|-------|----------|
| `primary` | Khaki | Main actions |
| `success` | Green | Save, Submit, Next |
| `secondary` | Gray | Secondary actions |
| `warning` | Yellow | Warning actions |
| `danger` | Red | Destructive actions |
| `gray` | Light Gray | Cancel, neutral |
| `info` | Cyan | Information |

### Controller Action Pattern

```javascript
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ExampleController extends Controller {
  @tracked isProcessing = false;

  @action
  async handleClick() {
    this.isProcessing = true;
    try {
      // Perform action
      await this.performSomeAction();
      this.house.toast.success('Action completed successfully');
    } catch (error) {
      this.house.handleError(error);
    } finally {
      this.isProcessing = false;
    }
  }
}
```

---

## SKILL: Creating a Form

### Quick Pattern

**1. Create Validation Rules**:
```javascript
// app/validations/example.js
import {
  validatePresence,
  validateLength,
  validateNumber,
  validateFormat
} from 'ember-changeset-validations/validators';

export default {
  title: [
    validatePresence({ presence: true, message: 'Title is required' }),
    validateLength({ min: 3, max: 100 })
  ],
  email: [
    validatePresence({ presence: true }),
    validateFormat({ type: 'email', message: 'Invalid email format' })
  ],
  age: [
    validateNumber({ integer: true, gte: 0, lte: 120 })
  ]
};
```

**2. Controller Setup**:
```javascript
// app/controllers/admin/example/edit.js
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import ExampleValidations from 'clubhouse/validations/example';

export default class AdminExampleEditController extends Controller {
  @service house;
  @tracked isSubmitting = false;

  exampleValidations = ExampleValidations;

  @action
  async saveAction(model, isValid, originalModel) {
    if (!isValid) {
      return; // Form shows errors automatically
    }

    this.isSubmitting = true;
    try {
      await this.house.saveModel(
        model,
        'Example saved successfully',
        () => this.transitionToRoute('admin.examples')
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  cancel() {
    this.transitionToRoute('admin.examples');
  }
}
```

**3. Template**:
```handlebars
{{!-- app/templates/admin/example/edit.hbs --}}
<main>
  <UiSection>
    <:title>
      {{if this.model.isNew "New Example" "Edit Example"}}
    </:title>
    <:body>
      <ChForm @formId="example"
              @formFor={{this.model}}
              @validator={{this.exampleValidations}}
              @onSubmit={{this.saveAction}} as |f|>

        <FormRow>
          <f.text @name="title"
                  @label="Title:"
                  @size={{50}}
                  @maxlength={{100}}
                  @hint="Enter a descriptive title"
                  @autofocus={{true}} />
        </FormRow>

        <FormRow>
          <f.select @name="status"
                    @label="Status:"
                    @options={{this.statusOptions}} />
        </FormRow>

        <FormRow>
          <f.checkbox @name="is_active"
                      @label="Active" />
        </FormRow>

        <FormRow>
          <f.textarea @name="description"
                      @label="Description:"
                      @rows={{5}}
                      @cols={{60}} />
        </FormRow>

        <UiButtonRow>
          <f.submit @label="Save" @disabled={{this.isSubmitting}} />
          <UiCancelButton @onClick={{this.cancel}} @disabled={{this.isSubmitting}} />
        </UiButtonRow>
      </ChForm>
    </:body>
  </UiSection>
</main>
```

### Field Types Quick Reference

```handlebars
{{!-- Text input --}}
<f.text @name="field_name" @label="Label:" @size={{40}} />

{{!-- Number input --}}
<f.number @name="quantity" @label="Quantity:" @min={{0}} @max={{100}} />

{{!-- Password --}}
<f.password @name="password" @label="Password:" />

{{!-- Select (single) --}}
<f.select @name="type" @label="Type:" @options={{this.options}} />

{{!-- Select (multiple) --}}
<f.select @name="tags" @label="Tags:" @options={{this.tags}} @multiple={{true}} />

{{!-- Checkbox --}}
<f.checkbox @name="enabled" @label="Enabled" />

{{!-- Radio group --}}
<f.radioGroup @name="priority" @label="Priority:" @options={{this.priorities}} />

{{!-- Checkbox group --}}
<f.checkboxGroup @name="features" @label="Features:" @options={{this.features}} />

{{!-- Textarea --}}
<f.textarea @name="notes" @label="Notes:" @rows={{5}} @cols={{60}} />

{{!-- Search (live autocomplete) --}}
<f.search @name="person_id"
          @label="Person:"
          @searchField="callsign"
          @searchAction={{this.searchPeople}} />

{{!-- Date/Time picker --}}
<f.datetime @name="start_time" @label="Start Time:" />

{{!-- WYSIWYG editor --}}
<f.editor @name="content" @label="Content:" />
```

### Select Options Patterns

```javascript
// Simple array
statusOptions = ['Active', 'Inactive', 'Pending'];

// Text/Value pairs
statusOptions = [
  ['Active', 'active'],
  ['Inactive', 'inactive'],
  ['Pending', 'pending']
];

// Object format
statusOptions = [
  { id: 'active', title: 'Active' },
  { id: 'inactive', title: 'Inactive' }
];

// Grouped options
categoryOptions = [
  {
    groupName: 'Primary',
    options: ['Option 1', 'Option 2']
  },
  {
    groupName: 'Secondary',
    options: ['Option 3', 'Option 4']
  }
];
```

---

## SKILL: Creating a Modal

### Quick Patterns

**Confirmation Modal**:
```handlebars
{{!-- In template --}}
{{#if this.showDeleteConfirm}}
  <ModalConfirm @title="Confirm Delete"
                @onConfirm={{this.confirmDelete}}
                @onCancel={{this.cancelDelete}}>
    <p>Are you sure you want to delete <strong>{{this.itemToDelete.name}}</strong>?</p>
    <p class="text-danger">This action cannot be undone.</p>
  </ModalConfirm>
{{/if}}
```

```javascript
// In controller
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ExampleController extends Controller {
  @tracked showDeleteConfirm = false;
  @tracked itemToDelete = null;

  @action
  promptDelete(item) {
    this.itemToDelete = item;
    this.showDeleteConfirm = true;
  }

  @action
  async confirmDelete() {
    try {
      await this.itemToDelete.destroyRecord();
      this.house.toast.success('Item deleted');
    } catch (error) {
      this.house.handleError(error);
    } finally {
      this.showDeleteConfirm = false;
      this.itemToDelete = null;
    }
  }

  @action
  cancelDelete() {
    this.showDeleteConfirm = false;
    this.itemToDelete = null;
  }
}
```

**Information Modal**:
```handlebars
{{#if this.showInfo}}
  <ModalInfo @title="Information"
             @onClose={{this.closeInfo}}>
    <p>Information content goes here.</p>
  </ModalInfo>
{{/if}}
```

**Custom Modal Dialog**:
```handlebars
{{#if this.showCustomModal}}
  <ModalDialog @title="Custom Modal"
               @size="lg"
               @onHide={{this.closeModal}}>
    <:body>
      <p>Modal body content</p>
      <ChForm @formId="modal-form" @formFor={{this.formData}} as |f|>
        <f.text @name="field" @label="Field:" />
      </ChForm>
    </:body>
    <:footer @align="end">
      <UiButton @type="success" @onClick={{this.saveModal}}>Save</UiButton>
      <UiCancelButton @onClick={{this.closeModal}} />
    </:footer>
  </ModalDialog>
{{/if}}
```

### Modal Sizes
- `sm` - Small (99% width)
- `md` - Medium (90% width)
- Default - Large (Bootstrap default)

---

## SKILL: Creating a Table

### Quick Patterns

**Standard Data Table**:
```handlebars
<UiTable @stickyHeader={{true}}>
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
      <th>Created</th>
      <th class="text-end">Actions</th>
    </tr>
  </thead>
  <tbody>
    {{#each this.items as |item|}}
      <tr>
        <td>{{item.name}}</td>
        <td><UiBadgeActive @active={{item.is_active}} /></td>
        <td>{{shift-format item.created_at}}</td>
        <td class="text-end">
          <UiEditButton @onClick={{fn this.edit item}} />
          <UiDeleteButton @onClick={{fn this.delete item}} />
        </td>
      </tr>
    {{else}}
      <tr>
        <td colspan="4" class="text-center text-muted">
          No items found
        </td>
      </tr>
    {{/each}}
  </tbody>
</UiTable>
```

**Label/Value Grid Table**:
```handlebars
<UiGridTable>
  <UiGridTableLabel>Name:</UiGridTableLabel>
  <UiGridTableColumn>{{this.item.name}}</UiGridTableColumn>

  <UiGridTableLabel>Status:</UiGridTableLabel>
  <UiGridTableColumn>
    <UiBadgeActive @active={{this.item.is_active}} />
  </UiGridTableColumn>

  <UiGridTableLabel>Description:</UiGridTableLabel>
  <UiGridTableColumn>{{this.item.description}}</UiGridTableColumn>
</UiGridTable>
```

**Table with Sorting** (using controller):
```javascript
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { sort } from '@ember/object/computed';

export default class ExampleController extends Controller {
  @tracked sortBy = ['name:asc'];

  @sort('model', 'sortBy') sortedItems;

  @action
  sortByColumn(column) {
    const currentSort = this.sortBy[0];
    const [currentColumn, currentDir] = currentSort.split(':');

    if (currentColumn === column) {
      // Toggle direction
      const newDir = currentDir === 'asc' ? 'desc' : 'asc';
      this.sortBy = [`${column}:${newDir}`];
    } else {
      this.sortBy = [`${column}:asc`];
    }
  }
}
```

**Empty State Pattern**:
```handlebars
{{#if this.items.length}}
  <UiTable>
    {{!-- Table content --}}
  </UiTable>
{{else}}
  <UiAlert @type="info" @icon="info-circle">
    No items found. Click "New Item" to create one.
  </UiAlert>
{{/if}}
```

---

## SKILL: Creating a New UI Component

### Component Creation Checklist

**1. Determine Component Type**:
- Reusable UI component → `ui-*` prefix
- Domain-specific → Domain prefix (e.g., `person-*`, `ticket-*`)
- Page-specific → No prefix, descriptive name

**2. Generate Component**:
```bash
ember generate component ui-example
```

**3. Template** (`app/components/ui-example.hbs`):
```handlebars
<div class="ui-example {{if @variant (concat "ui-example-" @variant)}}" ...attributes>
  {{#if (has-block "title")}}
    <div class="ui-example-title">
      {{yield to="title"}}
    </div>
  {{/if}}
  {{#if (has-block)}}
    {{yield}}
  {{else if @content}}
    {{@content}}
  {{/if}}
</div>
```

**4. JavaScript** (`app/components/ui-example.js`):
```javascript
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class UiExampleComponent extends Component {
  @tracked internalState = false;

  get computedClass() {
    return `ui-example-${this.args.type ?? 'default'}`;
  }

  @action
  handleAction() {
    // Action logic
    this.args.onAction?.();
  }
}
```

**5. Styling** (if needed, `app/styles/ui-example.scss`):
```scss
.ui-example {
  padding: 10px;
  background-color: #ffffff;

  &-title {
    font-weight: bold;
    margin-bottom: 10px;
  }

  &-primary {
    border-color: $kakhi;
  }
}
```

Then import in `app/styles/app.scss`:
```scss
@import "ui-example";
```

**6. Usage Example in Component Documentation**:
```handlebars
{{!-- Basic usage --}}
<UiExample @type="primary" @onAction={{this.handleAction}}>
  Content
</UiExample>

{{!-- With named blocks --}}
<UiExample>
  <:title>Title</:title>
  Body content
</UiExample>
```

### Component API Design Patterns

**Arguments** (use `@` prefix):
- `@type` - Variant type (primary, secondary, etc.)
- `@size` - Size (sm, md, lg)
- `@disabled` - Boolean state
- `@onAction` - Callback functions

**Yielding**:
- Simple yield: `{{yield}}`
- Named blocks: `{{yield to="blockName"}}`
- Hash components: `{{yield (hash childComponent=...)}}`

**Spreading attributes**:
- Use `...attributes` to allow custom classes and attributes

---

## SKILL: Adding Validation

### Validation Rule Patterns

**Create Validation File** (`app/validations/model-name.js`):
```javascript
import {
  validatePresence,
  validateLength,
  validateNumber,
  validateFormat,
  validateInclusion,
  validateConfirmation
} from 'ember-changeset-validations/validators';

export default {
  // Required field
  title: [
    validatePresence({ presence: true, message: 'Title is required' })
  ],

  // Required with length constraints
  description: [
    validatePresence({ presence: true }),
    validateLength({ min: 10, max: 500, message: 'Must be 10-500 characters' })
  ],

  // Email validation
  email: [
    validatePresence({ presence: true }),
    validateFormat({ type: 'email', message: 'Invalid email address' })
  ],

  // Number validation
  age: [
    validateNumber({
      integer: true,
      gte: 0,
      lte: 120,
      message: 'Must be between 0 and 120'
    })
  ],

  // Inclusion validation
  status: [
    validateInclusion({
      list: ['active', 'inactive', 'pending'],
      message: 'Invalid status'
    })
  ],

  // Confirmation validation
  password: [
    validatePresence({ presence: true }),
    validateLength({ min: 8 })
  ],
  passwordConfirmation: [
    validateConfirmation({ on: 'password', message: 'Passwords must match' })
  ],

  // Custom validation
  customField: [
    (key, newValue, oldValue, changes, content) => {
      if (newValue && newValue.includes('forbidden')) {
        return 'Cannot contain forbidden word';
      }
      return true; // Valid
    }
  ]
};
```

### Available Validators

| Validator | Purpose | Example |
|-----------|---------|---------|
| `validatePresence` | Required field | `validatePresence({ presence: true })` |
| `validateLength` | String length | `validateLength({ min: 3, max: 50 })` |
| `validateNumber` | Numeric validation | `validateNumber({ integer: true, gte: 0 })` |
| `validateFormat` | Pattern matching | `validateFormat({ type: 'email' })` |
| `validateInclusion` | Allowed values | `validateInclusion({ list: ['a', 'b'] })` |
| `validateExclusion` | Forbidden values | `validateExclusion({ list: ['bad'] })` |
| `validateConfirmation` | Match another field | `validateConfirmation({ on: 'password' })` |

### Custom Validation Function

```javascript
function validateCustom(options = {}) {
  return (key, newValue, oldValue, changes, content) => {
    // Validation logic
    if (/* invalid condition */) {
      return options.message || 'Invalid value';
    }
    return true; // Valid
  };
}

// Usage
export default {
  field: [validateCustom({ message: 'Custom error' })]
};
```

---

## SKILL: Responsive Design

### Breakpoint Reference

```scss
xs: 0px       // Extra small (default, mobile)
sm: 576px     // Small (large phone)
md: 768px     // Medium (tablet)
lg: 992px     // Large (small desktop)
xl: 1200px    // Extra large (desktop)
xxl: 1400px   // Extra extra large (wide screen)
```

### Common Responsive Patterns

**Responsive Columns**:
```handlebars
<div class="row">
  <div class="col-12 col-md-6 col-lg-4">
    {{!-- Full width on mobile, half on tablet, third on desktop --}}
  </div>
</div>
```

**Responsive Visibility**:
```handlebars
{{!-- Show only on mobile --}}
<div class="d-block d-md-none">Mobile only</div>

{{!-- Show only on desktop --}}
<div class="d-none d-lg-block">Desktop only</div>

{{!-- Hide on print --}}
<div class="d-print-none">Not printed</div>
```

**Responsive Spacing**:
```handlebars
{{!-- Different padding on mobile vs desktop --}}
<div class="p-2 p-lg-4">
  Smaller padding on mobile, larger on desktop
</div>

{{!-- Different margin --}}
<div class="mb-2 mb-lg-4">
  Smaller margin on mobile
</div>
```

**Responsive Text**:
```handlebars
{{!-- Center on mobile, left on desktop --}}
<p class="text-center text-lg-start">Text content</p>

{{!-- Different sizes --}}
<h1 class="fs-4 fs-lg-1">Responsive heading</h1>
```

**Responsive Flexbox**:
```handlebars
{{!-- Stack on mobile, row on desktop --}}
<div class="d-flex flex-column flex-lg-row">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

**Responsive Width**:
```handlebars
{{!-- Full width on mobile, 50% on desktop --}}
<div class="w-100 w-lg-50">Content</div>
```

### Testing Responsive Design

**Browser DevTools**:
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test various device sizes

**Common Test Sizes**:
- iPhone SE: 375 x 667
- iPhone 12: 390 x 844
- iPad: 768 x 1024
- Desktop: 1920 x 1080

---

## SKILL: Styling Components

### Styling Approach Decision Tree

1. **Can I use a Bootstrap utility class?**
   - YES → Use Bootstrap utility (preferred)
   - NO → Continue to 2

2. **Does a `ui-*` component exist for this?**
   - YES → Use the existing component
   - NO → Continue to 3

3. **Is this styling specific to one component?**
   - YES → Add to component-specific SCSS file
   - NO → Add to shared SCSS file

### Bootstrap Utility Classes

**Spacing** (margin/padding):
```html
<div class="m-0">No margin</div>
<div class="mt-3">Margin top 3</div>
<div class="p-4">Padding 4</div>
<div class="px-2 py-3">Horizontal 2, Vertical 3</div>
```

**Colors**:
```html
<div class="text-primary">Primary text</div>
<div class="bg-success">Success background</div>
<div class="text-white bg-danger">White on red</div>
```

**Display**:
```html
<div class="d-none">Hidden</div>
<div class="d-block">Block</div>
<div class="d-flex">Flex container</div>
<div class="d-inline-block">Inline block</div>
```

**Flexbox**:
```html
<div class="d-flex justify-content-between align-items-center">
  <div>Left</div>
  <div>Right</div>
</div>
```

**Text**:
```html
<div class="text-center">Centered</div>
<div class="text-end">Right aligned</div>
<div class="fw-bold">Bold</div>
<div class="fst-italic">Italic</div>
<div class="text-decoration-none">No underline</div>
```

**Borders**:
```html
<div class="border">Border all sides</div>
<div class="border-top border-bottom">Top and bottom</div>
<div class="border-primary">Primary color border</div>
<div class="rounded">Rounded corners</div>
```

**Width/Height**:
```html
<div class="w-25">25% width</div>
<div class="w-50">50% width</div>
<div class="w-100">100% width</div>
<div class="h-50">50% height</div>
```

**Custom Width Utilities** (5% increments):
```html
<div class="w-5">5%</div>
<div class="w-15">15%</div>
<div class="w-35">35%</div>
<div class="w-85">85%</div>
```

### Component-Specific SCSS

**When to create SCSS file**:
- Component has complex styling
- Styling isn't achievable with Bootstrap utilities
- Multiple related classes needed

**File structure**:
```scss
// app/styles/my-component.scss

.my-component {
  background-color: $light-gray;
  border: 1px solid $gray;

  &-title {
    font-weight: bold;
    color: $kakhi;
  }

  &-active {
    background-color: $success;
  }

  // Nested element
  .my-nested {
    padding: 5px;
  }

  // Responsive
  @media (min-width: 992px) {
    padding: 20px;
  }
}
```

**Import in app.scss**:
```scss
@import "my-component";
```

### Using SCSS Variables

```scss
// Reference colors from bootstrap-custom.scss
color: $kakhi;
background-color: $wheatfield;
border-color: $gray;

// Use Bootstrap variables
padding: $card-spacer-y $card-spacer-x;
font-family: $font-family-sans-serif;
```

### Common Color Usage

```scss
// Backgrounds
.section-header {
  background-color: $light-gray; // #f0f0f0
}

// Borders
.bordered-box {
  border: 1px solid $gray; // #dcdcdc
}

// Text
.primary-text {
  color: $kakhi; // #d2b48c
}

// States
.success-state {
  background-color: rgba($success, 0.1);
  border-color: $success;
}
```

---

## Common Patterns Quick Reference

### Loading State
```handlebars
{{#if this.isLoading}}
  <div class="text-center p-4">
    {{fa-icon "spinner" spin=true size="2x"}}
    <p class="mt-2">Loading...</p>
  </div>
{{else}}
  {{!-- Content --}}
{{/if}}
```

### Error Handling
```javascript
@action
async performAction() {
  try {
    await this.someAsyncAction();
    this.house.toast.success('Success message');
  } catch (error) {
    this.house.handleError(error);
  }
}
```

### Confirmation Before Action
```javascript
@action
async deleteItem(item) {
  const confirmed = await this.modal.confirm(
    'Delete Item',
    `Are you sure you want to delete ${item.name}?`,
    'Delete'
  );

  if (confirmed) {
    await item.destroyRecord();
    this.house.toast.success('Item deleted');
  }
}
```

### Toast Notifications
```javascript
// Success
this.house.toast.success('Operation completed');

// Warning
this.house.toast.warning('Please review this');

// Error
this.house.toast.error('Something went wrong');

// Info
this.house.toast.info('Information message');
```

### Saving with house.saveModel
```javascript
@action
async save(model) {
  await this.house.saveModel(
    model,
    'Record saved successfully',
    () => this.transitionToRoute('list.route')
  );
}
```

---

## Checklist for New Features

### Before Starting
- [ ] Read DESIGN-GUIDELINES.md
- [ ] Check for existing similar components
- [ ] Understand the data model
- [ ] Plan responsive behavior

### During Development
- [ ] Use existing `ui-*` components
- [ ] Follow naming conventions (snake_case fields, camelCase JS)
- [ ] Add proper validation
- [ ] Include loading and error states
- [ ] Test on mobile and desktop
- [ ] Add helpful error messages

### Before Committing
- [ ] Run linter: `npm run lint`
- [ ] Fix linting errors: `npm run lint:fix`
- [ ] Run tests: `npm test`
- [ ] Test in browser manually
- [ ] Check responsive design
- [ ] Verify accessibility (keyboard navigation, labels)

---

## Quick Command Reference

```bash
# Start development server
npm start

# Run tests
npm test
npm run test:ember

# Lint code
npm run lint
npm run lint:fix

# Generate component
ember generate component component-name

# Generate route
ember generate route route-name

# Generate model
ember generate model model-name

# Build for production
npm run build
```

---

## Getting Help

- **Design Guidelines**: See DESIGN-GUIDELINES.md for comprehensive patterns
- **Form Help**: See README-ch-form.md for form component details
- **Development**: See README-development.md for conventions
- **CLAUDE.md**: Project overview for AI assistance

For specific component usage, check `/app/components/` for examples of existing components.
