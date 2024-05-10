import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class OpsSurveyIndexRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return RSVP.hash({
      surveys: this.store.query('survey', {year}),
      positions: this.ajax.request('position', {data: {type: 'Training'}}).then(({position}) => {
        return position.filter((p) => p.title.includes('Training'));
      }),
      mentorPositions: this.ajax.request('position', {data: {mentor: 1}}).then(({position}) => position),
      menteePositions: this.ajax.request('position', {data: {mentee: 1}}).then(({position}) => position)
    });
  }

  setupController(controller, model) {
    controller.year = this.year;
    controller.surveys = model.surveys;
    controller.positionsById = model.positions.reduce((hash, p) => {
      hash[p.id] = p.title;
      return hash
    }, {});
    controller.positionOptions = this._buildPositionOptions(model.positions);
    controller.mentorPositionOptions = this._buildPositionOptions(model.mentorPositions);
    controller.menteePositionOptions = this._buildPositionOptions(model.menteePositions);
  }

  _buildPositionOptions(positions) {
    const options = positions.map((p) => ({id: p.id, title: p.active ? p.title : `${p.title} [inactive]`}));
    options.unshift({id: null, title: '----'});
    return options;
  }
}
