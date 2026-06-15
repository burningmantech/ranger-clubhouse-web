import Service, {service} from '@ember/service';

/**
 * The command seam: invoke a server action by POST and dispatch on the
 * returned `result.status` to caller-supplied handlers, with a standardized
 * fallback toast for unrecognized statuses.
 *
 * For persisting an Ember Data record or changeset, use the `save-model`
 * service instead. (Generalised from the former `hq-action` service; the
 * record-save idiom it also carried now lives in `save-model`.)
 */
export default class CommandService extends Service {
  @service ajax;
  @service errors;
  @service toast;

  /**
   * POST an action to the API and dispatch on the returned status.
   *
   * @param {string} url the endpoint to POST to
   * @param {object} body the request body (sent as `data`)
   * @param {object} [options]
   * @param {object} [options.statusHandlers] map of `result.status` -> handler(result)
   * @param {function} [options.onSuccess] called with the result after dispatch
   * @param {function} [options.onError] override for error handling; defaults to errors.handleErrorResponse
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
      (onError ?? this.errors.handleErrorResponse.bind(this.errors))(response);
      return undefined;
    }
  }
}
