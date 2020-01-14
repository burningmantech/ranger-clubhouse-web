import Component from '@ember/component';

export default class LoadingDialogComponent extends Component {
  tagName = '';
  static positionalParams = [ 'item' ];

  item = 'the information';
  customMessage = null;
}
