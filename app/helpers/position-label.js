import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';
import _ from 'lodash';


export function positionLabel([position, muted = false]) {
  const flag = (position.active) ? '' : ' [inactive]';
  const decorator = (muted) ? flag : `<span class="text-danger">${flag}</span>`;
  const title = _.escape(position.title);

  return htmlSafe(`${title}${decorator}`);
}

export default helper(positionLabel);
