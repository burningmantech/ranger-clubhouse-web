import { get } from '@ember/object';
import { isEmpty } from '@ember/utils';

function getProperty(name, changes, content) {
  return (name in changes) ? changes[name] : get(content, name);
}

export default function validatePronouns(/* options = {} */) {
  return (key, newValue, oldValue, changes, content) => {
    const pronouns = getProperty('pronouns', changes, content);
    if (pronouns !== 'custom') {
      return true;
    }

    if (!isEmpty(newValue)) {
      return true;
    }

    return 'Must not be blank.';
  };
}
