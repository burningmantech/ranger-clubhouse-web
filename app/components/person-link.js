import Component from '@glimmer/component';
// Component to build a link to the person's page.

export default class PersonLinkComponent extends Component {
  get routePath() {
    return `person.${this.args.page || 'index'}`;
  }
}
