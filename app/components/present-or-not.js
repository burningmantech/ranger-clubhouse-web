import Component from '@glimmer/component';

export default class PresentOrNotComponent extends Component {
  get empty() {
    return this.args.empty || 'not given';
  }
}
