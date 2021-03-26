import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { set } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MeMenteesController extends ClubhouseController {
  menteeList = [];
  totalPassed = 0;
  totalBonked = 0;
  firstYear = 0;
  lastYear = 0;

  @tracked contactMentee = null;
  @tracked message = '';

  @action
  contactAction(mentee) {
    this.message = '';
    this.contactMentee =  mentee;
  }

  @action
  doneAction(messageSent) {
    const mentee = this.contactMentee;
    this.contactMentee = null;
    if (!messageSent) {
      return;
    }

    // Update the mentee list showing the contact.
    const date = new Date();
    set(mentee, 'last_contact', (date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()));
  }
}
