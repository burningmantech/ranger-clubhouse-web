import { helper } from '@ember/component/helper';
import ENV from 'clubhouse/config/environment';

export default helper(function assetsUrl(path) {
  return `${ENV.rootURL}assets/${path}`;
});
