import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class OpsRollcallController extends ClubhouseController {
  @tracked isSignOut = false;
  @tracked isSignIn = false;

  @action
  chooseSignIn() {
    this.isSignOut = false;
    this.isSignIn = true;
  }

  @action
  chooseSignOut() {
    this.isSignOut = true;
    this.isSignIn = false;
  }
}
