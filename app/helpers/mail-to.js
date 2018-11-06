import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function mailTo([ email ]) {
  return htmlSafe(`<a href="mailto:${email}">${email}</a>`);
}

export default helper(mailTo);
