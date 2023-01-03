// mirage/serializers/application.js
import {RestSerializer} from 'ember-cli-mirage';

export default class extends RestSerializer {
  keyForAttribute(attr) {
    return attr; // don't mess with the attribute names
  }
}

