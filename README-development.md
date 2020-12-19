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
