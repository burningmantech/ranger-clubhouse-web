import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { set } from '@ember/object';

export default class MeMenteesController extends Controller {
  menteeList = [];
  totalPassed = 0;
  totalBonked = 0;
  firstYear = 0;
  lastYear = 0;

  contactMentee = null;
  message = '';

  @action
  contactAction(mentee) {
    this.set('message', '');
    this.set('contactMentee', mentee);
  }

  @action
  doneAction(messageSent) {
    const mentee = this.contactMentee;
    this.set('contactMentee', null);
    if (!messageSent) {
      return;
    }

    // Update the mentee list showing the contact.
    const date = new Date();
    set(mentee, 'last_contact', (date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()));
  }
}
