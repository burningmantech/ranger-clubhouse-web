import Route from '@ember/routing/route';
import _ from 'lodash';
import moment from 'moment';
import {ALPHA, DEEP_FREEZE} from "../../constants/positions";

export default class PersonWorkHistoryRoute extends Route {
  model() {
    return this.ajax.request('timesheet', {data: {person_id: this.modelFor('person').id}})
  }

  setupController(controller, model) {
    let timesheet = model.timesheet;
    const positionsByYear = {};
    const positionsById = {};

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

      const positionByYearId = (positionById.years[t.year] ||= {duration: 0, entries: []});
      positionByYearId.entries.push(t);
      positionByYearId.duration += t.duration;
    });

    let positions = _.sortBy(_.values(positionsById), 'title');

    controller.set('years', _.uniqBy(timesheet, 'year').map((t) => t.year));
    controller.set('positionsByYear', positionsByYear);
    controller.set('positionsById', positionsById);
    controller.set('positions', positions);
    controller.set('hasPriorTo2010', !!timesheet.find((t) => t.year < 2010))

    controller.set('person', this.modelFor('person'));
  }
}
