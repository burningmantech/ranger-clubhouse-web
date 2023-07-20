import Ember from 'ember';
import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'clubhouse/config/environment';
import logError from 'clubhouse/utils/log-error';

const isDevelopmentEnvironment = (config.environment === 'development');

/*
 * Attempt to trap any non-recoverable errors and log them to the server.
 */

Ember.onerror = (error) => {
  var didAlertError = false;

  console.error(error);

  if (Ember.testing) { // eslint-disable-line ember/no-ember-testing-in-module-scope
    throw error;
  }

  if (isDevelopmentEnvironment) {
    if (didAlertError) {
      // Avoid spamming the developer with multiple exceptions in the same execution cycle.
      return;
    }

    didAlertError = true;
    alert("Ember exception " + error.stack);
    debugger;  // eslint-disable-line no-debugger
  } else {
    logError(error, 'client-ember-error');
  }
}

/*
 * Try to log any uncaught exceptions. Ember.onerror will see the bulk however depending on where
 * the exception occurs, the window object may receive the error event.
 */

window.onerror = (event, source, lineno, colno, error) => {
  if (!isDevelopmentEnvironment) {
    if (!source || !error) {
      // Errors in browser extensions will cause the error handle to be called yet no information provided.
      return;
    }
    logError(event, 'client-uncaught-exception', {
      source, lineno, colno, error
    });
    return;
  }

  alert("Uncaught exception " + event.message);
  // eslint-disable-next-line no-debugger
  debugger;
}

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
