import BooleanTransform from 'ember-data/transforms/boolean';

/*
 * Grr.. the ember-data boolean transformer does not serialize boolean strings,
 * only boolean types. The string "false" will be serialized as true.
 *
 */

export default BooleanTransform.extend({
  serialize(value) {
    if (typeof value === "string") {
      return /^(true|t|1)$/i.test(value);
    }

    return this._super(...arguments);
  }
});
