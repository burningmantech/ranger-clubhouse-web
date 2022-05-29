import Component from '@glimmer/component';
import { action } from '@ember/object';
import {BANKED, CLAIMED} from 'clubhouse/models/access-document';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';

export default class TicketAppreciationsComponent extends Component {
  @service ajax;
  @service house
  @service toast;

  constructor() {
    super(...arguments);

    this.items = this.args.ticketPackage.appreciations;
  }

  @cached
  get availableItems() {
    return this.items.filter((i) => (!i.is_allocated && (i.isQualified || i.isClaimed)));
  }

  @cached
  get bankedItems() {
    return this.items.filter((i) => i.isBanked);
  }

  @cached
  get jobItems() {
    return this.items.filter((i) => i.is_allocated);
  }

  @cached
  get submittedItems() {
    return this.items.filter((i) => i.isSubmitted);
  }

  @cached
  get totalItems() {
    return [...this.availableItems, ...this.jobItems];
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
