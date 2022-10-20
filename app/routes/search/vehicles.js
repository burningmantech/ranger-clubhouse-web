import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {isEmpty} from '@ember/utils';
import {NotFoundError} from '@ember-data/adapter/error';

export default class SearchVehiclesRoute extends ClubhouseRoute {
  queryParams = {
    id: {refreshModel: true},
    number: {refreshModel: true}
  };

  model({number, id}) {
    this.number = number;
    this.vehicleId = id;

    if (id) {
      return this.store.findRecord('vehicle', id, {reload: true}).catch((response) => {
        if (response instanceof NotFoundError) {
          return null;
        }
        throw response;
      });
    } else if (!isEmpty(number)) {
      return this.store.query('vehicle', {event_year: this.house.currentYear(), number});
    } else {
      return null;
    }
  }

  setupController(controller, model) {
    let notFound = false;

    if (this.vehicleId) {
      if (model) {
        controller.set('vehicles', [model]);
      } else {
        notFound = true;
      }
      controller.set('number', null);
    } else if (this.number) {
      if (model.length) {
        controller.set('vehicles', model);
      } else {
        notFound = true;
      }
      controller.set('id', null);
    } else {
      controller.set('id', null);
      controller.set('number', null);
      controller.set('vehicles', []);
    }

    controller.set('vehicleForm', {number: this.number});
    if (notFound) {
      controller.set('vehicleNotFound', (this.vehicleId ? `Vehicle Record #${this.vehicleId}` : `License, Rental, or Sticker # ${this.numbers}`));
    } else {
      controller.set('vehicleNotFound', null);
    }
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('id', null);
      controller.set('number', null)
    }
  }
}
