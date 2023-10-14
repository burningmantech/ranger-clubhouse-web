import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {action} from '@ember/object';
import ENV from 'clubhouse/config/environment';
import Ember from 'ember';
import {cancel, later} from '@ember/runloop';

const DEFAULT_POLL_INTERVAL_SECONDS = 60*10;

export default class NewVersionNotifyComponent extends Component {
  @tracked  hasNewVersion = false;
  @service ajax;

  laterId = 0;

  constructor() {
    super(...arguments);

    if (Ember.testing || ENV.environment === 'development') {
      // Don't bother with testing or development.
      return;
    }

    const fileName = ENV.newVersion.fileName;
    const baseUrl = (ENV.rootURL || ENV.baseURL || '/');
    this.url = `${baseUrl}${fileName}`;
    this.pollSeconds = ENV.newVersion.pollSeconds || DEFAULT_POLL_INTERVAL_SECONDS;
    this.currentBuildTimestamp = ENV.APP.buildTimestamp;
    this._pollVersionFile();
  }

  willDestroy() {
    super.willDestroy(...arguments);

    if (this.laterId) {
      cancel(this.laterId);
      this.laterId = null;
    }
  }

  _pollVersionFile() {
    if (this.laterId) {
      return;
    }

    this.laterId = later(this, () => {
      this.laterId = null;
      this._checkForNewVersion();
    }, this.pollSeconds * 1000);
  }

  _checkForNewVersion() {
    fetch(this.url + `?_=${Date.now()}`).then(async (response) => {
      if (!response.ok) {
        this._pollVersionFile();
        return;
      }

      const buildstamp = (await response.text()).trim();
      if (this.currentBuildTimestamp !== buildstamp) {
        this.hasNewVersion = true;
      } else {
        this._pollVersionFile();
      }
    }).catch(() => this._pollVersionFile());
  }

  @action
  reload() {
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload(true);
    }
  }
}
