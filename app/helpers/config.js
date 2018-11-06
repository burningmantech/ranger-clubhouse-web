import { helper } from '@ember/component/helper';
import { config as configUtil } from 'clubhouse/utils/config';

export function config([ key ]) {
  return configUtil(key);
}

export default helper(config);
