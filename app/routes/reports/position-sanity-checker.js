import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, MANAGE} from 'clubhouse/constants/roles';
import {yesno} from 'clubhouse/helpers/yesno';

export default class ReportsPositionSanityCheckerRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, MANAGE];

  model() {
    return this.ajax.request('position/sanity-checker');
  }

  setupController(controller, model) {
    controller.set('shiny_pennies', this.shinyPennies(model.shiny_pennies))
    controller.set('shiny_penny_year', model.shiny_penny_year)
    controller.set('team_positions', this.teamPositions(model.team_positions))
    controller.set('team_membership', this.teamMembership(model.team_membership))
    controller.set('deactivated_positions', this.deactivated_positions(model.deactivated_positions));
    controller.set('lmyr', this.lmyrRole(model.lmyr));
  }

  shinyPennies(shiny_pennies) {
    this._setChecked(shiny_pennies);
    this._setYesNo(shiny_pennies, 'has_shiny_penny')

    shiny_pennies.columns = [
      {label: 'Mentor Year', property: 'year'},
      {label: 'Has Position?', property: 'has_shiny_penny', class: 'text-center'}
    ]

    return shiny_pennies
  }

  lmyrRole(lmyr) {
    this._setChecked(lmyr);

    return lmyr;
  }

  teamPositions(people) {
    this._setChecked(people);

    people.columns = [
      {label: 'Team', property: 'team_title'},
      {label: 'Missing Position', property: 'position_title'},
    ];

    return people
  }

  teamMembership(people) {
    this._setChecked(people);

    people.columns = [
      {label: 'Missing Team Membership', property: 'team_title'},
      {label: 'Have Team Position(s)', property: 'title', array: 'positions'},
    ];

    return people
  }

  deactivated_positions(positions) {
    positions.forEach((p) => this._setChecked(p.people));
    return positions;
  }

  _setChecked(rows) {
    rows.forEach((row) => row.checked = 1);
  }

  _setYesNo(rows, ...properties) {
    rows.forEach((r) => properties.forEach((prop) => r[prop] = yesno([r[prop]])));
  }
}
