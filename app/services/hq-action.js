import Service, {service} from '@ember/service';

/**
 * Shared helper service for the HQ shift components.
 *
 * Centralizes two idioms that were previously re-typed across many HQ
 * components:
 *
 *   - POSTing an action to the API, dispatching on the returned `result.status`
 *     to a set of caller-supplied handlers, with a standardized fallback toast
 *     for unrecognized statuses.
 *   - Saving an Ember Data record with automatic rollback + error handling on
 *     failure.
 */
export default class HqActionService extends Service {
  @service ajax;
  @service house;
  @service toast;

  /**
   * POST an action to the API and dispatch on the returned status.
   *
   * @param {string} url the endpoint to POST to
   * @param {object} body the request body (sent as `data`)
   * @param {object} [options]
   * @param {object} [options.statusHandlers] map of `result.status` -> handler(result)
   * @param {function} [options.onSuccess] unused reserved hook (kept for symmetry); see statusHandlers
   * @param {function} [options.onError] override for error handling; defaults to house.handleErrorResponse
   * @returns {Promise<*|undefined>} the parsed result, or undefined on failure
   */
  async perform(url, body, {statusHandlers = {}, onSuccess, onError} = {}) {
    try {
      const result = await this.ajax.request(url, {method: 'POST', data: body});

      const handler = statusHandlers[result.status];
      if (handler) {
        handler(result);
      } else {
        this.toast.error(`Unknown status '${result.status}' returned — please report to the Tech Ninjas.`);
      }

      onSuccess?.(result);
      return result;
    } catch (response) {
      (onError ?? this.house.handleErrorResponse.bind(this.house))(response);
      return undefined;
    }
  }

  /**
   * Save an Ember Data record, rolling back its attributes and reporting the
   * error if the save fails.
   *
   * @param {Model} record the record to save
   * @param {object} [options]
   * @param {string} [options.successMessage] toast shown on a successful save
   * @param {function} [options.onSuccess] called with the record after a successful save
   * @returns {Promise<boolean>} true on success, false on failure
   */
  async saveWithRollback(record, {successMessage, onSuccess} = {}) {
    try {
      await record.save();
      if (successMessage) {
        this.toast.success(successMessage);
      }
      await onSuccess?.(record);
      return true;
    } catch (response) {
      record.rollbackAttributes();
      this.house.handleErrorResponse(response);
      return false;
    }
  }
}
