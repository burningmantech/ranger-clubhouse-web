import Component from '@glimmer/component';
import {action} from '@ember/object';
import {BANKED, CLAIMED} from 'clubhouse/models/access-document';
import {service} from '@ember/service';
import {cached} from '@glimmer/tracking';

export default class TicketProvisionsComponent extends Component {
  @service ajax;
  @service house
  @service toast;

  constructor() {
    super(...arguments);

    const {ticketPackage} = this.args;
    this.provisions = ticketPackage.provisions;
    this.allocatedProvisions = ticketPackage.allocatedProvisions;
    this.jobItems = ticketPackage.jobItems;
  }

  @cached
  get earnedProvisions() {
    return this.provisions.filter((i) => (!i.is_allocated && (i.isAvailable || i.isClaimed)));
  }

  @cached
  get bankedItems() {
    return this.provisions.filter((i) => i.isBanked);
  }

  @cached
  get submittedItems() {
    return this.provisions.filter((i) => i.isSubmitted);
  }

  @cached
  get totalItems() {
    return this.provisions;
  }

  @action
  async updateItems(desire) {
    let provisions, status;
    this.isSubmitting = true;

    if (desire === 'bank') {
      status = BANKED;
      provisions = this.earnedProvisions;
    } else {
      status = CLAIMED;
      provisions = this.bankedItems;
    }

    const statuses = provisions.map((p) => ({id: p.id, status}));

    try {
      const result = await this.ajax.request(`provision/statuses`, {
        method: 'PATCH',
        data: {statuses}
      });
      this.house.pushPayload('provision', result.access_document);
      this.toast.success('Your choice has been successfully saved.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
