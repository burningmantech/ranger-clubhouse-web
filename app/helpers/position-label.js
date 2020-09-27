import { helper } from '@ember/component/helper';

export function positionLabel([position]) {
  let decorator = (position.active) ? '' : ' - [INACTIVE]';
  return `${position.title}${decorator}`;
}

export default helper(positionLabel);
