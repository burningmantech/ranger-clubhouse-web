import Component from '@ember/component';

export default class ChBoxComponent extends Component {
  tagName = 'div';
  classNames = [ 'card', 'mb-3' ];

  static positionalParams =  [ 'title' ];

  // Box title
  title = null;

  // Box type/size (sm, md, lg)
  type = null;

  // Title icon
  icon = null;

  iconType = null;

  // If true, then card-body div is not emitted.
  noBody = false;
}
