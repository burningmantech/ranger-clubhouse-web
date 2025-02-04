import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {VOLUNTEER_COORDINATOR} from "clubhouse/constants/positions";
import {NotFoundError} from '@ember-data/adapter/error';
import {schedule, later} from '@ember/runloop';

export default class VcApplicationsRecordRoute extends ClubhouseRoute {
  async model({application_id}) {
    try {
      const application = await this.store.queryRecord('prospective-application', {application_id});
      return {
        application,
        related: (await this.ajax.request(`prospective-application/${application.id}/related`)).applications,
        VCs: (await this.ajax.request(`position/${VOLUNTEER_COORDINATOR}/grants`)).people,
      };
    } catch (response) {
      if (response.status === 404 || response instanceof NotFoundError) {
        this.toast.error('Application not found.');
        this.router.transitionTo('vc.applications.index');
      } else {
        throw response;
      }
    }
  }

  setupController(controller, {application, related, VCs}) {
    controller.application = application;
    controller.relatedApplications = related;
    controller.VCs = VCs;

    /*
    if (application.isProcessingCallsign) {
      controller.initialTabId = 'handles';
    } else if ((application.isStatusApproved && application.hasPersonalInfoIssues) || application.isStatusHoldPiiIssues) {
      controller.initialTabId = 'personal-info';
    } else {
      controller.initialTabId = 'details';
    }

     */
    let id;
    if (application.isProcessingCallsign) {
      id = 'handles';
    } else if ((application.isStatusApproved && application.hasPersonalInfoIssues) || application.isStatusHoldPiiIssues) {
      id = 'personal-info';
    } else {
      id = 'details';
    }

    if (id) {
      later(() => schedule('afterRender', () => {
        this.house.scrollToElement(`#${id}`)
      }), 100);
    }
  }
}
