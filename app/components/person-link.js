import Component from '@glimmer/component';
import { computed } from '@ember/object';

// Component to build a link to the person's page.

export default class PersonLinkComponent extends Component {
  @computed('args.page')
  get routePath() {
    const page = this.args.page || 'index';

    return `person.${page}`;
  }
}
