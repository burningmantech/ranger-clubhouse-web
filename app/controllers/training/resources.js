import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import { getOwner } from '@ember/application';


export default class TrainerResourcesController extends ClubhouseController {
  @tracked editDocument;
  @tracked isReloading;
  @tracked training;

  @action
  edit() {
    this.editDocument = true;
  }

  @action
  async close() {
    this.editDocument = false;

    try {
      this.isReloading = true;
      const trainingController = getOwner(this).lookup('controller:training');
      const freshTraining = await this.ajax.request(`training/${this.training.id}`);
      trainingController.training = freshTraining
      this.training = freshTraining;
    } catch (e) {
      this.errors.handleErrorResponse(e);
    } finally {
      this.isReloading = false;
    }
  }
}
