import Transform from '@ember-data/serializer/transform';
import { isNone } from '@ember/utils';


/*
 * Grr.. the ember-data boolean transformer does not serialize boolean strings,
 * only boolean types. The string "false" will be serialized as true.
 *
 */

export default Transform.extend({
  deserialize(serialized, options) {
    if (isNone(serialized) && options.allowNull === true) {
      return null;
    }

    let type = typeof serialized;
    if (type === 'boolean') {
      return serialized;
    } else if (type === 'string') {
      return /^(true|t|1)$/i.test(serialized);
    } else if (type === 'number') {
      return serialized === 1;
    } else {
      return false;
    }
  },

  serialize(deserialized, options) {
    if (typeof deserialized === "string") {
      return /^(true|t|1)$/i.test(deserialized);
    }

    if (isNone(deserialized) && options.allowNull === true) {
      return null;
    }

    return Boolean(deserialized);
  }
});
