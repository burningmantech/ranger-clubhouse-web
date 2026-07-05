import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import { getOwner } from '@ember/application';


export default class TrainerResourcesController extends ClubhouseController {
  @tracked editDocument;
  @tracked isReloading;
  @tracked training;
  @tracked canEditTrainerResource;

  @action
  edit() {
    this.editDocument = true;
  }

  @action
  async close() {
    this.editDocument = false;

    try {
      this.isReloading = true;
      await getOwner(this).lookup('route:training').refresh();
    } catch (e) {
      this.errors.handleErrorResponse(e);
    } finally {
      this.isReloading = false;
    }
  }
}
