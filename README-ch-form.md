# ch-form - Clubhouse Form Builder

ChForm is a tech team created component used to build forms. The component
handles all the basic HTML input elements: select, text, radio, checkbox,
and textarea. In additional, radio groups, checkbox groups and a live text
search is also provided.

ember-changeset is used to 'clone' the object being edited so in case the form
is closed, the original object will not be left in a dirty state. This is intended
for ember-data objects. This behavior may be overridden.

ember-changeset-validations is used to handle form validation. Documentation
is located here:

https://github.com/poteto/ember-changeset-validations

## {{#ch-form formName model ... arguments ... as |f| }}
The component takes two argument as a minimum: a form name, and model (object) to edited.
The form name is used to build up the form and field element ids.

Additional arguments are:

* onSubmit: the action to call when submit button or form is submitted.
  The action will be given three arugments: the changeset cloned model, a boolean
  indicating if the form is valid, and the original object.
* onCancel: the action called when the cancel button is pressed.
* onFormChange: an action called any time the fields are changed within the form.
  The action arguments passed are: the name of the field which changed,
  the changeset model, valid flag, original model.
* validator: a ember-changeset-validations object used to validate each field
* changeSet: by default ember-changeset will be used to clone the model to
  prevent the original model from being updated during editing. Set this
  property to false if you the form is to operate directly on the object.
* modalBox: if set to true, the form will be rendered in a modal box.
* modalTitle: a string to use as modal box's title if the form is rendered in a modal.


## input: Form Field Builder Component

`input` is a block component and specifies the form field to build.

A single argument tells which model property is to be edited.

The following example:
```htmlbars
{{#ch-form 'role' roleRecord onSubmit=(action 'saveRole') as |f| }}
  {{f.input 'title' label="Role Name:"}}
  {{f.submit}}
{{/ch-form}}
```

. . . will generate a form with a input text field using 'title' from the roleRecord model and provide a submit button.

Additional arguments are:

* type: the input field to generate. The following types are supported:
  - checkbox
  - radio
  - select
  - text
  - textarea
  - radioGroup: a list of values selectable by a radio button
  - checkboxGroup: a list of values selectable by checkboxes
  - search: live search using power-select-typeahead. As the user types in
    this field, a search can be performed and a list of suggested autocompletions
    may be shown for the user to select.
* label: a string to display above the input field.
* hint: text which placed below the input field used to inform the user.
* options: an array used for building select, radioGroup, and checkboxGroup fields.
  The format each array index may be a single element used for both the option text
  and value, or a two element sub-array with a text, and value.
* HTML properties: size, maxlength, rows, cols, disabled, autocomplete, placeholder
* autofocus: if set true the cursor will be placed on this field when the form is rendered.
* inline: if set true the field will be rendered on the same row as the other fields. By default, a field will be on its own row.

## submit: a Submit button

`submit` is block component which will generate a button element. When the user clicks on this button, the form will be validated and calls the onSubmit action given in the ch-form argument list.

The arguments to the component are:

* label: The button text. The default text is 'Save'
* disabled: if true, the button will be disabled.

## cancel: a Cancel button

`cancel` is a block component which will generate a button element with the default text of 'Cancel' that calls the onCancel given in the ch-form argument list.

The arguments to the component are:

* label: The button text. The default text is 'Cancel'
* disabled: if true, the button will be disabled.

## Form as a modal box

The form can be rendered as a modal box. Simply set the modalBox to true and give a box title by setting modalTitle.

## Basic Example

Let use the Roles table as an example to edit.

Here is the role's model -

```javascript
export default class RoleModel extends DS.Model {
  @attr('string') title;
  @attr('bool') new_user_eligible;
}
```

The template file to edit the role is:

```htmlbars
{{#ch-form 'roles' roles
      validator=roleValidations
      onSubmit=(action 'saveAction') as |f|}}
  {{f.input 'title' label="Role Title:" type="text" size=20}}
  {{f.input 'new_user_eligible' label="New User Eligible?" type="checkbox"}}
  {{f.submit disabled=isSubmitting}}
  {{f.cancel}}
{{/ch-form}}
```

The controller file is:

```javascript
import { validatePresence } from 'ember-changeset-validations/validators';

export default class RoleController extends Controller {
  roleValidations = {
    title: [
      validatePresence({ presence: true,  message: 'Enter a role name.' }),
    ]
  }

  @action
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }
    this.house.saveModel(model, 'The role has been saved.', () => {
      this.transistionTo('slots');
    });
  }

  @action
  cancelAction() {
    this.house.toast.warning('Any changes have NOT been saved.');
    this.transistionTo('slots');
  }
}
```
