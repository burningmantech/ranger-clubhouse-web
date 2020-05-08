import Component from '@glimmer/component';

export default class LoadingIndicatorComponent extends Component {
  get text() {
    return this.args.text || 'Submitting';
  }
}
