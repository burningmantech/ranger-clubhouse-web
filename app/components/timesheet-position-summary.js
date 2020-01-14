import Component from '@ember/component';
import { computed } from '@ember/object';

export default class TimesheetPositionSummaryComponent extends Component {
  tagName = '';

  timesheets = null;

  @computed('timesheets')
  get workedPositions() {
    let positionGroups = {};
    const timesheets = this.timesheets;

    timesheets.forEach((sheet) => {
      const title = sheet.position.title;
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
        const credits = group.reduce((credits, position) => (position.credits + credits), 0.0);
        const duration = group.reduce((duration, position) => (position.duration + duration), 0);

        positions.push({ title, credits, duration, total: group.length });
    });

    return positions;
  }
}
