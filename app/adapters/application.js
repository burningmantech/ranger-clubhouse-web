import {computed} from '@ember/object';
import RESTAdapter from '@ember-data/adapter/rest';
import Inflector from 'ember-inflector';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from 'clubhouse/config/environment';

/*
 * List of model names that should NOT be pluralized across the wire.
 * (e.g., person -> people)
 */

const SINGULAR_MODELS = [
  'access-document',
  'access-document-delivery',
  'alert',
  'asset',
  'asset-attachment',
  'asset-person',
  'bmid',
  'help',
  'motd',
  'person',
  'person-photo',
  'position',
  'position-credit',
  'role',
  'setting',
  'slot',
  'survey',
  'survey-answer',
  'survey-group',
  'survey-question',
  'timesheet',
  'timesheet-missing',
];

export default class ApplicationAdapter extends RESTAdapter.extend(DataAdapterMixin) {
  host = ENV['api-server'];

  @computed('session.{isAuthenticated,data.authenticated.token}')
  get headers() {
    let headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.token}`;
    }

    return headers;
  }

  pathForType(modelName) {
    return SINGULAR_MODELS.includes(modelName) ? modelName : Inflector.inflector.pluralize(modelName);
  }
}
