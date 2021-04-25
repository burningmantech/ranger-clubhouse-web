import Component from '@glimmer/component';
import { action } from '@ember/object';
import {BANKED, CLAIMED} from 'clubhouse/models/access-document';
import { inject as service } from '@ember/service';

export default class TicketAppreciationsComponent extends Component {
  @service ajax;
  @service house
  @service toast;

  constructor() {
    super(...arguments);

    this.items = this.args.ticketPackage.appreciations;
  }

  get availableItems() {
    return this.items.filter((i) => (i.isQualified || i.isClaimed));
  }

  get bankedItems() {
    return this.items.filter((i) => i.isBanked);
  }

  get submittedItems() {
    return this.items.filter((i) => i.isSubmitted);
  }

  @action
  async updateItems(desire) {
    let provisions, status;
    this.isSubmitting = true;

    if (desire === 'bank') {
      status = BANKED;
      provisions = this.availableItems;
    } else {
      status = CLAIMED;
      provisions = this.bankedItems;
    }

    const statuses = provisions.map((p) => ({ id: p.id, status }));

    try {
      const result = await this.ajax.request(`access-document/statuses`, {
        method: 'PATCH',
        data: {statuses}
      });
      this.house.pushPayload('access-document', result.access_document);
      this.toast.success('Your choice has been successfully saved.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;

    }
  }
}
