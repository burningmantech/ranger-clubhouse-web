import DS from 'ember-data';
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
  'asset-person',
  'asset-attachment',
  'bmid',
  'person',
  'position',
  'position-credit',
  'role',
  'setting',
  'slot',
  'timesheet',
  'timesheet-missing'
];

export default class ApplicationAdapter extends DS.RESTAdapter.extend(DataAdapterMixin) {
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
