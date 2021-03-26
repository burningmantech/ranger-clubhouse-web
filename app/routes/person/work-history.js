import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import _ from 'lodash';
import moment from 'moment';
import {ALPHA, DEEP_FREEZE} from "../../constants/positions";

export default class PersonWorkHistoryRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('timesheet', {data: {person_id: this.modelFor('person').id}})
  }

  setupController(controller, model) {
    let timesheet = model.timesheet;
    const positionsByYear = {};
    const positionsById = {};

    const yearTotals = {};
    let totalDuration = 0;

    timesheet = timesheet.filter((t) => t.position_id !== ALPHA && t.position_id !== DEEP_FREEZE && !t.position.title.includes('Training'));

    timesheet.forEach((t) => {
      t.year = moment(t.on_duty).year();
      const position = positionsByYear[t.year] ||= {};
      const positionByYear = (position[t.position_id] ||= {entries: [], duration: 0});
      positionByYear.entries.push(t);
      positionByYear.duration += t.duration;

      const positionById = (positionsById[t.position_id] ||= {
        id: t.position_id,
        title: t.position.title,
        years: {},
        duration: 0,
        entries: []
      });
      positionById.duration += t.duration;
      positionById.entries.push(t);

      const positionByYearId = (positionById.years[t.year] ||= {id: t.position_id, duration: 0, entries: []});
      positionByYearId.entries.push(t);
      positionByYearId.duration += t.duration;

      yearTotals[t.year] ||= { duration: 0, entries: []};
      yearTotals[t.year].duration += t.duration;
      yearTotals[t.year].entries.push(t);
      totalDuration += t.duration;
    });

    let positions = _.sortBy(_.values(positionsById), 'title');

    controller.set('years', _.uniqBy(timesheet, 'year').map((t) => t.year));
    controller.set('yearTotals', yearTotals);
    controller.set('totalDuration', totalDuration);
    controller.set('positionsByYear', positionsByYear);
    controller.set('positionsById', positionsById);
    controller.set('positions', positions);
    controller.set('hasInaccurateTimesheets', !!timesheet.find((t) => t.year < 2008));
    controller.set('hasNonRangerWork', !!timesheet.find((t) => t.is_non_ranger));
    controller.set('person', this.modelFor('person'));
  }
}
