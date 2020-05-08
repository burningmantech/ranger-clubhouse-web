import Component from '@glimmer/component';

export default class LoadingDialogComponent extends Component {
  get item() {
    return this.args.item || 'the information';
  }
}
