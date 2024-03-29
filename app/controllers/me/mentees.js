import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { set } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MeMenteesController extends ClubhouseController {
  @tracked menteeList = [];
  @tracked totalPassed = 0;
  @tracked totalBonked = 0;
  @tracked totalMentees;
  @tracked firstYear = 0;
  @tracked lastYear = 0;

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
