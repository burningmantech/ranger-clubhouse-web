import { helper } from '@ember/component/helper';
import { setting as settingUtil } from 'clubhouse/utils/setting';

export function setting([ key ]) {
  return settingUtil(key);
}

export default helper(setting);
