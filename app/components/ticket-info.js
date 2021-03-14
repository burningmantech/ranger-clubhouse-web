import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { CLAIMED, BANKED } from "clubhouse/models/access-document";
import { inject as service } from '@ember/service';

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
    for (const ticket of tickets) {
      try {
        let status;
        if (item === 'none') {
          status = BANKED;
        } else {
          status = (ticket.id === item.id) ? CLAIMED : BANKED;
        }

        const result = await this.ajax.request(`access-document/${ticket.id}/status`, {
          method: 'PATCH',
          data: {status}
        });
        this.house.pushPayload('access-document', result.access_document);
      } catch (response) {
        this.house.handleErrorResponse(response);
        haveErrors = true;
      }
    }

    this.isSubmitting = false;

    if (!haveErrors) {
      this.toast.success('Your choice has been successfully saved.');
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
