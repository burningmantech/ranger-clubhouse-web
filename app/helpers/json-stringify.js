import { helper } from '@ember/component/helper';

export function jsonStringify([ text ]/*, hash*/) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch (e) {
    return text;
  }
}

export default helper(jsonStringify);
