import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';

export default class MeTimesheetController extends Controller {
  queryParams = [ 'year' ];

  @computed('timesheets')
  get positions() {
    let positionGroups = {};
    const timesheets = this.timesheets;

    timesheets.forEach((sheet) => {
      const title = sheet.position_title;
      let group = positionGroups[title];
      if (!group) {
        group = positionGroups[title] = [];
      }

      group.push(sheet);
    })

    const positionTitles = Object.keys(positionGroups).sort();
    const positions = [];

    positionTitles.forEach(function(title) {
        const group = positionGroups[title];
        const credits = group.reduce((credits, position) => { return position.credits + credits }, 0.0);
        const duration = group.reduce((duration, position) => { return position.duration + duration }, 0);

        positions.push({ title, credits, duration, total: group.length });
    });

    return positions;
  }

  @action
  changeYear(year) {
    this.set('year', year);
  }
}
