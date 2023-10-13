import Component from '@glimmer/component';
import {action} from '@ember/object';
import {CLAIMED} from "clubhouse/models/access-document";
import { service } from '@ember/service';

export default class TicketGiftInfoComponent extends Component {
  @service ajax;
  @service house;

  get hasMultiple() {
    return this.args.ticketPackage.giftTickets.length > 1;
  }

  @action
  claimAndSetDeliveryMethod(ticket, method) {
    this.args.setDocumentStatus(ticket, CLAIMED, () => this.setDeliveryMethod(ticket, method));
  }

  @action
  async setDeliveryMethod(ticket, method) {
    try {
      const data = {delivery_method: method, special_document_id: ticket.id};
      const {access_document} = await this.ajax.request(`ticketing/${this.args.person.id}/delivery`, {
        method: 'POST',
        data
      });
      this.house.pushPayload('access-document', access_document);
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }
}
