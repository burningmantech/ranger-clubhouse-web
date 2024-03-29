import { get } from '@ember/object';
import { isEmpty } from '@ember/utils';

function getProperty(name, changes, content) {
  return (name in changes) ? changes[name] : get(content, name);
}

export default function validateCustom({field}) {
  return (key, newValue, oldValue, changes, content) => {
    const baseValue = getProperty(field, changes, content);

    if (baseValue !== 'custom') {
      return true;
    }

    if (!isEmpty(newValue)) {
      return true;
    }

    return 'Must not be blank.';
  };
}
