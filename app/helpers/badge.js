import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function badge([ badgeType, text ]) {
  return htmlSafe(`<span class="badge badge-${badgeType}">${text}</span>`)
}

export default helper(badge);
