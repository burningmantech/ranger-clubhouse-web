import Component from '@ember/component';

export default class PresentOrNotComponent extends Component {
  tagName = '';
  static positionalParams = [ 'value', 'empty' ];
  value = '';
  empty = 'not given';
}
