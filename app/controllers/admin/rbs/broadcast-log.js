/*
 * Handle the RBS broadcast log.
 */

import Controller from '@ember/controller';
import { action, set } from '@ember/object';
export default class AdminRbsBroadcastLogController extends Controller {
  queryParams = [ 'year', 'failed' ];

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
    this.set('confirmRetry', log);
  }

  // Try the retry
  @action
  attemptRetry() {
    const broadcast = this.confirmRetry;
    this.set('retryingBroadcast', broadcast);
    this.set('confirmRetry', null);
    this.set('retryResult', null);

    // Okay, server -- go annoy more peoples
    this.ajax.request('rbs/retry', { method: 'POST', data: { broadcast_id: broadcast.id }}).then((result) => {
      this.set('retryResult', result);
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('retryingBroadcast', null));
  }

  // Close out a retry attempt
  @action
  closeRetry() {
    if (this.retryResult) {
      // Did the retry complete? go refresh the list.
      this.send('refreshRoute');
    }
    this.set('confirmRetry', null);
    this.set('retryingBroadcast', null);
    this.set('retryResult', null);
  }
}
