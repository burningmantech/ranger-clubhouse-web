import {helper} from '@ember/component/helper';
import {htmlSafe} from '@ember/template';

export function phoneLink([number]) {
  return htmlSafe(`<a href="tel:${number}">${number}</a>`)
}

export default helper(phoneLink);
