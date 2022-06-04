import Component from '@glimmer/component';
import { action } from '@ember/object';
import {BANKED, CLAIMED} from 'clubhouse/models/access-document';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';

export default class TicketProvisionsComponent extends Component {
  @service ajax;
  @service house
  @service toast;

  constructor() {
    super(...arguments);

    this.provisions = this.args.ticketPackage.provisions;
  }

  @cached
  get earnedProvisions() {
    return this.provisions.filter((i) => (!i.is_allocated && !i.is_superseded && (i.isQualified || i.isClaimed)));
  }

  @cached
  get supersededProvisions() {
    return this.provisions.filter((i) => i.is_superseded);
  }

  @cached
  get bankedItems() {
    return this.provisions.filter((i) => i.isBanked);
  }

  @cached
  get allBankedItems() {
    return [...this.bankedItems, ...this.supersededProvisions];
  }

  @cached
  get allocatedProvisions() {
    return this.provisions.filter((i) => i.is_allocated);
  }

  @cached
  get submittedItems() {
    return this.provisions.filter((i) => i.isSubmitted);
  }

  @cached
  get totalItems() {
    return [...this.earnedProvisions, ...this.allocatedProvisions];
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
