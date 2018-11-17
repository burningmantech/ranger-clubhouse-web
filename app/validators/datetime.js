
import moment from 'moment';

function getProperty(changes, content, name) {
  return changes.hasOwnProperty(name) ? changes[name] : content.get(name);
}

function getDateProperty(changes, content, name) {
  const value = getProperty(changes, content, name);

  if (!value) {
    return null;
  }

  try {
    return moment(value);
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

    if (newValue == '' || newValue == undefined) {
      return true;
    }

    if (!newValue.match(/^\s*\d{4}[/-]\d{1,2}[/-]\d{1,2}\s+\d{1,2}:\d{1,2}(:\d{1,2})?\s*$/)) {
      return 'Not in YYYY-MM-DD HH:MM format';
    }

    date = moment(newValue);

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
  }
}
