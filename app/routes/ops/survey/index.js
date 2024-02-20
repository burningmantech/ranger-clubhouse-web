import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class OpsSurveyIndexRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return RSVP.hash({
      surveys: this.store.query('survey', {year}),
      positions: this.ajax.request('position', {data: { type: 'Training'}}).then((result) => {
        return result.position.filter((p) => p.title.includes('Training'));
      })

    });
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    controller.set('surveys', model.surveys);
    controller.set('positions', model.positions);
    controller.set('positionsById', model.positions.reduce((hash, p) => { hash[p.id] = p.title; return hash }, {}));
  }
}
