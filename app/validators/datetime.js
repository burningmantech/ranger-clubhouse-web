import dayjs from 'dayjs';
import { get } from '@ember/object';
import { isEmpty } from '@ember/utils';

function getProperty(changes, content, name) {
  return (name in changes) ? changes[name] : get(content, name);
}

function getDateProperty(changes, content, name) {
  const value = getProperty(changes, content, name);

  if (!value) {
    return null;
  }

  try {
    return dayjs(value);
  } catch (error) {
    return '';
  }
}

export default function validateDateTime(opts = {}) {
  return (key, newValue, oldValue, changes, content) => {
    const { before, after, if_set } = opts;
    let date;

    if (if_set && !getProperty(changes, content, if_set)) {
      return true;
    }

    if (isEmpty(newValue)) {
      if (opts.presence) {
        return 'Must not be blank';
      }
      return true;
    }

    if (!newValue.match(/^\s*\d{4}[/-]\d{1,2}[/-]\d{1,2}\s+\d{1,2}:\d{1,2}(:\d{1,2})?\s*$/)) {
      return 'Not in YYYY-MM-DD HH:MM format';
    }

    date = dayjs(newValue);

    if (!date.isValid()) {
      return 'Not a valid date';
    }

    if (before) {
      const beforeDate = getDateProperty(changes, content, before);

      if (!beforeDate) {
        return true;
      }

      if (!date.isBefore(beforeDate) && !date.isSame(beforeDate)) {
        return `Date must be before ${before}`;
      }
    }

    if (after) {
      const afterDate = getDateProperty(changes, content, after);

      if (!afterDate) {
        return true;
      }

      if (!date.isAfter(afterDate) && !date.isSame(afterDate)) {
        return `Date must be after ${after}`;
      }
    }

    return true;
  };
}
