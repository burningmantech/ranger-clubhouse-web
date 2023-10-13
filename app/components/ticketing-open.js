import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {service} from '@ember/service';

export default class TicketingOpenComponent extends Component {
  @tracked showing = {};
  @tracked isPNV = false;
  @tracked isSavingDocumentStatus = false;
  @tracked showTicketingWizard = false;
  @tracked hasStarted = false;
  @tracked hasFinished = true;

  @service ajax;
  @service house;
  @service session;
  @service store;
  @service toast;

  constructor() {
    super(...arguments);
    const {person, ticketPackage} = this.args;

    if (person.isAlpha || person.isProspective) {
      // Person is a PNV. Only the WAP section will be shown.
      this.isPNV = true;
    }

    this.hasStarted = !!ticketPackage.started_at;
    this.hasFinished = !!ticketPackage.finished_at;
  }

  /**
   * Find the ticket being used.
   * @returns {null|AccessDocumentModel}
   */

  get ticket() {
    return this.args.ticketPackage.ticket;
  }

  /**
   * Did the user claim a gift ticket?
   *
   * @returns {boolean}
   */

  get claimedGiftTicket() {
    return !!this.args.ticketPackage.giftTickets.find((t) => t.isClaimed);
  }

  /**
   * Common routine to set the Access Document status based on the user's choice.
   * (i.e., bank, claim, release/qualify)
   *
   * @param {AccessDocumentModel} document
   * @param {string} status
   */

  @action
  async setDocumentStatus(document, status, callback = null) {
    this.isSavingDocumentStatus = true;
    try {
      const result = await this.ajax.request(`access-document/statuses`, {
        method: 'PATCH',
        data: {statuses: [{id: document.id, status}]}
      });
      this.house.pushPayload('access-document', result.access_document);
      this.toast.success('Your choice has been successfully saved.');
      const {vehiclePass} = this.args.ticketPackage;
      if (vehiclePass && document.isRegularTicket) {
        // Vehicle Pass may have been released because all tickets were banked.
        await vehiclePass.reload();
      }
      callback?.();
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      this.isSavingDocumentStatus = false
    }
  }

  /**
   * Record the ticketing milestone (started or finished)
   *
   * @param {string} milestone
   * @private
   */
  _updateMilestone(milestone) {
    const id = +this.args.person.id;
    if (this.session.userId === id) {
      this.ajax.request(`person-event/${id}/progress`, {method: 'POST', data: {milestone: `ticket-${milestone}`}})
        .catch((response) => this.house.handleErrorResponse(response));
    }
  }

  /**
   * Begin the ticketing steps.
   */

  @action
  startTicketing() {
    this._updateMilestone('started')
    this.showTicketingWizard = true;
    this.hasStarted = true;
  }

  /**
   * User hit the finished button
   */
  @action
  finishTicketing() {
    this._updateMilestone('finished');
    this.showTicketingWizard = false;
    this.hasFinished = true;
  }

  /**
   * Cancel the ticketing step.
   */
  @action
  cancelTicketing() {
    this.showTicketingWizard = false;
  }
}
