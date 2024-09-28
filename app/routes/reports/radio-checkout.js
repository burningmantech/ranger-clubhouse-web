import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class ReportsRadioCheckoutRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true },
    include_qualified: { refreshModel: true },
    event_summary: { refreshModel: true },
  };

  model(params) {
    const year = requestYear(params);
    const query = { year };

    if (this._isSet(params.include_qualified)) {
      query.include_qualified = 1;
    }

    if (this._isSet(params.event_summary)) {
      query.event_summary = 1;
    }

    return RSVP.hash({
      radios: this.ajax.request('asset-person/radio-checkout-report', {
        data: query
      }).then((results) => results.radios),
      year,
      include_qualified: query.include_qualified ? 1 : 0,
      event_summary: query.event_summary ? 1 : 0,
    });
  }

  setupController(controller, model) {
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
      controller.set('include_qualified', false);
      controller.set('event_summary', false);
    }
  }

  _isSet(value) {
    return (parseInt(value) || value === 'true');
  }
}
