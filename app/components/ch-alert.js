import Component from '@ember/component';

export default class ChAlertComponent extends Component {
  tagName = '';
  static positionalParams = [ 'type' ];

  type='danger';
  bold = false;
}
