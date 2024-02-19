import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';

export default class TeamMembershipRowComponent extends Component {
  constructor() {
    super(...arguments);

  }

  @cached
  get allMembersPositions() {
    return this._buildPositions(this.args.allMembershipPositions);
  }

  @cached
  get optionalPositions() {
    return this._buildPositions(this.args.optionalPositions);
  }

  @cached
  get publicPositions() {
    return this._buildPositions(this.args.publicPositions);
  }

  _buildPositions(positions) {
    const {person} = this.args;
    return positions.map((p) => {
      return {
        title: p.title,
        granted: person.positions.find((g) => p.id === g.id)
      };
    });
  }
}
