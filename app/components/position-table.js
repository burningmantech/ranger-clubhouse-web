import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';
import {ATTR_LABELS} from 'clubhouse/models/position';

export default class PositionTableComponent extends Component {
  @cached
  get rows() {
    const {viewPositions, roleById, teamById} = this.args;

    return viewPositions.map((position) => ({
      id: position.id,
      position,
      team: teamById[position.team_id],
      roleTitles: (position.role_ids ?? [])
        .map((id) => roleById[id]?.title ?? `Role #${id}`)
        .sort(),
      attributeLabels: ATTR_LABELS.filter(({id}) => position[id]).map(({label}) => label),
    }));
  }
}
