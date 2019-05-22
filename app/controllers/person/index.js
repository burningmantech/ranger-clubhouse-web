import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { Role } from 'clubhouse/constants/roles';
import inGroups from 'clubhouse/utils/in-groups';

const CallsignApprovedOptions = [
  [ 'Approved', true ],
  [ 'Not Approved', false ]
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
  'prospective waitlist',
  'resigned',
  'retired',
  'suspended',
  'uberbonked',
];

const UserAuthorizedOptions = [
  [ 'User Enabled', true ],
  [ 'User Suspended', false ]
];

const OnSiteOptions = [
  [ 'On Site', true ],
  [ 'Off Site', false ],
];

export default class PersonIndexController extends Controller {
  person = null;

  callsignApprovedOptions = CallsignApprovedOptions;
  statusOptions = StatusOptions;
  userAuthorizedOptions = UserAuthorizedOptions;
  onSiteOptions = OnSiteOptions;

  showPositions =  false;
  editPositions = false;

  showRoles = false;
  editRoles = false;

  @computed
  get isAdmin() {
    return this.session.user.hasRole(Role.ADMIN);
  }

  @computed
  get canEditBMIT() {
    return this.session.user.hasRole(Role.EDIT_BMIDS);
  }

  @computed
  get canEditAccessDocs() {
    return this.session.user.hasRole(Role.EDIT_ACCESS_DOCS);
  }

  @computed
  get isAdminTrainerMentorOrVC() {
    return this.session.user.hasRole([ Role.ADMIN, Role.TRAINER, Role.MENTOR, Role.VC ]);
  }

  @computed
  get isAdminMentorOrVC() {
    return this.session.user.hasRole([ Role.ADMIN, Role.MENTOR, Role.VC ]);
  }

  @computed
  get isAdminOrVC() {
    return this.session.user.hasRole([ Role.ADMIN, Role.VC ]);
  }

  @computed
  get isManageAndGrantPosition() {
    const user = this.session.user;
    return user.hasRole(Role.MANAGE) && user.hasRole(Role.GRANT_POSITION);
  }

  @computed('personPositions')
  get positionIds() {
    return this.personPositions.map((position) => position.id);
  }

  @computed('personPositions')
  get positionColumns() {
    return inGroups(this.personPositions, 3);
  }

  @computed('personRoles')
  get roleIds() {
    return this.personRoles.map((role) => role.id);
  }

  @computed('personRoles')
  get roleColumns() {
    return inGroups(this.personRoles, 2);
  }

  _savePersonModel(model) {
    const statusChanged = model._changes['status'];

    model.save().then(() => {
      this.set('showEditMessage', false);
      this.house.scrollToTop();

      this.toast.success('The information was successfully updated.');

      // Reload the current user.
      if (model.get('id') == this.session.user.id) {
        this.session.loadUser();
      }

      // When the status changes, the positions & roles are likely changed.
      // Reload the roles & positions
      if (statusChanged) {
        this.ajax.request(`person/${this.person.id}/positions`)
          .then((results) => this.set('personPositions', results.positions))
          .catch((response) => this.house.handleErrorResponse(response));

        this.ajax.request(`person/${this.person.id}/roles`)
          .then((results) => this.set('personRoles', results.roles))
          .catch((response) => this.house.handleErrorResponse(response));
      }
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  editMessage() {
    this.set('showEditMessage', true);
  }

  @action
  hideMessage() {
    this.set('showEditMessage', false);
  }

  @action
  saveMessage(model) {
    this.toast.clear();
    this._savePersonModel(model);
  }

  @action
  savePersonAction(model, isValid) {
    if (!isValid)
      return;

    this.toast.clear();
    // check to see if callsign has been disapproved..
    // (note: callsign_approved might be a string or boolean)
    if (model._changes['callsign_approved'] && `${model.get('callsign_approved')}` == "false") {
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
    this.set('showPositions', !this.showPositions);
  }

  @action
  editPositionsAction() {
    this.set('editPositions', true);
  }

  @action
  savePositions(model) {
    const positionIds = model.get('positionIds');

    this.toast.clear();
    this.ajax.request(`person/${this.person.id}/positions`, {
      type: 'POST',
      data: { position_ids: positionIds }
    }).then((results) => {
      this.toast.success('The positions have been successfully updated.');
      this.set('personPositions', results.positions);
      this.set('editPositions', false);
    }).catch((response) => { this.house.handleErrorResponse(response) });
  }

  @action
  cancelPositions() {
    this.set('editPositions', false);
  }

  @action
  toggleRoles() {
    this.set('showRoles', !this.showRoles);
  }

  @action
  editRolesAction() {
    this.set('editRoles', true);
  }

  @action
  saveRoles(model) {
    const roleIds = model.get('roleIds');

    this.toast.clear();
    this.ajax.request(`person/${this.person.id}/roles`, {
      type: 'POST',
      data: { role_ids: roleIds }
    }).then((results) => {
      this.toast.success('The roles have been successfully updated.');
      this.set('personRoles', results.roles);
      this.set('editRoles', false);
    }).catch((response) => { this.house.handleErrorResponse(response) });
  }

  @action
  cancelRoles() {
    this.set('editRoles', false);
  }

  @action
  syncPhotoAction() {
    this.set('photo', null);
    this.ajax.request(`person/${this.person.id}/photo`, { data: { sync: 1 }})
          .then((result) => this.set('photo', result.photo))
          .catch(() => {
            this.set('photo', { status: 'error', message: 'There was a server error.'});
          });
  }
}
