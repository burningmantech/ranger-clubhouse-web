# Clubhouse 2.0 Design Guidelines

This document provides comprehensive UX/UI design guidelines for the Black Rock Rangers Clubhouse 2.0 web application.

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Component Library](#component-library)
5. [Layout Patterns](#layout-patterns)
6. [Form Design](#form-design)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [Code Examples](#code-examples)

---

## Design System Overview

### Framework & Technologies
- **Base Framework**: Bootstrap 5 with custom SCSS
- **Component System**: Ember.js Glimmer components
- **Icons**: Font Awesome
- **Form Management**: ember-changeset with validation
- **Date/Time**: Air Datepicker
- **Testing**: QUnit + Mirage.js

### Design Philosophy
- **Mobile-first**: Responsive design with mobile as the default
- **Accessibility**: Semantic HTML with ARIA attributes
- **Consistency**: Reusable components with predictable APIs
- **Simplicity**: Clean, functional design with minimal decoration

---

## Color Palette

### Primary Colors

```scss
$kakhi: #d2b48c          // Primary brand color (warm, neutral)
$wheatfield: #ded7be     // Secondary brand color
```

### Semantic Colors

```scss
// Bootstrap semantic colors
$success: #198754        // Green - success states, positive actions
$warning: #ffc107        // Yellow - warnings, caution
$danger: #dc3545         // Red - errors, destructive actions
$info: #0dcaf0           // Cyan - informational messages
$secondary: #6c757d      // Gray - secondary actions
```

### Gray Scale

```scss
$light-gray: #f0f0f0     // Backgrounds, section headers
$gray: #dcdcdc           // Borders, dividers
$dark-gray: #808080      // Disabled states, secondary text
```

### Accent Colors

```scss
$light-red: #ff6666      // Light red for emphasis
$highlight: #ffff99      // Yellow highlight
$orange: #ff8c00         // Active tab state
```

### Usage Guidelines

**Primary (Khaki)**:
- Main call-to-action buttons
- Navbar background
- Primary branding elements
- Links (defaults to primary color)

**Success (Green)**:
- Form submit buttons
- Success messages
- Positive confirmations
- "Next" buttons in wizards

**Warning (Yellow)**:
- Warning alerts
- Caution messages
- Section title warnings (rgba overlay)

**Danger (Red)**:
- Delete buttons (when confirmed)
- Error messages
- Destructive action confirmations

**Gray**:
- Cancel buttons
- Secondary actions
- Disabled states

**Info (Cyan)**:
- Information alerts
- Help text
- Non-critical notifications

---

## Typography

### Font Family

```scss
$font-family-sans-serif: "Source Sans Pro", system-ui, -apple-system,
  "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans",
  "Liberation Sans", Arial, sans-serif;
```

### Font Sizes

```scss
$font-size-base: 0.9rem       // Base font size (smaller than Bootstrap default)

// Headings (scaled from base)
$h1-font-size: 1.575rem       // base * 1.75
$h2-font-size: 1.35rem        // base * 1.5
$h3-font-size: 1.215rem       // base * 1.35
$h4-font-size: 1.125rem       // base * 1.25
$h5-font-size: 0.99rem        // base * 1.1
$h6-font-size: 0.9rem         // base * 1.0
```

### Font Weights

```scss
$headings-font-weight: 400    // Normal weight (lighter than Bootstrap default)
$badge-font-weight: 400       // Normal weight
```

### Typography Guidelines

1. **Headings**: Use semantic HTML (`<h1>` - `<h6>`) for proper structure
2. **Body text**: Default 0.9rem for improved readability
3. **Button text**: `white-space: nowrap` to prevent wrapping
4. **Table numbers**: `font-variant-numeric: tabular-nums` for alignment

---

## Component Library

### Core UI Components

All reusable UI components use the `ui-*` prefix and are located in `/app/components/`.

#### Buttons

**Base Button Component**: `ui-button`

```handlebars
<UiButton @type="primary" @size="sm" @onClick={{this.handleClick}}>
  Button Text
</UiButton>
```

**Button Types** (via `@type` parameter):
- `primary` (default) - Khaki background
- `secondary` - Gray background
- `success` - Green background
- `warning` - Yellow background
- `danger` - Red background
- `info` - Cyan background
- `gray` - Light gray background
- `light-red` - Light red background
- `khaki` - Explicit khaki
- `wheatfield` - Wheatfield color

**Button Sizes** (via `@size` parameter):
- `sm` (default) - Small button
- `md` - Medium button
- `lg` - Large button

**Button Modifiers**:
- `@disabled={{true}}` - Disabled state
- `@responsive={{true}}` - Full width on mobile

**Specialized Button Components**:

```handlebars
{{!-- Cancel button (gray, btn-link style) --}}
<UiCancelButton @onClick={{this.cancel}} />

{{!-- Delete button (default: gray, with trash icon) --}}
<UiDeleteButton @onClick={{this.delete}} />

{{!-- Edit button (default: secondary, with edit icon) --}}
<UiEditButton @onClick={{this.edit}} />

{{!-- Close button (default: gray) --}}
<UiCloseButton @onClick={{this.close}} />

{{!-- Export CSV button (canonical name: UiExportToCSVButton) --}}
<UiExportToCSVButton @onClick={{this.exportCsv}} />
```

**Specialized Button Defaults**:
| Component | Default `@type` |
|---|---|
| `UiCancelButton` | `gray` (btn-link) |
| `UiDeleteButton` | `gray` |
| `UiEditButton` | `secondary` |
| `UiCloseButton` | `gray` |

All specialized buttons accept `@type` to override the default, plus `@size`, `@responsive`, and `@disabled`.

**Button Layout**:

```handlebars
{{!-- Horizontal button row with 1rem gap --}}
<UiButtonRow>
  <UiButton @type="success" @onClick={{this.save}}>Save</UiButton>
  <UiCancelButton @onClick={{this.cancel}} />
</UiButtonRow>
```

#### Alerts

**Alert Component**: `ui-alert`

```handlebars
<UiAlert @type="warning" @icon="exclamation-triangle" @bottom="3">
  This is a warning message with an icon and bottom margin.
</UiAlert>
```

**Alert Types**:
- `primary` (default) - Khaki background
- `success` - Green background
- `warning` - Yellow background
- `danger` - Red background
- `info` - Cyan background
- `secondary` - Gray background

**Parameters**:
- `@icon` - Font Awesome icon name (optional)
- `@iconType` - Icon type (solid, regular, etc.)
- `@bottom` - Bottom margin (0-5)

#### Shared State Primitives

##### Loading States

Use `UiLoading` for all loading states. The `@variant` parameter selects the display style.

```handlebars
{{!-- Inline loading (default) - use inside buttons or inline text --}}
<UiLoading @text="Saving" />

{{!-- Section loading - full-page or section-level spinner --}}
<UiLoading @variant="section" @text="Loading records" />

{{!-- Modal loading - shows a modal dialog with spinner --}}
<UiLoading @variant="modal" @text="Processing" />
```

Existing wrapper components (`LoadingIndicator`, `LoadingPane`, `LoadingDialog`) remain supported and delegate to `UiLoading` internally. For new code, prefer `UiLoading` directly.

##### Empty States

Use `UiEmptyState` whenever a table, list, or view has no records to show.

```handlebars
<UiEmptyState @title="No results found"
              @description="Try adjusting your filters."
              @icon="inbox">
  {{!-- Optional action block --}}
  <UiButton @onClick={{this.reset}}>Reset Filters</UiButton>
</UiEmptyState>
```

**Parameters**:
- `@title` - Primary heading (required)
- `@description` - Explanatory text (optional)
- `@icon` - Font Awesome icon name (optional)
- `@iconType` - Icon type (optional)
- Block content renders in an action container below description (optional)

##### Error Messages

Use `UiErrorMessage` for inline error display tied to a specific section or form.

```handlebars
{{!-- Single error string or Ember Data error object --}}
<UiErrorMessage @error={{this.saveError}} />

{{!-- Array of error strings --}}
<UiErrorMessage @errors={{this.validationErrors}} />

{{!-- With dismiss --}}
<UiErrorMessage @error={{this.error}} @onDismiss={{this.clearError}} />
```

For global/application-level errors use `this.house.handleErrorResponse()`. `UiErrorMessage` is for scoped, inline error feedback.

#### Sections

**Section Component**: `ui-section`

```handlebars
<UiSection @isWarning={{false}}>
  <:title>Section Title</:title>
  <:actions>
    <UiButton @onClick={{this.action}}>Action</UiButton>
  </:actions>
  <:body>
    Section content goes here.
  </:body>
</UiSection>
```

**Features**:
- White background with box-shadow
- Optional title bar with gray background
- Optional actions area (right-aligned in title bar)
- Warning mode: yellow-tinted title background
- 10px padding, 20px bottom margin

**Section Subtitle**: `ui-section-subtitle`

```handlebars
<UiSectionSubtitle @icon="info-circle">
  Subtitle text
</UiSectionSubtitle>
```

#### Tables

**Standard Table**: `ui-table`

```handlebars
<UiTable @stickyHeader={{true}}>
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</UiTable>
```

**Parameters**:
- `@stickyHeader={{true}}` - Sticky header on scroll
- `@noStriped={{true}}` - Remove striped rows
- `@normalSize={{true}}` - Use normal font size (default is small)
- `@noWidthAuto={{true}}` - Disable automatic width

**Default Styling**:
- Small font size (`table-sm`)
- Striped rows (light blue `#eff8fd`)
- Hover effect (`table-hover`)
- Header: `#DFE1EA` background, `#3f454d` text
- Automatic width calculation

**Grid Table**: `ui-grid-table` (for label/value pairs)

```handlebars
<UiGridTable>
  <UiGridTableLabel>Label:</UiGridTableLabel>
  <UiGridTableColumn>Value</UiGridTableColumn>

  <UiGridTableLabel>Another:</UiGridTableLabel>
  <UiGridTableColumn>Another Value</UiGridTableColumn>
</UiGridTable>
```

**Layout**: CSS Grid with 120px label column + 5fr content column

#### Badges

**Badge Component**: `ui-badge`

```handlebars
<UiBadge @type="success">Active</UiBadge>
```

**Badge Types**: Uses Bootstrap `text-bg-*` classes
- `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `light`, `dark`

**Active/Inactive Badge**: `ui-badge-active`

```handlebars
<UiBadgeActive @active={{true}} />
{{!-- Shows green "Active" or red "Inactive" --}}
```

#### Accordions

**Accordion Component**: `ui-accordion`

```handlebars
<UiAccordion>
  <UiAccordionTitle @isOpen={{this.isOpen}} @onClick={{this.toggle}}>
    Accordion Title
  </UiAccordionTitle>
  <UiAccordionBody @isOpen={{this.isOpen}}>
    Accordion content goes here.
  </UiAccordionBody>
</UiAccordion>
```

**Features**:
- Plus/minus icon based on open state
- Smooth collapse animation
- Gray background with border

#### Info Box

**Info Box Component**: `ui-info-box`

```handlebars
<UiInfoBox>
  <:title>Information</:title>
  <:body>
    Detailed information content.
  </:body>
</UiInfoBox>
```

**Styling**: Blue border (`border-primary-subtle`) with light blue background

#### Wizard

**Multi-step Wizard**: `ui-wizard`

```handlebars
<UiWizard>
  <UiWizardStep @title="Step 1"
                @onNext={{this.nextStep}}
                @onBack={{this.previousStep}}
                @onCancel={{this.cancel}}
                @isFirstStep={{true}}
                @isLastStep={{false}}>
    Step 1 content
  </UiWizardStep>
</UiWizard>
```

**Button Pattern**:
- Back button (if not first step)
- Cancel button (gray)
- Next/Finish button (success green)

---

## Layout Patterns

### Page Structure

```handlebars
{{!-- Standard page layout --}}
<main>
  <UiSection>
    <:title>Page Title</:title>
    <:actions>
      <UiButton @onClick={{this.action}}>Action</UiButton>
    </:actions>
    <:body>
      {{!-- Page content --}}
    </:body>
  </UiSection>
</main>
```

### Spacing

```scss
// Main content padding
main {
  padding: 10px 20px;
}

// Section spacing
.ui-section {
  margin-bottom: 20px;
  padding: 10px;
}

// Section title (negative margin pulls it to edges)
.ui-section-title {
  margin: -10px -10px 10px -10px;
  padding: 10px;
}
```

### Responsive Layout

**Mobile-first Approach**:
- Full-width elements on mobile
- Flexible layout on desktop
- Bootstrap breakpoints: `sm`, `md`, `lg`, `xl`, `xxl`

**Common Patterns**:

```handlebars
{{!-- Full width on mobile, auto width on desktop --}}
<div class="col-sm-12 col-lg-auto">
  Content
</div>

{{!-- Responsive button --}}
<UiButton @responsive={{true}}>Button</UiButton>
```

### Width Utilities

Custom width utilities in 5% increments:

```html
<div class="w-5">5% width</div>
<div class="w-10">10% width</div>
<div class="w-15">15% width</div>
<!-- ... up to ... -->
<div class="w-100">100% width</div>
```

### Grid Layouts

**Bootstrap Grid**:

```handlebars
<div class="row">
  <div class="col-md-6">Half width</div>
  <div class="col-md-6">Half width</div>
</div>
```

**CSS Columns** (for lists):

```html
<ul class="columns-3">
  <li>Item 1</li>
  <li>Item 2</li>
  <!-- ... -->
</ul>
```

Available: `columns-3`, `columns-4`, `columns-5`, `columns-6`

---

## Form Design

### Form System: ch-form

The Clubhouse uses a custom form builder component (`ch-form`) that provides:
- Non-destructive editing via ember-changeset
- Integrated validation via ember-changeset-validations
- Consistent field styling and error handling
- Automatic layout management

### Basic Form Pattern

```handlebars
<ChForm @formId="unique-form-id"
        @formFor={{this.model}}
        @validator={{this.validations}}
        @onSubmit={{this.saveAction}}
        @onCancel={{this.cancelAction}} as |f|>

  <FormRow>
    <f.text @name="field_name"
            @label="Field Label:"
            @hint="Optional help text"
            @size={{40}} />
  </FormRow>

  <FormRow>
    <f.select @name="status"
              @label="Status:"
              @options={{this.statusOptions}} />
  </FormRow>

  <f.submit @label="Save" @disabled={{this.isSubmitting}} />
  <UiCancelButton @onClick={{this.cancelAction}} />
</ChForm>
```

### Available Field Types

**Text Inputs**:
```handlebars
{{!-- Text field --}}
<f.text @name="title" @label="Title:" @size={{50}} @maxlength={{100}} />

{{!-- Number field --}}
<f.number @name="quantity" @label="Quantity:" @min={{0}} @max={{100}} />

{{!-- Password field --}}
<f.password @name="password" @label="Password:" />

{{!-- Textarea --}}
<f.textarea @name="description" @label="Description:" @rows={{5}} @cols={{60}} />
```

**Select Inputs**:
```handlebars
{{!-- Single select --}}
<f.select @name="type"
          @label="Type:"
          @options={{this.typeOptions}} />

{{!-- Multiple select --}}
<f.select @name="categories"
          @label="Categories:"
          @options={{this.categoryOptions}}
          @multiple={{true}} />
```

**Radio & Checkbox**:
```handlebars
{{!-- Single checkbox --}}
<f.checkbox @name="is_active" @label="Active?" />

{{!-- Radio group --}}
<f.radioGroup @name="status"
              @label="Status:"
              @options={{this.statusOptions}} />

{{!-- Checkbox group --}}
<f.checkboxGroup @name="permissions"
                 @label="Permissions:"
                 @options={{this.permissionOptions}} />
```

**Advanced Fields**:
```handlebars
{{!-- Live search with autocomplete --}}
<f.search @name="person_id"
          @label="Person:"
          @searchField="callsign"
          @searchAction={{this.searchPeople}} />

{{!-- Date/time picker --}}
<f.datetime @name="start_time"
            @label="Start Time:" />

{{!-- WYSIWYG editor --}}
<f.editor @name="content"
          @label="Content:" />
```

### Field Options

**Common Parameters**:
- `@name` (required) - Field name (snake_case)
- `@label` - Field label
- `@hint` - Help text below field
- `@placeholder` - Placeholder text
- `@disabled` - Disabled state
- `@autofocus` - Auto-focus on render
- `@inline` - Inline layout (label beside field)

**Select Options Format**:

```javascript
// Simple array
['Option 1', 'Option 2', 'Option 3']

// Value/text pairs
[['text1', 'value1'], ['text2', 'value2']]

// Object format (ember-powerselect style)
[
  { id: 1, title: 'Option 1' },
  { id: 2, title: 'Option 2' }
]

// Grouped options
[
  {
    groupName: 'Group 1',
    options: ['Option 1', 'Option 2']
  }
]
```

### Form Validation

**Validation Setup**:

1. Define validation rules in `/app/validations/`:

```javascript
// app/validations/role.js
import { validatePresence, validateLength } from 'ember-changeset-validations/validators';

export default {
  title: [
    validatePresence({ presence: true, message: 'Enter a role name.' }),
    validateLength({ min: 3, max: 50 })
  ],
  new_user_eligible: [
    validatePresence({ presence: true })
  ]
};
```

2. Import and use in controller:

```javascript
import RoleValidations from 'clubhouse/validations/role';

export default class RoleController extends Controller {
  roleValidations = RoleValidations;

  @action
  saveAction(model, isValid, originalModel) {
    if (!isValid) {
      return;
    }
    // Save logic here
  }
}
```

### Form Layout Patterns

**FormRow**: Groups related fields

```handlebars
<FormRow>
  <f.text @name="first_name" @label="First:" @inline={{true}} />
  <f.text @name="last_name" @label="Last:" @inline={{true}} />
</FormRow>
```

**Responsive Layout**:
- Labels above fields on mobile
- Fixed-width labels on desktop (for `@inline={{true}}`)
- Full-width fields on small screens

---

## Responsive Design

### Breakpoints

```scss
// Bootstrap 5 breakpoints
xs: 0px       // Extra small (default)
sm: 576px     // Small
md: 768px     // Medium
lg: 992px     // Large
xl: 1200px    // Extra large
xxl: 1400px   // Extra extra large
```

### Common Responsive Patterns

**Show/Hide**:
```html
<div class="d-none d-lg-block">Desktop only</div>
<div class="d-block d-lg-none">Mobile only</div>
```

**Responsive Spacing**:
```html
<div class="p-2 p-lg-4">More padding on desktop</div>
```

**Responsive Columns**:
```html
<div class="col-12 col-md-6 col-lg-4">
  Responsive column widths
</div>
```

**Responsive Buttons**:
```handlebars
<UiButton @responsive={{true}}>Full-width on mobile</UiButton>
```

### Print Styles

**Hide on Print**:
```html
<header class="d-print-none">Hidden when printing</header>
```

**Page Breaks**:
```html
<div class="d-print-page-break">Forces page break before</div>
```

---

## Accessibility

### Semantic HTML

Always use semantic HTML elements:
- `<button>` for buttons (not `<div>` with click handlers)
- `<nav>` for navigation
- `<main>` for main content
- `<section>` for sections
- `<header>`, `<footer>` for page structure
- Proper heading hierarchy (`<h1>` → `<h6>`)

### ARIA Attributes

```handlebars
{{!-- Modal example with ARIA --}}
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Modal Title</h2>
</div>

{{!-- Button with descriptive label --}}
<button aria-label="Close dialog">
  {{fa-icon "times"}}
</button>
```

### Form Accessibility

- Label every form field with `<label>`
- Use `for` attribute to associate labels with inputs
- Provide hint text for complex fields
- Show clear error messages
- Use appropriate input types (`type="email"`, `type="tel"`, etc.)

### Focus Management

```javascript
// Auto-focus on field
<f.text @name="title" @autofocus={{true}} />

// Manage focus after action
@action
clickAction(e) {
  e.target.blur(); // Remove focus after click
  // Perform action
}
```

---

## Code Examples

### Complete Page Example

```handlebars
{{!-- app/templates/admin/roles.hbs --}}
<main>
  <UiSection>
    <:title>
      Role Management
    </:title>
    <:actions>
      <UiButton @type="success" @onClick={{this.newRole}}>
        {{fa-icon "plus"}} New Role
      </UiButton>
    </:actions>
    <:body>
      <UiAlert @type="info" @icon="info-circle" @bottom="3">
        Roles define permissions and access levels.
      </UiAlert>

      <UiTable @stickyHeader={{true}}>
        <thead>
          <tr>
            <th>Role Name</th>
            <th>New User Eligible</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {{#each this.roles as |role|}}
            <tr>
              <td>{{role.title}}</td>
              <td><UiBadgeActive @active={{role.new_user_eligible}} /></td>
              <td>
                <UiEditButton @onClick={{fn this.editRole role}} />
                <UiDeleteButton @onClick={{fn this.deleteRole role}} />
              </td>
            </tr>
          {{/each}}
        </tbody>
      </UiTable>
    </:body>
  </UiSection>
</main>
```

### Complete Form Example

```handlebars
{{!-- app/templates/admin/role/edit.hbs --}}
<main>
  <UiSection>
    <:title>
      {{if this.role.isNew "New Role" "Edit Role"}}
    </:title>
    <:body>
      <ChForm @formId="role"
              @formFor={{this.role}}
              @validator={{this.roleValidations}}
              @onSubmit={{this.saveRole}} as |f|>

        <FormRow>
          <f.text @name="title"
                  @label="Role Name:"
                  @size={{40}}
                  @maxlength={{50}}
                  @hint="Enter a descriptive name for this role"
                  @autofocus={{true}} />
        </FormRow>

        <FormRow>
          <f.checkbox @name="new_user_eligible"
                      @label="New users can select this role during registration" />
        </FormRow>

        <UiButtonRow>
          <f.submit @label="Save Role" @disabled={{this.isSubmitting}} />
          <UiCancelButton @onClick={{this.cancel}} @disabled={{this.isSubmitting}} />
        </UiButtonRow>
      </ChForm>
    </:body>
  </UiSection>
</main>
```

### Modal Footer Alignment

The `Modal.footer` component accepts `@align` to control button alignment:

```handlebars
{{!-- Start-aligned (default, recommended) --}}
<Modal.footer @align="start">
  <UiButtonRow>
    <UiButton @onClick={{this.save}}>Save</UiButton>
    <UiCancelButton @onClick={{this.cancel}} />
  </UiButtonRow>
</Modal.footer>

{{!-- End-aligned --}}
<Modal.footer @align="end">
  ...
</Modal.footer>
```

**Alignment contract**: `@align` accepts `start` or `end`. The legacy value `left` is mapped to `start` (deprecated — update to `start`).

### Modal Example

```handlebars
{{!-- Confirmation Modal --}}
<ModalConfirm @title="Delete Role?"
              @onConfirm={{this.confirmDelete}}
              @onCancel={{this.cancelDelete}}>
  <p>Are you sure you want to delete the role <strong>{{this.roleToDelete.title}}</strong>?</p>
  <p class="text-danger">This action cannot be undone.</p>
</ModalConfirm>
```

### Controller Example

```javascript
// app/controllers/admin/role/edit.js
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import RoleValidations from 'clubhouse/validations/role';

export default class AdminRoleEditController extends Controller {
  @service house;
  @tracked isSubmitting = false;

  roleValidations = RoleValidations;

  @action
  async saveRole(model, isValid) {
    if (!isValid) {
      return;
    }

    this.isSubmitting = true;
    try {
      await this.house.saveModel(
        model,
        'The role has been saved.',
        () => this.transitionToRoute('admin.roles')
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  cancel() {
    this.transitionToRoute('admin.roles');
  }
}
```

---

## Best Practices

### Component Usage

1. **Use existing UI components**: Always check if a `ui-*` component exists before creating custom markup
2. **Follow naming conventions**: Use `ui-*` prefix for reusable UI components
3. **Use Bootstrap utilities**: Leverage Bootstrap's utility classes before writing custom CSS
4. **Keep components simple**: Single responsibility per component
5. **Use semantic HTML**: Proper element types and ARIA attributes

### Styling

1. **Mobile-first**: Design for mobile, enhance for desktop
2. **Use variables**: Reference SCSS variables from `bootstrap-custom.scss`
3. **Avoid inline styles**: Use CSS classes
4. **Follow spacing patterns**: Use established margin/padding patterns
5. **Maintain consistency**: Match existing component styling

### Forms

1. **Always use ch-form**: Don't create raw HTML forms
2. **Validate properly**: Define validation rules in `/app/validations/`
3. **Show clear errors**: Use built-in error message display
4. **Provide hints**: Add `@hint` text for complex fields
5. **Set defaults**: Always set default values for select fields

### Performance

1. **Minimize CSS**: Use Bootstrap utilities instead of custom CSS
2. **Lazy load**: Use route-based code splitting
3. **Optimize images**: Compress and properly size images
4. **Cache properly**: Leverage Mirage.js for development caching

### Testing

1. **Test components**: Write integration tests for all UI components
2. **Test forms**: Validate form behavior with various inputs
3. **Test responsive**: Check mobile and desktop layouts
4. **Test accessibility**: Verify keyboard navigation and screen reader support

---

## Common Gotchas

### Select Elements
**Problem**: Select fields show wrong value on submit
**Solution**: Always set a default value - SPAs use variable values, not DOM state

### Link-to Errors
**Problem**: "Not enough parameters" error for `{{link-to}}`
**Solution**: Check for syntax errors or undefined variables in the backing controller/route

### Test Timeouts
**Problem**: Tests hang and never complete
**Solution**: Ensure all timers (`setTimeout`, `setInterval`) are properly cleaned up

### Bootstrap Width Classes
**Problem**: Need width between 25% and 50%
**Solution**: Use custom width utilities: `w-30`, `w-35`, `w-40`, `w-45`

### Print Styling
**Problem**: Unwanted elements appear when printing
**Solution**: Add `d-print-none` class to hide elements

---

## Resources

- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
- [Ember.js Guides](https://guides.emberjs.com/)
- [Font Awesome Icons](https://fontawesome.com/icons)
- [ember-changeset](https://github.com/poteto/ember-changeset)
- [ember-changeset-validations](https://github.com/poteto/ember-changeset-validations)
- README-ch-form.md - Detailed form component documentation
- README-development.md - Development guidelines and conventions
