import Component from '@glimmer/component';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default class PositionTableComponent extends Component {
  @action
  roleList(roleIds) {
    if (!roleIds?.length) {
      return '-';
    }

    const roles = roleIds.map((id) => this.args.roleById[id].title ?? `Role #${id}`);
    roles.sort();
    return htmlSafe(roles.join('<br>'));
  }

  @action
  teamName(teamId) {
    const team =  this.args.teamById[teamId];
    return team ? team.title : htmlSafe('<i class="text-muted">Not Assigned</i>')
  }
}
