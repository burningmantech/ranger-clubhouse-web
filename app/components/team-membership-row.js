import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';
import {buildGroupedPositions} from "clubhouse/utils/position-grouping";

export default class TeamMembershipRowComponent extends Component {
  @cached
  get allMembersPositions() {
    return this._buildPositions(this.args.allMembersPositions);
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
    return buildGroupedPositions(
      this.allMembersPositions,
      this.optionalPositions,
      this.publicPositions,
    );
  }

  // Most recent year worked across ALL of the person's granted positions.
  // Returns the raw worked_on datetime string of the latest grant, or null
  // when the person has never worked any position (rendered as NS).
  @cached
  get lastWorkedOn() {
    return this.args.person.positions.reduce((latest, g) => {
      if (!g.worked_on) {
        return latest;
      }
      return (!latest || g.worked_on > latest) ? g.worked_on : latest;
    }, null);
  }

  // Tooltip text for a granted position's worked/never-worked badge, based on
  // the grant's training/trainer role. `worked` selects the "Last …" vs
  // "Never …" wording.
  workedTitle(grant, worked) {
    const prefix = worked ? 'Last' : 'Never';
    if (grant.is_training) {
      return `${prefix} trained`;
    }
    if (grant.is_trainer) {
      return `${prefix} taught`;
    }
    return `${prefix} rangered`;
  }

  _buildPositions(positions) {
    const {person} = this.args;
    return positions.map((p) => ({
      title: p.title,
      granted: person.positions.find((g) => p.id === g.id),
    }));
  }
}
