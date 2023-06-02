import { helper } from '@ember/component/helper';
import {setting} from 'clubhouse/utils/setting';
import { htmlSafe } from '@ember/template';

export function vcEmail() {
  const email = setting('VCEmail');
  return htmlSafe(`<a href="mailto:${email}" class="d-inline-block">${email}</a>`);
}

export default helper(vcEmail);
