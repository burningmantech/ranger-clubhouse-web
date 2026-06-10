import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class OpsTeamResourcesManageController extends ClubhouseController {
  @action
  close() {
    this.router.transitionTo('ops.team-resources.index');
  }

}
