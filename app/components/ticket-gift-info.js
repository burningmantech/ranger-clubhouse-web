import Component from '@glimmer/component';
import {action} from '@ember/object';
import {CLAIMED} from "clubhouse/models/access-document";
import {service} from '@ember/service';

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
      const {access_document} = await this.ajax.post(`ticketing/${this.args.person.id}/delivery`, {data});
      this.house.pushPayload('access-document', access_document);
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  @action
  ticketDelivery(ticket) {
    const info = this.args.ticketingInfo;

    if (ticket.isDeliveryNone) {
      return 'no delivery method chosen';
    } else if (ticket.isDeliveryPriorityPost) {
      return `delivery via USPS Priority Mail ($${info.mail_priority_price})`;
    } else if (ticket.isDeliveryStandardPost) {
      return `delivery via USPS Standard Mail ($${info.mail_standard_price})`;
    } else if (ticket.isDeliveryWillCall) {
      return 'for pickup at Will Call (free)';
    } else {
      return `Unknown delivery method [${ticket.delivery_method}]`;
    }
  }
}
