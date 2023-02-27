import Component from '@glimmer/component';
import {action} from '@ember/object';
import {CLAIMED, TURNED_DOWN} from 'clubhouse/models/access-document';
import {service} from "@ember/service";


export default class TicketSpecialChoiceComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @action
  claimTicket(ticket) {
    this._updateStatus(ticket, CLAIMED);
  }

  @action
  turnDownTicket(ticket) {
    this._updateStatus(ticket, TURNED_DOWN);
  }

  get haveMultipleTickets() {
    return this.args.tickets.length > 1;
  }

  get haveClaimed() {
    return this.args.tickets.some((t) => t.isClaimed);
  }

  async _updateStatus(ticket, status) {
    try {
      const {access_document} = await this.ajax.request(`access-document/${ticket.id}/status`, {
        method: 'PATCH',
        data: {status},
      });
      this.house.pushPayload('access-document', access_document);
      this.toast.success('Your choice has been successfully recorded.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }
}
