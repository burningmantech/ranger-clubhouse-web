import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class BookmarkController extends ClubhouseController {
  @tracked isLoading = false;
  @tracked haveError = null;
  @tracked notFound = false;
  @tracked content = null;
  @tracked updatedAt;

  @tracked countdown;

  @tracked now;

  refreshTime = 0;

  async loadDocument() {
    this.isLoading = true;
    this.haveError = null;
    try {
      const {content, updated_at, refresh_time} = await this.ajax.request(`bookmark/${this.bookmarkId}`);
      this.content = content;
      this.updatedAt = updated_at;
      this.refreshTime = refresh_time * 60;
      this.countdown = refresh_time * 60;
    } catch (e) {
      this.haveError = e.message;
      if (e.status !== 404) {
        this.refreshTime = 1;
      }
    } finally {
      this.isLoading = false;
    }
  }

  setupTick() {
    this.timeoutId = setInterval(() => this.tick(), 1000);
  }

  cancelTick() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  tick() {
    this.now = new Date();
    if (this.refreshTime > 0) {
      this.refreshTime--;
      this.countdown = this.refreshTime;
      if (!this.refreshTime) {
        this.loadDocument();
      }
    }
  }

  @action
  formatTimeLeft() {
    const duration = this.countdown;
    let minutes = Math.floor(duration / 60);
    let seconds = Math.floor(duration % 60);

    if (minutes) {
      minutes = Math.floor((duration + 59) / 60);
      return `${minutes} minute${minutes !== 1 ? 's' :''}`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' :''}`;
    }
  }
}
