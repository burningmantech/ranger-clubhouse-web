import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {MANAGE} from "clubhouse/constants/roles";
import _ from 'lodash';
import { cached,tracked } from '@glimmer/tracking';

class Position {
  @tracked isChecked = false;

  constructor(position) {
    this.title = position.active ? position.title : `${position.title} (inactive)`;
    this.id = position.id;
  }
}

class Team {
  @tracked positionOptions;
  @tracked title;

  constructor(team, positions) {
    this.title = team.title;
    this.positionOptions = positions.map((p) => new Position(p));
  }

  @cached
  get selectedCount() {
    return this.positionOptions.reduce((total, p) => p.isChecked ? total + 1 : total, 0);
  }

}

export default class ReportsNoShowsRoute extends ClubhouseRoute {
  roleRequired = MANAGE;

  async model() {
    return {
      positions: (await this.ajax.request('position')).position,
      teams: (await this.ajax.request('team')).team
    };
  }

  setupController(controller,model) {
    controller.positions = model.positions;
    controller.teams = model.teams;
    controller.haveResults = false;

    const positionsByTeam = _.groupBy(model.positions, 'team_id');
    const teamOptions = [];
    model.teams.forEach((t) => {
      const teamPositions = positionsByTeam[t.id];
      if (!teamPositions) {
        return;
      }

      teamOptions.push(new Team(t, teamPositions));
    });

    const general = model.positions.filter((p) => !p.team_id);
    if (general.length) {
      teamOptions.unshift(new Team({ id: 0, title: 'General Positions'}, general));
    }

    controller.teamOptions = teamOptions;
    controller.year = this.session.currentYear();
  }
}
