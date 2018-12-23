import Ember from 'ember';
import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import LinkComponent from '@ember/routing/link-component';
import RSVP from 'rsvp';
import buildErrorHandler from 'ember-test-friendly-error-handler';


RSVP.on('error', function(error) {
  // TODO: keep an eye on this
  // https://github.com/emberjs/ember.js/issues/12505
  if(error.name !== 'TransitionAborted') {
    console.error('RSVP Exception', error.stack);
    alert('RSVP Exception: '+error.stack);
  }
});

Ember.onerror = buildErrorHandler('Ember.onerror', (error) => {
  if (Ember.testing) {
    throw error;
  }
  console.error(error);
  alert("Exception "+error.stack);
});

LinkComponent.reopen({
  activeClass: 'is_active'
});

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,
});

loadInitializers(App, config.modulePrefix);


export default App;
