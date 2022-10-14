import Component from '@glimmer/component';

export default class PersonScheduleLogComponent extends Component {
  constructor() {
    super(...arguments);
    this.personId = +this.args.person.id; // stored as  string sometime. grr.
  }

  get isBefore2019() {
    return this.args.year < 2019;
  }
}
