import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';
import _ from 'lodash';


export function positionLabel([position]) {
  const decorator = (position.active) ? '' :
    '<span class="text-danger"> [inactive]</span>'
  const title = _.escape(position.title);

  return htmlSafe(`${title}${decorator}`);
}

export default helper(positionLabel);
