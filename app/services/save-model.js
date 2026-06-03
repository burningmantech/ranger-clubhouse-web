import Service, {service} from '@ember/service';

/**
 * Shared helper service for saving an Ember Data record with a centralized
 * double-submit guard and standardized success/error handling.
 *
 * Centralizes the save idiom that was previously re-typed across controllers
 * and components: flipping an `isSubmitting` guard, clearing toasts, saving the
 * record, reporting success, and rolling back attributes on failure.
 */
export default class SaveModelService extends Service {
  @service house;
  @service toast;

  /**
   * Save an Ember Data record, guarding against concurrent saves.
   *
   * @param {object} options
   * @param {Model} options.model the Ember Data record to save
   * @param {string} [options.message] success toast message; shown only on success
   * @param {object} options.owner the controller/component exposing a tracked
   *   `isSubmitting` field, used as the double-submit guard
   * @returns {Promise<boolean>} true on success, false on failure OR if a save
   *   is already in flight
   */
  async save({model, message, owner}) {
    if (owner.isSubmitting) {
      return false;
    }

    owner.isSubmitting = true;
    this.toast.clear();
    try {
      await model.save();
      if (message) {
        this.toast.success(message);
      }
      return true;
    } catch (response) {
      this.house.handleErrorResponse(response);
      model.rollbackAttributes();
      return false;
    } finally {
      owner.isSubmitting = false;
    }
  }
}
