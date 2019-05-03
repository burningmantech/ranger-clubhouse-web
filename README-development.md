# Clubhouse 2.0 Development Guidelines

## Naming Conventions

* CSS selectors are dash-case (industry default)
* Form field names are snake_case
* API fields are snake_case
  (Forms and API fields tend to go hand-in-hand. API fields are typically copied straight from database column names. This helps to distinguish between database originated data and locally computed values.)
* Variables, methods, and objects are camelCase
* Numeric and string constants are UPPERCASE & SNAKE_CASE.
* Array and object constants are Capitalized.
* Class names are Capitalized.

## CSS / Stylesheets

* Try to use the Bootstrap CSS components before introducing new CSS code. There's a really good chance Bootstrap will have a solution.
* By default Bootstrap supplies width utilities at 25%, 50%, 75%, and 100% widths (w-25, w-50, etc.) For Clubhouse 2.0, additional widths have been added starting at 5% and incrementing by 5% up to 100%. (w-5, w-10, w-15, etc.)
* Style a table with the "table table-striped table-hover" classes.

## Use ES2015 classes

Clubhouse 2.0 is using  ember-decorators which automatically provide ES2015 blueprints for creating new routes, controllers, and components.

EmberJS is slowly moving towards ES2015 classes which allow for bettering tooling, and a cleaner, more descriptive syntax.

A route will look something like the following using ES2015:

```javascript
import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class ReportRoute extends Route.extend(MeRouteMixin) {
...
}
```

## Use TC39 decorators (@argument, @action, @computed, etc)

As mentioned above, Clubhouse 2.0 is using ember-decorators.

The full documentation is  [here](http://ember-decorators.github.io/ember-decorators/latest/docs).

For computed values:

```javascript
import { computed } from '@ember/object';

....
@computed('key1', 'key2', ...)
get computedValue() {
  return ..;
}
```

Ember actions in routes, controllers, and components are in the "actions:{}" block. For Clubhouse 2.0, use the @action decorator instead.

Replace this:

```javascript

export default Component.extend({
  ...

  actions: {
    myAction() {
      ....
    }

    myOtherAction() {
      ....
    }
  }
});
```

with this:

```javascript
import { action } from '@ember/object';

export default class MyComponent extends Component {

  @action
  myAction() { ... }

  @action
  myOtherAction() { ... }
}
```

For component arguments use the `@argument(TYPE)` decorator. The decorator has
the advantage of catching misspelled argument names and attempted use of
arguments that were not declared.

Replace this:

```javascript
export default Component.extend({
  title: 'default value',
  sortDesc: true,
})
```

with this:

```javascript

import { argument } from '@ember-decorators/argument';

export default class MyComponent extends Component {
  @argument('string') title = 'default value';
  @argument('boolean') sortBy = true;
}
```

## Use set() on objects used in templates

All objects referenced in a template will be 'watched' by EmberJS. Any updates to the object will cause the template to re-render.

When the object is a POJO (Plain Old Javascript Object) that was not created through EmberObject, you may need to use set() on the object to update it.

For example:

```javascript
import { set } from '@ember/object';
let berlinOutpost = { title: 'Berlin' };
set(berlinOutpost, 'title', 'New Berlin');
```

If the same object was create using EmberObject, use the object's set method:

```javascript
let berlinOutpost = EmberObject.create({ title: 'Berlin' });
berlinOutpost.set('title', 'New Berlin');
```

Do not bother using the set() method if the POJO will not be used within a template, or observed. Use the good old assignment operator:

```javascript
berlinOutpost.title = 'New Berlin';
```

### GOTCHAS

* EmberJS will erroneously complain about a link-to statement does not have enough parameters supplied for the route when the backing router or controller source code has a syntax error or uses a non-existent variable.

* The testing framework will wait until ALL active timers have expired before allowing
the test to finish and move on to the next one. e.g., an outstanding setTimeout() may cause grief.

### PRINTING

* Use the CSS class 'd-print-none' to hit a block from being printed.

* The <header>, <footer> and sidebar all have d-print-none set so the areas will not appear on the printed page.

* Javascript initiated printing using a selected DOM element does not work properly with Safari (as of Version 12.0.2, December 2018). The problem is the browser has issues with multiple Javascript initiated print actions - the second and later print actions will cause a browser dialog to be shown which states the web page is trying to print multiple times. A confirmation button is shown, yet the button does nothing.

The ember-print-this addon, more importantly the jQuery print-this addon, cannot be used until Apple fixes this.

### FORMS

- The ch-form help uses ember-changeset which duplicates the model for editing.
  The object which the form use is a 'proxy'.

- When using <select> be sure to set the select to a default value. Forms do not
  operate differently in a SPA environment. When 'submit' is clicked, the field
  values stored in variables/object is used, NOT what is currently set on the form itself.
