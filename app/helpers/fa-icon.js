import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

export function faIcon([ name ], namedParams) {
  const size = namedParams.size ? ` fa-${namedParams.size}` : '';
  const type = namedParams.type || 'fas';
  const color = namedParams.color ? ` text-${namedParams.color}` : '';
  const title = namedParams.title ? ` title="${namedParams.title}"` : '';
  const spinner = namedParams.spin ? ` fa-spin` : '';
  const fixed = namedParams.fixed ? ' fa-fw' : '';
  return htmlSafe(`<i class="${type} fa-${name}${size}${color}${spinner}${fixed}"${title}></i>`)
}

export default helper(faIcon);
