import RESTAdapter from '@ember-data/adapter/rest';
import { service } from '@ember/service';
import Inflector from 'ember-inflector';
import ENV from 'clubhouse/config/environment';

/*
 * List of model names to pluralize.
 */

const PLURAL_MODELS = [
  'access-document-change',
  'action-log',
  'event-date',
];

export default class ApplicationAdapter extends RESTAdapter {
  @service session;

  host = ENV['api-server'];

  get headers() {
    let headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.bearerToken}`;
    }

    return headers;
  }

  pathForType(modelName) {
    return PLURAL_MODELS.includes(modelName) ? Inflector.inflector.pluralize(modelName) : modelName;
  }
}
