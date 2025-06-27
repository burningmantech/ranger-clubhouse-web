import Component from '@glimmer/component';

export default class PersonPositionsComponent extends Component {
  get hasNoTeamOrPositions() {
    const membership = this.args.personMembership;

    return (!membership.positions.length && !membership.teams.length);
  }
}
