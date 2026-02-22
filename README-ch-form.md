# ChForm - Clubhouse Form Builder

ChForm is a form builder component that handles text inputs, selects, checkboxes, radio groups,
checkbox groups, textareas, date/time pickers, password fields, rich text editors, and
autocomplete search fields.

[ember-changeset](https://github.com/poteto/ember-changeset) clones the model being edited so the
original object is never left in a dirty state if the form is closed without saving.
This behavior can be disabled by setting `@changeSet={{false}}`.

[ember-changeset-validations](https://github.com/poteto/ember-changeset-validations) handles field
validation. Validation rules are stored in `/app/validations`.

## ChForm Arguments

```handlebars
<ChForm @formId="formName"
        @formFor={{this.model}}
        @validator={{this.validations}}
        @onSubmit={{this.saveAction}}
        @onCancel={{this.cancelAction}}
        @onFormChange={{this.fieldChanged}}
        @onFormInit={{this.formInitialized}}
        @changeSet={{true}}
        @autocomplete="off"
        @formClass="my-css-class"
        as |f|>
  ...
</ChForm>
```

| Argument | Required | Default | Description |
|---|---|---|---|
| `@formId` | Yes | | Unique form name. Used to build DOM element ids (`formId-fieldName`). |
| `@formFor` | Yes | | The model (object) to edit. |
| `@validator` | No | | An ember-changeset-validations rule object for field validation. |
| `@onSubmit` | No | | Called on form submission: `(model, isValid, originalModel)`. |
| `@onCancel` | No | | Called when the form is cancelled. |
| `@onFormChange` | No | | Called when any field changes: `(field, model, isValid, originalModel)`. |
| `@onFormInit` | No | | Called once when the form initializes: `(formInstance)`. |
| `@changeSet` | No | `true` | Set to `false` to operate directly on the model without a changeset clone. |
| `@autocomplete` | No | `'off'` | HTML autocomplete attribute for the `<form>` element. |
| `@formClass` | No | | CSS class(es) for the `<form>` element. |

## Yielded Properties

The block parameter `|f|` provides:

| Property | Description |
|---|---|
| `f.model` | The current form model (changeset if enabled, otherwise the original model). |
| `f.text` | Text input field. |
| `f.number` | Number input field. |
| `f.password` | Password input with show/hide toggle. |
| `f.textarea` | Multi-line text input. |
| `f.select` | Dropdown select. |
| `f.checkbox` | Single checkbox. |
| `f.radioGroup` | Group of radio buttons (mutually exclusive). |
| `f.checkboxGroup` | Group of checkboxes (multi-select, value is an array). |
| `f.search` | Autocomplete search input (uses power-select-typeahead). |
| `f.datetime` | Date/time picker (uses flatpickr). |
| `f.editor` | WYSIWYG rich text editor. |
| `f.submit` | Submit button. |
| `f.reloadForm` | Action to rebuild the changeset (useful after the model is updated externally). |

## Common Field Arguments

All field types inherit these arguments from the base component:

| Argument | Description |
|---|---|
| `@name` | **Required.** Model property name (snake_case). |
| `@label` | Label text displayed above (or beside) the field. |
| `@disabled` | Disables the field. |
| `@hint` | Helper text displayed below the field. Newlines are converted to `<br>`. |
| `@onChange` | Custom change callback: `(fieldName, value, model)`. |
| `@showCharCount` | Show a character count when `@maxlength` is also set. |
| `@id` | Override the DOM id (default: `formId-name`). |
| `@fieldSize` | Size variant: `'sm'`, `'md'`, or `'lg'`. Adjusts control and label classes. |
| `@inline` | Render the field inline (label beside the input instead of above). |
| `@fixedLabel` | Use a fixed-width label for alignment. |
| `@noSpaces` | Automatically strip spaces from the value on input. |
| `@wrapClass` | Override the outer wrapper div class. |
| `@labelClass` | Override the label class. |
| `@controlClass` | Override the input control class. |

## Field Types

### f.text

Standard text input.

```handlebars
<f.text @name="callsign"
        @label="Ranger Callsign"
        @size={{30}}
        @maxlength={{100}}
        @placeholder="Enter callsign"
        @autofocus={{true}}
        @hint="Your unique identifier" />
```

Additional arguments: `@placeholder`, `@maxlength`, `@size`, `@inputmode`, `@autofocus`, `@onFocus`.

### f.number

HTML5 number input. Same arguments as `f.text`.

```handlebars
<f.number @name="delta_days" @label="Days" @size={{5}} />
```

### f.password

Password input with a show/hide toggle button (eye icon).

```handlebars
<f.password @name="password"
            @label="New Password"
            @size={{30}}
            @maxlength={{35}} />
```

Same arguments as `f.text`. The toggle switches the input type between `password` and `text`.

### f.textarea

Multi-line text input.

```handlebars
<f.textarea @name="message"
            @label="Message"
            @rows={{5}}
            @cols={{80}}
            @maxlength={{1500}}
            @showCharCount={{true}} />
```

Additional arguments: `@rows`, `@cols`, `@placeholder`, `@maxlength`, `@autofocus`, `@onFocus`.

### f.select

Dropdown select. Supports single and multiple selection, grouped options, and blank option.

```handlebars
<f.select @name="status"
          @label="Status"
          @options={{this.statusOptions}}
          @includeBlank={{true}} />
```

| Argument | Description |
|---|---|
| `@options` | **Required.** Array of options (see [Option Formats](#option-formats)). |
| `@includeBlank` | Prepend a blank option with value `""`. |
| `@multiple` | Allow multiple selections. |
| `@size` | HTML `size` attribute (visible rows for multi-select). |

**Value coercion:** The select component converts string values from the DOM:
`'true'` becomes `true`, `'false'` becomes `false`, `'null'` becomes `null`.

**Gotcha:** Always set a default value for select fields. In an SPA, form submission uses the
JavaScript variable value, not the current DOM selection. If no default is set, the field may be
`undefined` even though something appears selected in the UI.

### f.checkbox

Single checkbox.

```handlebars
<f.checkbox @name="on_site" @label="Is on site?" />
<f.checkbox @name="active" @label="Active" @inline={{true}} />
```

The label appears beside the checkbox (not above). Uses Bootstrap `form-check` styling.

### f.radioGroup

Group of radio buttons for mutually exclusive selection.

```handlebars
<f.radioGroup @name="status"
              @label="Status"
              @options={{this.statusOptions}}
              @inline={{true}} />
```

| Argument | Description |
|---|---|
| `@options` | **Required.** Array of options (see [Option Formats](#option-formats)). |
| `@inline` / `@inlineOptions` | Display radio buttons horizontally. |
| `@radioLabelClass` | Custom class for individual radio labels. |
| `@groupWrapClass` | Custom wrapper class for the radio group container. |

### f.checkboxGroup

Group of checkboxes for multi-select. The field value is an array of selected values.

```handlebars
<f.checkboxGroup @name="position_ids"
                 @label="Positions"
                 @options={{this.positionOptions}}
                 @cols={{4}}
                 @includeToggleControls={{true}} />
```

| Argument | Description |
|---|---|
| `@options` | **Required.** Array of options (see [Option Formats](#option-formats)). |
| `@cols` | Number of columns for layout (default: 3). |
| `@includeToggleControls` | Show "select all" / "deselect all" links above the checkboxes. |
| `@inline` / `@inlineOptions` | Display checkboxes horizontally. |
| `@checkboxLabelClass` | Custom class for individual checkbox labels. |
| `@groupWrapClass` | Custom wrapper class for the group container. |

**Named block: `:selectors`** - Yields a `setValues` action for programmatically setting selected values:

```handlebars
<f.checkboxGroup @name="reasons"
                 @label="Rejection Reasons"
                 @options={{this.options}}>
  <:selectors as |setValues|>
    <a href {{on-click (fn setValues this.defaultIds)}}>Use Defaults</a>
  </:selectors>
</f.checkboxGroup>
```

### f.search

Autocomplete search field using power-select-typeahead. Calls a search callback as the user types
and displays matching results in a dropdown.

```handlebars
<f.search @name="callsign"
          @label="Vehicle Owner"
          @onSearch={{this.searchCallsigns}}
          @placeholder="Enter a callsign"
          @noResultsText="No callsigns found" />
```

| Argument | Description |
|---|---|
| `@onSearch` | **Required.** Callback invoked as the user types: `(searchText) => Promise<results>`. |
| `@placeholder` | Placeholder text. |
| `@noResultsText` | Text shown when no results match. |
| `@autofocus` | Focus on mount. |
| `@onFocus` | Focus callback. |

### f.datetime

Date and/or time picker powered by flatpickr.

```handlebars
<f.datetime @name="trained_on"
            @label="Trained On"
            @dateOnly={{true}} />

<f.datetime @name="on_duty"
            @label="On Duty Time"
            @minDate={{this.minDate}}
            @maxDate={{this.maxDate}} />
```

| Argument | Description |
|---|---|
| `@dateOnly` | Date-only mode (no time picker). |
| `@placeholder` | Placeholder text. |
| `@minDate` | Minimum selectable date. |
| `@maxDate` | Maximum selectable date. |
| `@startDate` | Initial calendar date to display. |
| `@defaultDate` | Default selection if the field is empty. |
| `@autofocus` | Focus on mount. |
| `@size` | Input size attribute. |
| `@maxlength` | Input maxlength attribute. |

Invalid input displays "Invalid date" or "Invalid date/time" as a validation error.

### f.editor

WYSIWYG rich text editor.

```handlebars
<f.editor @name="content"
          @label="Message Body"
          @showCharCount={{true}}
          @maxlength={{5000}} />
```

## f.submit

Submit button. Triggers form validation and calls the form's `@onSubmit` callback.

```handlebars
<f.submit />
<f.submit @label="Save Changes" @disabled={{this.isSaving}} />
<f.submit @label="Delete" @type="danger" />
```

| Argument | Default | Description |
|---|---|---|
| `@label` | `'Save'` | Button text. |
| `@disabled` | | Disable the button. |
| `@type` | | Button style: `'primary'`, `'secondary'`, `'danger'`, `'success'`, `'warning'`, `'info'`. |
| `@size` | | Button size: `'sm'`, `'md'`, `'lg'`. |
| `@responsive` | | Enable responsive sizing. |
| `@onSubmit` | | Override the form-level `@onSubmit` with a different callback. |

## Option Formats

The `@options` argument for `f.select`, `f.radioGroup`, and `f.checkboxGroup` accepts several formats:

```javascript
// Simple value (used as both label and value)
['Active', 'Inactive', 'Retired']

// [label, value] pairs
[['Active', 'active'], ['Inactive', 'inactive']]

// [label, value, disabled] tuples
[['Active', 'active'], ['Locked', 'locked', true]]

// Object with id/title
[
  { id: 'active', title: 'Active' },
  { id: 'inactive', title: 'Inactive', disabled: true }
]

// Object with value/label
[
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]

// Grouped options (f.select only)
[
  {
    groupName: 'Fruits',
    options: ['Apple', 'Banana', 'Orange']
  },
  {
    groupName: 'Vegetables',
    options: [['Carrot', 'carrot'], ['Pea', 'pea']]
  }
]
```

## Validation

Validation rules use ember-changeset-validations and are defined in `/app/validations/`.

```javascript
// app/validations/person.js
import {
  validatePresence,
  validateLength,
  validateFormat,
} from 'ember-changeset-validations/validators';

export default {
  callsign: [
    validatePresence({ presence: true, message: 'Enter a callsign.' }),
  ],
  email: [
    validatePresence({ presence: true, message: 'Enter an email address.' }),
    validateFormat({ type: 'email', message: 'Enter a valid email address.' }),
  ],
  password: [
    validatePresence(true),
    validateLength({ min: 5, max: 40 }),
  ],
};
```

When validation fails on submit, the form automatically scrolls to the first error field.
Error messages appear below the invalid field and the field label turns red.

## Helper Sub-Components

These are used internally by field templates but are available if needed:

- **`<FormRow>`** - Bootstrap row wrapper with default margin. Wrap fields in this to lay them out
  in columns.
- **`<ChForm::Hint>`** - Displays `@hint` text with newline-to-`<br>` conversion.
- **`<ChForm::ErrorMessages>`** - Displays validation errors as a bulleted list.
- **`<ChForm::CharCount>`** - Displays "`N` of `M` characters." when `@showCharCount` is enabled.
- **`<ChForm::WrapBlock>`** - Conditional wrapper that only renders a `<div>` if `@wrapClass` is
  non-empty.

## Complete Example

Model:
```javascript
export default class RoleModel extends Model {
  @attr('string') title;
  @attr('boolean') new_user_eligible;
}
```

Template:
```handlebars
<ChForm @formId="role"
        @formFor={{this.role}}
        @validator={{this.roleValidations}}
        @onSubmit={{this.saveAction}} as |f|>
  <FormRow>
    <f.text @name="title" @label="Role Title:" @size={{20}} />
  </FormRow>
  <FormRow>
    <f.checkbox @name="new_user_eligible" @label="New User Eligible?" />
  </FormRow>
  <f.submit @disabled={{this.isSubmitting}} />
  <UiCancelButton @disabled={{this.isSubmitting}} @onClick={{this.cancelAction}} />
</ChForm>
```

Controller:
```javascript
import { validatePresence } from 'ember-changeset-validations/validators';

export default class RoleController extends ClubhouseController {
  roleValidations = {
    title: [
      validatePresence({ presence: true, message: 'Enter a role name.' }),
    ],
  };

  @action
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }
    this.house.saveModel(model, 'The role has been saved.', () => {
      this.transitionToRoute('roles');
    });
  }

  @action
  cancelAction() {
    this.house.toast.warning('Any changes have NOT been saved.');
    this.transitionToRoute('roles');
  }
}
```

## Changeset Behavior

When `@changeSet` is `true` (the default):

- A changeset proxy wraps the model, tracking changes without modifying the original.
- Changes only persist to the original model when `.save()` is called on the changeset.
- After a successful save, the changeset is automatically rebuilt with fresh data from the model.
  This ensures server-side changes (e.g., computed fields) are reflected in the form.
- Use `f.reloadForm` to manually rebuild the changeset if the underlying model changes externally.

## Accessing the Model in Templates

Use `f.model` to read model properties in the template (e.g., for conditional rendering):

```handlebars
<ChForm @formId="entry" @formFor={{this.entry}} @onSubmit={{this.save}} as |f|>
  <f.radioGroup @name="type" @options={{this.typeOptions}} @inline={{true}} />
  {{#if (eq f.model.type "personal")}}
    <f.text @name="owner_name" @label="Owner" />
  {{/if}}
  <f.submit />
</ChForm>
```

## Form Initialization

Use `@onFormInit` to run setup logic when the form is created:

```handlebars
<ChForm @formId="entry"
        @formFor={{this.entry}}
        @onFormInit={{this.formInit}}
        @onSubmit={{this.save}} as |f|>
  ...
</ChForm>
```

```javascript
@action
formInit(form) {
  // form.model is the changeset
  this.buildOptionsFromModel(form.model);
}
```
