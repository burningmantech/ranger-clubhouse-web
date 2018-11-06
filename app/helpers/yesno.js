import { helper } from '@ember/component/helper';

export function yesno([ value ]) {
  return value ? 'Y' : 'N';
}

export default helper(yesno);
