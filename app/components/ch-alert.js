import Component from '@glimmer/component';

export default class ChAlertComponent extends Component {
  get type() {
    return this.args.type || 'danger';
  }
}
