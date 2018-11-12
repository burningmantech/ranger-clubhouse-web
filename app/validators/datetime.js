
import moment from 'moment';

function getDateProperty(changes, content, name) {
  const value = changes.hasOwnProperty(name) ? changes[name] : content.get(name);

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
    const { before, after } = opts;
    let date;
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

      if (!date.isBefore(beforeDate)) {
        return `Date must be before ${before}`;
      }
    }

    if (after) {
      const afterDate = getDateProperty(changes, content, after);

      if (!afterDate) {
        return true;
      }

      if (!date.isAfter(afterDate)) {
        return `Date must be after ${after}`;
      }
    }

    return true;
  }
}
