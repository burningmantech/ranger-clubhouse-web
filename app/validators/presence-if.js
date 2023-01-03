import {typeOf} from '@ember/utils';
import {get} from '@ember/object';
import {isEmpty} from '@ember/utils';

function getProperty(changes, content, name) {
  return (name in changes) ? changes[name] : get(content, name);
}

export default function validatePresenceIf(opts = {}) {
  return (key, newValue, oldValue, changes, content) => {
    const {if_set, if_blank, message} = opts;

    if (if_blank) {
      if (typeOf(if_blank) === 'array') {
        let isSet = false;

        if_set.forEach((col) => {
          if (getProperty(changes, content, col))
            isSet = true;
        });

        if (isSet)
          return true;
      } else if (getProperty(changes, content, if_blank)) {
        return true;
      }
    } else if (typeOf(if_set) === 'array') {
      let isSet = false;

      if_set.forEach((col) => {
        if (getProperty(changes, content, col))
          isSet = true;
      });

      if (!isSet)
        return true;
    } else if (!getProperty(changes, content, if_set)) {
      return true;
    }

    if (isEmpty(newValue)) {
      return !isEmpty(message) ? message : 'Must not be blank';
    }

    return true;
  }
}
