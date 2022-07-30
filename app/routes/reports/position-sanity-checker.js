import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN, GRANT_POSITION, MANAGE } from 'clubhouse/constants/roles';
import { yesno } from 'clubhouse/helpers/yesno';

export default class ReportsPositionSanityCheckerRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, GRANT_POSITION, MANAGE];

  model() {
    return this.ajax.request('position/sanity-checker');
  }

  setupController(controller, model) {
    controller.set('shiny_pennies', this.shinyPennies(model.shiny_pennies))
    controller.set('shiny_penny_year', model.shiny_penny_year)
    controller.set('green_dot', this.greenDots(model.green_dot))
    controller.set('management_role', this.managers(model.management_role))
    controller.set('management_onplaya_role', this.managers(model.management_onplaya_role))
    controller.set('deactivated_positions', this.deactivated_positions(model.deactivated_positions))
  }

  shinyPennies(shiny_pennies) {
    this._setChecked(shiny_pennies);
    this._setYesNo(shiny_pennies, 'has_shiny_penny')

    shiny_pennies.columns = [
      {label: 'Mentor Year', property: 'year'},
      {label: 'Has Posotion?', property: 'has_shiny_penny', class:'text-center' }
    ]

    return shiny_pennies
  }

  greenDots(green_dots) {
    this._setChecked(green_dots);
    this._setYesNo(green_dots, 'has_dirt_green_dot', 'has_sanctuary')

    green_dots.columns = [
      {label: 'Has Dirt - Green Dot?', property: 'has_dirt_green_dot', class:'text-center'},
      {label: 'Has Sanctuary?', property: 'has_sanctuary', class:'text-center'},
    ]

    return green_dots
  }

  managers(managers) {
    this._setChecked(managers);
    this._setYesNo(managers, 'is_shiny_penny')
    managers.forEach((mr) => mr.positions = mr.positions.map(p => p.title).join())

    managers.columns = [
      {label: 'Postion(s)', property: 'positions'},
      {label: 'Is Shiny Penny?', property: 'is_shiny_penny', class: 'text-center'}
    ]

    return managers;
  }

  deactivated_positions(positions) {
    positions.forEach((p) => this._setChecked(p.people));
    return positions;
  }

  _setChecked(rows) {
    rows.forEach((row) => row.checked = 1);
  }

  _setYesNo(rows, ...properties) {
    rows.forEach((r) => {
      properties.forEach( (prop) => r[prop] = yesno([r[prop]]))
    })
  }
}
