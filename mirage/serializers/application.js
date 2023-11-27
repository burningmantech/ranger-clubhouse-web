// mirage/serializers/application.js
import {RestSerializer} from 'miragejs';

export default RestSerializer.extend({
  keyForAttribute(attr) {
    return attr; // don't mess with the attribute names
  }
});

