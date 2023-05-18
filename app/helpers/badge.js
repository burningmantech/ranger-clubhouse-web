import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

export function badge([ badgeType, text ]) {
  return htmlSafe(`<span class="badge text-bg-${badgeType}">${text}</span>`)
}

export default helper(badge);
