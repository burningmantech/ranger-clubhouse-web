import { helper } from '@ember/component/helper';
import { isArray } from '@ember/array';

export function chFormContains([haystack, value]) {
  if (isArray(haystack)) {
    return haystack.includes(value);
  } else {
    return haystack == value;
  }
}

export default helper(chFormContains);
