import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action, set} from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { validatePresence } from 'ember-changeset-validations/validators';

export default class SearchVehiclesController extends ClubhouseController {
  searchValidations = {
    number: [ validatePresence(true) ]
  };

  queryParams = [ 'id', 'number' ];

  @tracked vehicleForm;
  @tracked vehicles = null;
  @tracked vehicleNotFound = false;

  @action
  searchAction(model, isValid) {
    if (!isValid) {
      return;
    }
    // Fire away!
    set(this, 'number', model.number);
    set(this, 'id', null);
  }
}
