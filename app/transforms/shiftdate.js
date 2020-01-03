import Serializer from '@ember-data/serializer';

/*
 * A shift date does not contain the seconds.
 *
 * Add '00' seconds to a serialized date, and strip them during deserialization.
 */

export default class ShiftdateTransform extends Serializer {
  serialize(date) {
    let type = typeof date;

    if (type == 'string') {
      const result = date.match(/^\s*\d{4}[/-]\d{1,2}[/-]\d{1,2}\s+\d{1,2}:\d{1,2}(:\d{1,2})?\s*$/);
      if (result && !result[1]) {
        return date+':00';
      }
    }

    return date;
  }

  deserialize(date) {
    if (!date) {
      return date;
    }

    const result = date.match(/^\s*(\d{4}[/-]\d{1,2}[/-]\d{1,2}\s+\d{1,2}:\d{1,2})(:\d{1,2})?\s*$/);
    if (result) {
      return result[1];
    }

    return date;
  }
}
