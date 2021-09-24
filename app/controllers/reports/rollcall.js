import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class ReportsRollcallController extends ClubhouseController {
  @tracked isSignOut = false;
  @tracked isSignIn = false;

  @action
  chooseSignIn(event) {
    this.isSignOut = false;
    this.isSignIn = true;
  }

  @action
  chooseSignOut(event) {
    this.isSignOut = true;
    this.isSignIn = false;
  }
}
