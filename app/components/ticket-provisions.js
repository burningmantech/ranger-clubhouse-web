import Component from '@glimmer/component';
import {action} from '@ember/object';
import {BANKED, CLAIMED} from 'clubhouse/models/provision';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class TicketProvisionsComponent extends Component {
  @service ajax;
  @service house
  @service toast;

  @tracked isSubmitting = false;

  /**
   * Claim or bank all the provisions.
   *
   * @param {string} desire
   * @returns {Promise<void>}
   */

  @action
  async updateItems(desire) {
    this.isSubmitting = true;

    const status = desire === 'bank' ? BANKED : CLAIMED;

    try {
      await this.ajax.request(`provision/${this.args.person.id}/statuses`, {
        method: 'PATCH',
        data: {status}
      });
      this.toast.success('Your choice has been successfully saved.');
      this.args.ticketPackage.provisionsBanked = (desire === 'bank');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Does the person have an event radio?
   *
   * @returns {boolean}
   */

  get haveEventRadio() {
    return !!this.args.ticketPackage.provisionItems.find((p) => p.isEventRadio);
  }
}
