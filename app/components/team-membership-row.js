import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';

export default class TeamMembershipRowComponent extends Component {
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

  @cached
  get allPositions() {
    const tag = (positions) => positions.map((p, i) => ({...p, groupStart: i === 0}));
    return [
      ...tag(this.allMembersPositions),
      ...tag(this.optionalPositions),
      ...tag(this.publicPositions),
    ];
  }

  _buildPositions(positions) {
    const {person} = this.args;
    return positions.map((p) => ({
      title: p.title,
      granted: person.positions.find((g) => p.id === g.id),
    }));
  }
}
