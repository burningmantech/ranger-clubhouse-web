import RESTAdapter from '@ember-data/adapter/rest';
import Inflector from 'ember-inflector';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from 'clubhouse/config/environment';

/*
 * List of model names that should NOT be pluralized across the wire.
 * (e.g., person -> people)
 */

const SINGULAR_MODELS = [
  'access-document-delivery',
  'access-document',
  'alert',
  'asset-attachment',
  'asset-person',
  'asset',
  'bmid',
  'help',
  'motd',
  'person',
  'position-credit',
  'position',
  'role',
  'setting',
  'slot',
  'timesheet-missing',
  'timesheet',
];

export default class ApplicationAdapter extends RESTAdapter.extend(DataAdapterMixin) {
  host = ENV['api-server'];

  authorize(xhr) {
    // Add the authorization header to the API request

    let token = this.get('session.data.authenticated.token');
    if (this.session.isAuthenticated && token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
  }

  pathForType(modelName) {
    return SINGULAR_MODELS.includes(modelName) ?  modelName : Inflector.inflector.pluralize(modelName);
  }
}
