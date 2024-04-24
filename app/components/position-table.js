import Component from '@glimmer/component';
import {action} from '@ember/object';
import {htmlSafe} from '@ember/template';
import {TECH_NINJA} from "clubhouse/constants/roles";
import {service} from '@ember/service';

export default class PositionTableComponent extends Component {
  @service session;

  constructor() {
    super(...arguments);
    this.isTechNinja = this.session.hasRole(TECH_NINJA);
  }

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
    const team = this.args.teamById[teamId];
    return team ? team.title : htmlSafe('<i class="text-muted">Not Assigned</i>')
  }
}
