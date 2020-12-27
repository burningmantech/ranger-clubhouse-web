import Component from '@glimmer/component';

export default class SchedulePositionListComponent extends Component {
  get signupCount() {
    return this.args.position.slots.reduce((signups, s) => ((s.person_assigned ? 1 : 0) + signups), 0);
  }
}
