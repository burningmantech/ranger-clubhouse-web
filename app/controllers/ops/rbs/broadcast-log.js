/*
 * Handle the RBS broadcast log.
 */

import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class OpsRbsBroadcastLogController extends ClubhouseController {
  @tracked confirmRetry = null;
  @tracked retryingBroadcast = null;
  @tracked retryResult = null;

  queryParams = ['year', 'failed'];

  // Show the actual message for a broadcast
  @action
  toggleMessage(log) {
    set(log, 'showMessage', !log.showMessage);
  }

  // Show the broadcast recipients
  @action
  toggleRecipients(log) {
    set(log, 'showRecipients', !log.showRecipients);
  }

  // Ask the user to confirm the retry attempt
  @action
  retryAction(log) {
    this.confirmRetry = log;
  }

  // Try the retry
  @action
  attemptRetry() {
    const broadcast = this.confirmRetry;
    this.retryingBroadcast = broadcast;
    this.confirmRetry = null;
    this.retryResult = null;

    // Okay, server -- go annoy more peoples
    this.ajax.request('rbs/retry', {method: 'POST', data: {broadcast_id: broadcast.id}})
      .then((result) => this.retryResult = result)
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.retryingBroadcast = null);
  }

  // Close out a retry attempt
  @action
  closeRetry() {
    if (this.retryResult) {
      // Did the retry complete? go refresh the list.
      this.send('refreshRoute');
    }
    this.retryingBroadcast = null;
    this.confirmRetry = null;
    this.retryResult = null;
  }
}
