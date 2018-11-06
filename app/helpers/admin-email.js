import { helper } from '@ember/component/helper';
import { config } from 'clubhouse/utils/config';
import { htmlSafe } from '@ember/string';

export function generalSupportEmail() {
  const email = config('AdminEmail');
  return htmlSafe(`<a href="mailto:${email}">${email}</a>`);
}

export default helper(generalSupportEmail);
