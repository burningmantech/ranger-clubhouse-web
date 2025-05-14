import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class AdminPersonBannersController extends ClubhouseController {
  @tracked entry;
  @tracked banners;

  @action
  edit(entry) {
    this.entry = entry;
  }

  @action
  closeDialog() {
    this.entry = null;
  }
}

