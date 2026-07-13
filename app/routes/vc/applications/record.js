import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {VOLUNTEER_COORDINATOR} from "clubhouse/constants/positions";
import {NotFoundError} from '@ember-data/adapter/error';
import {schedule, later} from '@ember/runloop';

export default class VcApplicationsRecordRoute extends ClubhouseRoute {
  async model({application_id}) {
    try {
      const application = await this.store.queryRecord('prospective-application', {application_id});
      const [related, VCs] = await Promise.all([
        this.ajax.request(`prospective-application/${application.id}/related`),
        this.ajax.request(`position/${VOLUNTEER_COORDINATOR}/grants`),
      ]);
      return {
        application,
        related: related.applications,
        VCs: VCs.people,
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

    let id;
    if (application.isProcessingCallsign) {
      id = 'handles';
    } else if ((application.isStatusApproved && application.hasPersonalInfoIssues) || application.isStatusHoldPiiIssues) {
      id = 'section-personal-info';
    } else {
      id = 'section-details';
    }

    if (id) {
      later(() => schedule('afterRender', () => {
        this.scroll.scrollToElement(`#${id}`)
      }), 100);
    }
  }

  resetController(controller) {
    controller.showSendEmailDialog = false;
    controller.showAssignDialog = false;
    controller.showStatusDialog = false;
    controller.showStatusWithMessageDialog = false;
    controller.newStatus = null;
    controller.askForMessage = null;
    controller.isSubmitting = false;
  }
}
