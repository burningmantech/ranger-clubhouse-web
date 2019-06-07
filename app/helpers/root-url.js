import { helper } from '@ember/component/helper';
import ENV from 'clubhouse/config/environment';

export function rootUrl([ url ]) {
  return `${ENV.rootURL}${url.replace(/^\//,'')}`;
}

export default helper(rootUrl);
