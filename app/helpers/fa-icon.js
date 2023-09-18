import {helper} from '@ember/component/helper';
import {htmlSafe} from '@ember/template';
import {isEmpty} from '@ember/utils';

export function faIcon([name], namedParams) {
  const attrs =[ ];
  let type;
  switch (namedParams.type) {
    case 's':
    case 'fas':
      type = 'fa-solid';
      break;
    case 'r':
    case 'far':
      type = 'fa-regular';
      break;
    default:
      if (isEmpty(namedParams.type)) {
        type = 'fa-solid';
      } else {
        type = namedParams.type;
      }
  }

  attrs.push(type);
  attrs.push(`fa-${name}`);
  if (namedParams.color) {
    attrs.push(`text-${namedParams.color}`);
  }
  if (namedParams.size) {
    attrs.push(`fa-${namedParams.size}`);
  }
  if (namedParams.spinner || namedParams.spin) {
    attrs.push('fa-spin');
  }
  if (namedParams.fixed) {
    attrs.push('fa-fw');
  }

  if (namedParams.right) {
    attrs.push(`me-${namedParams.right}`);
  }

  if (namedParams.left) {
    attrs.push(`ms-${namedParams.left}`);
  }

  const title = namedParams.title ? ` title="${namedParams.title}"` : '';

  return htmlSafe(`<i class="${attrs.join(' ')}"${title}></i>`)
}

export default helper(faIcon);
