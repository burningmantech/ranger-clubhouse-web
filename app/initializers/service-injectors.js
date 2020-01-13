/*
 * Automatically inject services into controllers/component/routes
 */

/*
 * Service List to inject the key is the name to inject as with the value
 * being the actual service name
 */

const servicesToInject = [
  'ajax',
  'modal',
  'session',
  'toast',
  'house',
];

export function initialize(app) {
  // sessions
  servicesToInject.forEach((service) => {
    const name = 'service:'+service;

    app.inject('controller', service, name);
    app.inject('component', service, name);
    app.inject('route', service, name);
    app.inject('ability', service, name);
  });
}

export default {
  name: 'service-injects',
  initialize
};
