import RESTAdapter from '@ember-data/adapter/rest';
import { service } from '@ember/service';
import Inflector from 'ember-inflector';
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
  'certification',
  'document',
  'help',
  'motd',
  'person',
  'person-certification',
  'person-event',
  'person-photo',
  'position',
  'position-credit',
  'provision',
  'role',
  'setting',
  'slot',
  'survey',
  'survey-answer',
  'survey-group',
  'survey-question',
  'timesheet',
  'timesheet-missing',
  'vehicle',
];

export default class ApplicationAdapter extends RESTAdapter {
  @service session;

  host = ENV['api-server'];

  get headers() {
    let headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.jwt}`;
    }

    return headers;
  }

  pathForType(modelName) {
    return SINGULAR_MODELS.includes(modelName) ? modelName : Inflector.inflector.pluralize(modelName);
  }
}
