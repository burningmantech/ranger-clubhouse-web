import Ember from 'ember';
import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'clubhouse/config/environment';
//import LinkComponent from '@ember/routing/link-component';
import RSVP from 'rsvp';
import logError from 'clubhouse/utils/log-error';

RSVP.on('error', function (error) {
  // TODO: keep an eye on this
  // https://github.com/emberjs/ember.js/issues/12505
  if (error.name !== 'TransitionAborted') {
    console.error('RSVP Exception', error.stack);
    alert('RSVP Exception: ' + error.stack);
  }
});


/*
 * Attempt to trap any non-recoverable errors and log them to the server.
 *
 * Uses sendBeacon which is completely asynchronous and will continue to work
 * after the browser window is closed.
 */

Ember.onerror = (error) => {
  var didAlertError = false;

  if (Ember.testing) { // eslint-disable-line ember/no-ember-testing-in-module-scope
    throw error;
  }

  console.error(error);

  logError(error, 'ember-onerror');

  const isDev = (config.environment === 'development');

  if (isDev) {
    if (didAlertError) {
      return;
    }

    didAlertError = true;
  }

  alert("Exception " + error.stack);

  if (isDev) {
    debugger;  // eslint-disable-line no-debugger
  }
}

/*LinkComponent.reopen({
  activeClass: 'is_active'
});*/

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
