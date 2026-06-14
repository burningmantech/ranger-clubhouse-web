import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class OpsSurveyIndexRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  async model(params) {
    const year = requestYear(params);
    this.year = year;
    return {
      surveys: await this.store.query('survey', {year}),
      positions: (await this.ajax.request('survey/positions')).positions,
      mentorPositions: (await this.ajax.request('position', {data: {mentor: 1}})).position,
      menteePositions: (await this.ajax.request('position', {data: {mentee: 1}})).position
    };
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
