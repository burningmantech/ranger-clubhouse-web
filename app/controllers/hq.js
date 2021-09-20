import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class HqController extends ClubhouseController {
  @tracked showAlphaWarning = false;
  @tracked showSignInWarning = false;
  @tracked userIsMentor = false;
  @tracked person;
  @tracked photo;
  @tracked timesheetSummary;
  @tracked expected;
  @tracked showHoursCreditsBreakdown = false;
  @tracked showAppreciationsProgress = false;
  @tracked isLoadingBreakdown = false;


  get allowedCheckIn() {
    const status = this.person.status;

    switch (status) {
      case 'active':
      case 'alpha':
      case 'inactive extension': // might be cheetah
      case 'inactive': // might be cheetah
      case 'non ranger':
      case 'prospective':
      case 'retired': // might be cheetah
        return true;
    }
    return false;
  }


  @action
  closeAlphaWarning() {
    this.showAlphaWarning = false;
  }

  @action
  closeSignInWarning() {
    this.showSignInWarning = false;
  }

  /**
   * How many expected credits the person might earn. (earned credits + scheduled credits)
   *
   * @returns {number}
   */

  get creditsExpected() {
    return this.timesheetSummary.total_credits + this.expected.credits;
  }

  /**
   * How many seconds counted towards appreciations the person might work. (worked seconds + scheduled seconds)
   *
   * @returns {number}
   */

  get countedDurationExpected() {
    return this.timesheetSummary.counted_duration + this.expected.duration;
  }

  /**
   * How many total seconds (counted towards appreciation plus everything else) the person might
   * work.
   * @returns {number}
   */

  get totalDurationExpected() {
    return this.timesheetSummary.total_duration + this.expected.duration;
  }

  /**
   * Toggle the hours & credits breakdown dialog
   */

  @action
  toggleHoursCreditBreakdown() {
    if (!this.showHoursCreditsBreakdown) {
      this.isLoadingBreakdown = true;
      this.ajax.request(`person/${this.person.id}/schedule/expected`)
        .then((result) => {
          this.expected = result;
          this.showHoursCreditsBreakdown = true;
        })
        .catch((response) => this.house.handleErrorResponse(response))
        .finally(() => this.isLoadingBreakdown = false);
    } else {
      this.showHoursCreditsBreakdown = false;
    }
  }

  /**
   * Toggle the hours & credits breakdown dialog
   */

  @action
  toggleAppreciationsProgress() {
    this.showAppreciationsProgress = !this.showAppreciationsProgress;
  }
}
