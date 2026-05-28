import Component from '@glimmer/component';
import {action} from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { severityWeight } from 'clubhouse/utils/intake-summaries';

export default class UnifiedFlaggingComponent extends Component {
  queryParams=['year'];
  @service ajax;
  @service house;

  @tracked people = [];

  constructor() {
    super(...arguments);
    this.people = this.args.people;
  }

  // Worst-first so Personnel flags and Rank 4/3 concerns sort to the top.
  get sortedPeople() {
    return this.people.slice().sort((a, b) => severityWeight(b) - severityWeight(a));
  }

  @action
  noteSubmitted(person) {
    return this.ajax.request(`intake/${person.id}/history`, {method: 'GET', data: {year: this.args.year}})
      .then((result) => { this.people = this.people.map((p) => (p === person ? result.person : p)) } )
      .catch((response) => this.house.handleErrorResponse(response));
  }
}
