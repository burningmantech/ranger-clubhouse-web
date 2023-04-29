import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {Role} from 'clubhouse/constants/roles';
import {tracked} from '@glimmer/tracking';
import {
  INACTIVE,
  INACTIVE_EXTENSION,
  DECEASED,
  ACTIVE,
  RETIRED,
  RESIGNED,
  DISMISSED, ALPHA
} from 'clubhouse/constants/person_status';
import {htmlSafe} from '@ember/template';

export default class PersonIndexController extends ClubhouseController {

  callsignApprovedOptions = [
    ['Approved', true],
    ['Not Approved', false]
  ];

  statusOptions = [
    'active',
    'alpha',
    'auditor',
    'bonked',
    'deceased',
    'dismissed',
    'inactive extension',
    'inactive',
    'non ranger',
    'past prospective',
    'prospective',
    'resigned',
    'retired',
    'suspended',
    'uberbonked',
  ];


  onSiteOptions = [
    ['On Site', true],
    ['Off Site', false],
  ];


  @tracked person = null;
  @tracked teams;

  @tracked personMembership;

  @tracked showMembership = false;

  @tracked grantedRoles = null;
  @tracked showRoles = false;
  @tracked editRoles = false;
  @tracked isSavingRoles = false;

  @tracked personTeams = null;

  @tracked showConfirmNoteOrMessage = false;
  @tracked showEditNote = false;
  @tracked personNote = null;

  @tracked isSaving = false;

  @tracked showUploadDialog = false;

  @tracked photo = null;

  @tracked showPasswordDialog = false;

  @tracked isLoading = false;

  // Work History Tab
  @tracked workTimesheet;

  get isAdmin() {
    return this.session.isAdmin;
  }

  get isPhotoManager() {
    return this.session.hasRole([Role.ADMIN, Role.VC]);
  }

  get canEditBMIT() {
    return this.session.hasRole(Role.EDIT_BMIDS);
  }

  get canEditAccessDocs() {
    return this.session.hasRole(Role.EDIT_ACCESS_DOCS);
  }

  get isAdminTrainerMentorOrVC() {
    return this.session.hasRole([Role.ADMIN, Role.TRAINER, Role.MENTOR, Role.VC]);
  }

  get isAdminMentorOrVC() {
    return this.session.hasRole([Role.ADMIN, Role.MENTOR, Role.VC]);
  }

  get isAdminOrVC() {
    return this.session.hasRole([Role.ADMIN, Role.VC]);
  }

  get canEditMembership() {
    return this.session.isAdmin || !!this.teams.find((t) => t.can_manage);
  }

  async _savePersonModel(model) {
    const statusChanged = model._changes['status'];

    this.isSaing = true;
    try {
      await model.save()
      this.showEditNote = false;
      this.house.scrollToTop();
      this.toast.success('The information was successfully updated.');

      // When the status changes, the positions & roles are likely changed.
      // Reload the roles & positions
      if (statusChanged) {
        return this._reloadMembershipAndRoles();
      } else {
        this._reloadUserIfMe();
      }
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    } finally {
      this.iSaving = false
    }
  }

  @action
  confirmNoteOrMessage() {
    this.showConfirmNoteOrMessage = true;
  }

  @action
  sendClubhouseMessage() {
    this.router.transitionTo('person.messages', this.person.id);
  }

  @action
  editNote() {
    this.showConfirmNoteOrMessage = false;
    this.showEditNote = true;
    this.personNote = {message: this.person.message};
  }

  @action
  closeNote() {
    this.showEditNote = false;
  }

  @action
  closeConfirmNoteOrMessage() {
    this.showConfirmNoteOrMessage = false;
  }

  @action
  saveNote() {
    this.toast.clear();
    this.person.message = this.personNote.message;
    this.person.save().then(() => {
      this.toast.success('Note update');
      this.showEditNote = false;
      this.showConfirmNoteOrMessage = false;
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  savePersonAction(model, isValid) {
    if (!isValid)
      return;

    if (model._changes['status']) {
      const {status} = model;
      const oldStatus = this.person.status;
      if (status === ACTIVE) {
        let walkCC = '';
        switch (oldStatus) {
          case ALPHA:
            this.modal.confirm('Confirm Active Ranger Conversion',
              '<p>You about to manually convert an Alpha to an Active Ranger. Normally this is done through the Mentor Interfaces.</p> Are you sure you want to do this?',
              () => this._savePersonModel(model));
            return;

          case RESIGNED:
          case RETIRED:
          case INACTIVE_EXTENSION:
            walkCC = '<li>Walk and PASS a Cheetah Cub shift</li>';
          // eslint-disable-next-line no-fallthrough
          case INACTIVE:
            this.modal.confirm('Confirm updating status to active',
              htmlSafe(
                'The person must have met the following criteria before being the active status is restored:' +
                `<ul class="mt-2">${walkCC}<li>Worked at least one shift during the current event.</li></ul>` +
                '<p>Normally, the status is updated by <b class="text-danger">Council post-event</b> through the People By Status Change admin interface. See the Ranger Status Policy document for more information.</p>' +
                `Are you absolutely sure you want to update the status to ${status}?`),
              () => this._savePersonModel(model));
            return;
        }
      } else {
        switch (status) {
          case DECEASED:
          case DISMISSED:
            this.modal.confirm('Confirm Destructive Status Update',
              `You are about to update the account status to <b class="text-danger">${status}</b>. The person will be removed from all teams &amp positions, and all permissions revoked. Are you sure you want to do this?`,
              () => this._savePersonModel(model));
            return;
        }
      }
    }

    // check to see if callsign has been disapproved..
    // (note: callsign_approved might be a string or boolean)
    if (model._changes['callsign_approved'] && `${model.callsign_approved}` === "false") {
      // Person is disapproving callsign, confirm that action.
      this.modal.confirm(
        'Confirm Action',
        'You are about to disapprove a previously approved callsign. Are you sure you want to do that?',
        () => this._savePersonModel(model),
        () => this.toast.warning('The record has not been saved.')
      );
    } else {
      this._savePersonModel(model);
    }
  }

  @action
  removePersonAction() {
    this.modal.confirm('Confirm Person Removal',
      'Removing a person is permanent and cannot be ' +
      'undone. All of the information associated with the person will ' +
      'also be removed. This will only happen if you confirm that you ' +
      'want to remove this person.  If you do not confirm, the ' +
      'person will not be removed.',
      () => {
        this.person.destroyRecord().then(() => {
          this.toast.success('The person was successfully removed from the Clubhouse.');
          this.router.transitionTo('me.homepage');
        }).catch((response) => this.house.handleErrorResponse(response));
      }
    )
  }

  @action
  toggleMembership() {
    this.showMembership = !this.showMembership;
  }


  async _reloadMembershipAndRoles() {
    const personId = this.person.id;
    this._reloadUserIfMe();

    try {
      const {membership} = await this.ajax.request(`person/${personId}/membership`);
      this.personMembership = membership;
      this.grantedRoles = await this.ajax.request(`person/${personId}/roles`, {data: {include_memberships: 1}});
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  /**
   * Toggle showing the roles. The reason this is here instead of the <Person::Roles /> component is
   * because it is desired behavior to show the roles across multiple person views. The showRoles variable
   * is not reset between page vies.
   */

  @action
  toggleRoles() {
    this.showRoles = !this.showRoles;
  }

  @action
  editRolesAction() {
    this.editRoles = true;
  }

  @action
  saveRoles(roles) {
    const role_ids = roles.filter((r) => r.selected).map((r) => r.id);

    this.isSavingRoles = true;
    this.ajax.request(`person/${this.person.id}/roles`, {
      type: 'POST',
      data: {role_ids}
    }).then(() => {
      this.toast.success('The roles have been successfully updated.');
      this.editRoles = false;
      this._reloadUserIfMe();
      return this.ajax.request(`person/${this.person.id}/roles`, {data: {include_memberships: 1}})
        .then((results) => this.grantedRoles = results)
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSavingRoles = false);
  }

  _reloadUserIfMe() {
    if (this.session.userId === +this.person.id) {
      // Reload the user.
      this.session.loadUser();
    }
  }

  @action
  cancelRoles() {
    this.editRoles = false;
  }


  @action
  refreshPhoto() {
    this.ajax.request(`person/${this.person.id}/photo`).then((result) => {
      this.photo = result.photo;
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  showUploadDialogAction() {
    this.showUploadDialog = true;
  }

  @action
  closeUploadDialogAction() {
    this.showUploadDialog = false;
  }

  @action
  sendWelcomeMailAction() {
    this.modal.confirm('Resend Welcome Mail', 'Are you sure you want to resend the PNV Welcome Mail?', () => {
      this.ajax.request(`intake/${this.person.id}/send-welcome-email`, {method: 'POST'})
        .then(() => {
          this.toast.success('Welcome Mail successfully queued to be sent.');
        }).catch((response) => {
        if (response.status === 400) {
          this.toast.error('Person is not a prospective');
        } else {
          this.house.handleErrorResponse(response);
        }
      })
    })
  }

  @action
  showPasswordDialogAction() {
    this.showPasswordDialog = true;
  }

  @action
  closePasswordDialogAction() {
    this.showPasswordDialog = false;
  }
}
