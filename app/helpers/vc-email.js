import { helper } from '@ember/component/helper';
import { config } from 'clubhouse/utils/config';
import { htmlSafe } from '@ember/template';

export function vcEmail() {
  const email = config('VCEmail');
  return htmlSafe(`<a href="mailto:${email}" class="d-inline-block">${email}</a>`);
}

export default helper(vcEmail);
