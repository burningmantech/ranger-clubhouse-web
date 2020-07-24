import Controller from '@ember/controller';
import { action } from '@ember/object';
import { Role } from 'clubhouse/constants/roles';
import inGroups from 'clubhouse/utils/in-groups';
import { tracked } from '@glimmer/tracking';

const CallsignApprovedOptions = [
  ['Approved', true],
  ['Not Approved', false]
];

const StatusOptions = [
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

const UserAuthorizedOptions = [
  ['User Enabled', true],
  ['User Suspended', false]
];

const OnSiteOptions = [
  ['On Site', true],
  ['Off Site', false],
];

export default class PersonIndexController extends Controller {
  person = null;

  callsignApprovedOptions = CallsignApprovedOptions;
  statusOptions = StatusOptions;
  userAuthorizedOptions = UserAuthorizedOptions;
  onSiteOptions = OnSiteOptions;

  @tracked personPositions;
  @tracked showPositions = false;
  @tracked editPositions = false;

  @tracked personRoles = null;
  @tracked showRoles = false;
  @tracked editRoles = false;
  @tracked isSavingRoles = false;

  @tracked showConfirmNoteOrMessage = false;
  @tracked showEditNote = false;
  @tracked personNote = null;

  @tracked isSaving = false;

  @tracked showUploadDialog = false;

  @tracked photo = null;

  get isAdmin() {
    return this.session.user.hasRole(Role.ADMIN);
  }

  get isPhotoManager() {
    return this.session.user.hasRole([Role.ADMIN, Role.VC]);
  }

  get canEditBMIT() {
    return this.session.user.hasRole(Role.EDIT_BMIDS);
  }

  get canEditAccessDocs() {
    return this.session.user.hasRole(Role.EDIT_ACCESS_DOCS);
  }

  get isAdminTrainerMentorOrVC() {
    return this.session.user.hasRole([Role.ADMIN, Role.TRAINER, Role.MENTOR, Role.VC]);
  }

  get isAdminMentorOrVC() {
    return this.session.user.hasRole([Role.ADMIN, Role.MENTOR, Role.VC]);
  }

  get isAdminOrVC() {
    return this.session.user.hasRole([Role.ADMIN, Role.VC]);
  }

  get isManageAndGrantPosition() {
    const user = this.session.user;
    return user.hasRole(Role.MANAGE) && user.hasRole(Role.GRANT_POSITION);
  }

  get positionIds() {
    return this.personPositions.map((position) => position.id);
  }

  get positionColumns() {
    return inGroups(this.personPositions, 3);
  }

  get roleIds() {
    return this.personRoles.map((role) => role.id);
  }

  get roleColumns() {
    return inGroups(this.personRoles, 2);
  }

  _savePersonModel(model) {
    const statusChanged = model._changes['status'];

    this.isSaing = true;
    model.save().then(() => {
      this.showEditNote = false;
      this.house.scrollToTop();
      this.toast.success('The information was successfully updated.');

      // Reload the current user.
      if (model.id == this.session.userId) {
        this.session.loadUser();
      }

      // When the status changes, the positions & roles are likely changed.
      // Reload the roles & positions
      if (statusChanged) {
        this.ajax.request(`person/${this.person.id}/positions`)
          .then((results) => this.personPositions = results.positions)
          .catch((response) => this.house.handleErrorResponse(response));

        this.ajax.request(`person/${this.person.id}/roles`)
          .then((results) => this.personRoles = results.roles)
          .catch((response) => this.house.handleErrorResponse(response));
      }
    }).catch((response) => this.house.handleErrorResponse(response, model))
      .finally(() => this.iSaving = false );
  }

  @action
  confirmNoteOrMessage() {
    this.showConfirmNoteOrMessage = true;
  }

  @action
  sendClubhouseMessage() {
    this.transitionToRoute('person.messages', this.person.id);
  }

  @action
  editNote() {
    this.showConfirmNoteOrMessage = false;
    this.showEditNote = true;
    this.personNote = { message: this.person.message };
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
      this.showConfirmNoteOrMessage =false;
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  savePersonAction(model, isValid) {
    if (!isValid)
      return;

    this.toast.clear();
    // check to see if callsign has been disapproved..
    // (note: callsign_approved might be a string or boolean)
    if (model._changes['callsign_approved'] && `${model.callsign_approved}` == "false") {
      // Person is disapproving callsign, confirm that action.

      this.modal.confirm(
        'Confirm Action',
        'You are about to disapprove a previously approved callsign. Are you sure you want to do that?',
        () => { this._savePersonModel(model); },
        () => { this.toast.warning('The record has not been saved.'); }
      );
    } else {
      this._savePersonModel(model);
    }
  }

  @action
  removePerson() {
    this.modal.confirm('Confirm Person Removal',
      'Removing a person is permanent and cannot be ' +
      'undone. All of the information associated with the person will ' +
      'also be removed. This will only happen if you confirm that you ' +
      'want to remove this person.  If you do not confirm, the ' +
      'person will not be removed.',
      () => {
        this.person.destroyRecord().then(() => {
          this.toast.success('The person was successfully removed from the Clubhouse.');
          this.transitionToRoute('me.overview');
        }).catch((response) => this.house.handleErrorResponse(response));
      }
    )
  }

  @action
  togglePositions() {
    this.showPositions = !this.showPositions;
  }

  @action
  editPositionsAction() {
    this.editPositions = true;
  }

  @action
  savePositions(model) {
    const positionIds = model.positionIds;

    this.toast.clear();
    this.ajax.request(`person/${this.person.id}/positions`, {
      type: 'POST',
      data: { position_ids: positionIds }
    }).then((results) => {
      this.toast.success('The positions have been successfully updated.');
      this.personPositions = results.positions;
      this.editPositions = false;
      if (this.session.userId == this.person.id) {
        // Reload the user.
        this.session.loadUser();
      }
    }).catch((response) => { this.house.handleErrorResponse(response) });
  }

  @action
  cancelPositions() {
    this.editPositions =  false;
  }

  @action
  toggleRoles() {
    this.showRoles = !this.showRoles;
  }

  @action
  editRolesAction() {
    this.editRoles = true;
  }

  @action
  saveRoles(model) {
    const roleIds = model.roleIds;

    this.isSavingRoles = true;
    this.ajax.request(`person/${this.person.id}/roles`, {
      type: 'POST',
      data: { role_ids: roleIds }
    }).then((results) => {
      this.toast.success('The roles have been successfully updated.');
      this.personRoles = results.roles;
      this.editRoles = false;
      if (this.session.userId == this.person.id) {
        // Reload the user.
        this.session.loadUser();
      }
    }).catch((response) => { this.house.handleErrorResponse(response) })
      .finally(() => this.isSavingRoles = false);
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

}
