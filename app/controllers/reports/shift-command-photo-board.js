import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';

const REFRESH_INTERVAL = 5 * 60;   // seconds between data refreshes
const ERROR_RETRY_INTERVAL = 30;   // seconds to wait before retrying after a failed load
const SCROLL_INTERVAL = 5;        // seconds each group dwells at the top

export default class ReportsShiftCommandPhotoBoardController extends ClubhouseController {
  @tracked serverTime;
  @tracked groups;
  @tracked hosts;
  @tracked countDown = 0;
  @tracked currentGroupIndex = 0;
  @tracked scrollCountDown = SCROLL_INTERVAL;

  timerId = null;

  setupTimer() {
    this.loadBoard();
    // Store the interval id so destroyTimer() can actually clear it (otherwise it leaks
    // and stacks duplicate fetches on every route re-entry).
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  // Single 1s heartbeat driving both the data refresh and the scroll cadence.
  tick() {
    if (this.countDown > 0) {
      this.countDown -= 1;
    }

    if (this.countDown <= 0) {
      this.loadBoard();
    }

    this.advanceScroll();
  }

  async loadBoard() {
    this.countDown = REFRESH_INTERVAL;
    try {
      const results = await this.ajax.request('slot/shift-command-photo-board');
      this.serverTime = results.now;
      this.groups = results.groups;
      this.hosts = results.hosts;
      // Group counts change every refresh as shifts rotate; clamp the index so it never
      // points past the (possibly shorter) new group set.
      if (!this.groups || this.currentGroupIndex >= this.groups.length) {
        this.currentGroupIndex = 0;
        this.scrollCountDown = SCROLL_INTERVAL;
      }
    } catch (response) {
      // Nobody's at the wall monitor to reload it, so retry soon instead of waiting the
      // full refresh interval after a failed load.
      this.countDown = ERROR_RETRY_INTERVAL;
      this.errors.handleErrorResponse(response);
    }
  }

  advanceScroll() {
    if (!this.groups || this.groups.length <= 1) {
      return;
    }

    if (this.scrollCountDown > 0) {
      this.scrollCountDown -= 1;
      return;
    }

    this.scrollCountDown = SCROLL_INTERVAL;
    this.currentGroupIndex = (this.currentGroupIndex + 1) % this.groups.length;
    this.scrollToCurrentGroup();
  }

  scrollToCurrentGroup() {
    if (this.currentGroupIndex === 0) {
      this.scroll.scrollToTop();
    } else {
      this.scroll.scrollToElement('#scphoto-group-' + this.currentGroupIndex);
    }
  }

  destroyTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
