import DS from 'ember-data';
import { underscore } from '@ember/string';

export default class ApplicationSerializer extends DS.RESTSerializer {
  // Only send the attributes that have changed.
  serializeAttribute(snapshot, json, key, attributes) {

    // Don't serialize readonly objects
    if (attributes.options && attributes.options.readOnly) {
      return;
    }

    // Only serialize objects that have changed or are new.
    if (snapshot.record.get('isNew') || snapshot.changedAttributes()[key]) {
      super.serializeAttribute(snapshot, json, key, attributes);
    }
  }

  /*
   * Ember data by default will camel case (personMessage) the
   * model name going to the server. Keep the model as
   * snake case (person_message).
   */

  payloadKeyFromModelName(modelName) {
    return underscore(modelName);
  }
}
