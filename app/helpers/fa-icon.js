import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function faIcon([ name ], namedParams) {
  const size = namedParams.size ? `fa-${namedParams.size}` : '';
  const type = namedParams.type || 'fas';

  return htmlSafe(`<i class="${type} fa-${name} ${size}"></i>`)
}

export default helper(faIcon);
