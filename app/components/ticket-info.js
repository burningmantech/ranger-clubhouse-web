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
    const {tickets, vehiclePass} = this.args.ticketPackage;

    this.isSubmitting = true;
    let haveErrors = false;

    const statuses = [];
    for (const ticket of tickets) {
      let status;
      if (item === 'none') {
        status = BANKED;
      } else {
        status = (ticket.id === item.id) ? CLAIMED : BANKED;
      }
      statuses.push({id: ticket.id, status});
    }

    try {
      const result = await this.ajax.request(`access-document/statuses`, {
        method: 'PATCH',
        data: {statuses}
      });
      this.house.pushPayload('access-document', result.access_document);
    } catch (response) {
      this.house.handleErrorResponse(response);
      haveErrors = true;
    }

    if (vehiclePass) {
      try {
        // vehicle pass may have been released if all tickets were banked -- the backend will
        // attempt to prevent a person from trying to game the system by banking all tickets
        // and claim the VP.
        await vehiclePass.reload();
      } catch (response) {
        this.house.handleErrorResponse(response);
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
