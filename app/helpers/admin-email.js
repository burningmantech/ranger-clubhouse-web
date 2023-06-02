import { helper } from '@ember/component/helper';
import {setting} from 'clubhouse/utils/setting';
import { htmlSafe } from '@ember/template';

export function generalSupportEmail() {
  const email = setting('AdminEmail');
  return htmlSafe(`<a href="mailto:${email}" class="d-inline-block">${email}</a>`);
}

export default helper(generalSupportEmail);
