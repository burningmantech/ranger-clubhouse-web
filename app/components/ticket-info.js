import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {CLAIMED, BANKED} from "clubhouse/models/access-document";
import {service} from '@ember/service';

export default class TicketInfoComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked isSubmitting = false;

  @action
  async chooseTicketAction(item) {
    const {tickets} = this.args.ticketPackage;

    this.isSubmitting = true;
    let haveErrors = false;

    if (item === 'none') {
      for (const ticket of tickets) {
        const success = await this._updateStatus(ticket, BANKED);
        if (!success) {
          haveErrors = true;
        }
      }
    } else {
      if (!(await this._updateStatus(item, CLAIMED))) {
        haveErrors = true;
      }
    }

    this.isSubmitting = false;

    if (!haveErrors) {
      this.toast.success('Your choice has been successfully saved.');
    }
  }

  async _updateStatus(ticket, status) {
    try {
      const {access_document} = await this.ajax.patch(`access-document/${ticket.id}/status`, {
        data: {status}
      });
      this.house.pushPayload('access-document', access_document);
      return true;
    } catch (response) {
      this.house.handleErrorResponse(response);
      return false;
    }
  }

  get allTicketsBanked() {
    const {tickets} = this.args.ticketPackage;
    return tickets.length && !tickets.find((t) => !t.isBanked);
  }

  get haveQualifiedTickets() {
    return !!this.args.ticketPackage.tickets.find((t) => t.isQualified);
  }

  get nextDisabled() {
    if (this.allTicketsBanked) {
      return false;
    }

    return this.haveQualifiedTickets;
  }
}
