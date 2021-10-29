import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

export function mailTo([ email ]) {
  return htmlSafe(`<a href="mailto:${email}" class="d-inline-block">${email}</a>`);
}

export default helper(mailTo);
