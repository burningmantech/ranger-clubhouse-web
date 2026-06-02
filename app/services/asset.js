import Service from '@ember/service';
import { service } from '@ember/service';

/**
 * Centralized asset operations so check-in transport, the success toast,
 * and error handling live in exactly one place (previously duplicated in
 * asset-table.js and modal-asset-history.js, which had drifted).
 */
export default class AssetService extends Service {
  @service ajax;
  @service house;
  @service toast;

  /**
   * Check an asset in. Resolves with the server result on success so callers
   * can apply `checked_in` / `check_in_person` to their row. On failure the
   * error is routed through house.handleErrorResponse and the promise rejects
   * so callers can clear any submitting flag in a .finally().
   *
   * @param {number|string} assetId
   * @returns {Promise<object>} the server response
   */
  async checkin(assetId) {
    try {
      const result = await this.ajax.request(`asset/${assetId}/checkin`, { method: 'POST' });
      this.toast.success('Asset has been successfully checked in.');
      return result;
    } catch (response) {
      this.house.handleErrorResponse(response);
      throw response;
    }
  }
}
