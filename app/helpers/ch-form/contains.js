import { helper } from '@ember/component/helper';
import { isArray } from '@ember/array';
import { typeOf } from '@ember/utils';

export function chFormContains([haystack, value]) {
  if (isArray(haystack)) {
    return haystack.includes(value);
  } else {
    // Handle comparing a selected value which is a boolean string and the
    // option value is an actual Boolean type.
    if (typeOf(value) == "boolean" && typeOf(haystack) == "string") {
        haystack = /^(true|t|1)$/i.test(haystack);
    }
    return haystack == value;
  }
}

export default helper(chFormContains);
