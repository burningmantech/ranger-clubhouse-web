import { typeOf } from '@ember/utils';
import { get } from '@ember/object';

function getProperty(changes, content, name) {
  return (name in changes) ? changes[name] : get(content, name);
}

export default function validatePresenceIf(opts = {}) {
  return (key, newValue, oldValue, changes, content) => {
    const { if_set, message } = opts;

    if (typeOf(if_set) == 'array') {
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

    if (newValue == '' || newValue == undefined) {
      return (message != '') ? message : 'Must not be blank';
    }

    return true;

  }
}
