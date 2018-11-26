/*
 * Automatically inject services into controllers/component/routes
 */

/*
 * Service List to inject the key is the name to inject as with the value
 * being the actual service name
 */

const servicesToInject = {
  ajax:    'ajax',
  modal:   'modal',
  session: 'session',
  toast:  'toast',
  house:   'house',
};

export function initialize(app) {
  // sessions
  for (var alias in servicesToInject) {
    const name = 'service:'+servicesToInject[alias];

    app.inject('controller', alias, name);
    app.inject('component', alias, name);
    app.inject('route', alias, name);
    app.inject('ability', alias, name);
  }
}

export default {
  name: 'service-injects',
  initialize
};
