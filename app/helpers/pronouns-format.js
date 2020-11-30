import { helper } from '@ember/component/helper';
import { pronounLabels } from 'clubhouse/constants/pronouns';

export default helper(function pronounsFormat(params/*, hash*/) {
  const person = params[0];
  const { pronouns, pronouns_custom} = person;

  if (pronouns === 'custom') {
    return `(${pronouns_custom})`;
  }

  if (pronouns === '') {
    return '';
  }

  return `(${pronounLabels[pronouns]})`;
});
