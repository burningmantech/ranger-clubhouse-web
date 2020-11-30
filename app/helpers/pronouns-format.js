import { helper } from '@ember/component/helper';
import { pronounLabels } from 'clubhouse/constants/pronouns';

export default helper(function pronounsFormat(params, hash) {
  const person = params[0];
  const { pronouns } = person;

  let value;

  if (pronouns === 'custom') {
    value = person.pronouns_custom;
  } else if (pronouns === '') {
    value = '';
  } else {
    value = pronounLabels[pronouns];
  }

  if (value === '') {
    return '';
  }

  return hash.noParens ? value : `(${value})`;
});
