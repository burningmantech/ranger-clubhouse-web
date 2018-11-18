import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { Role } from 'clubhouse/constants/roles';
import inGroups from 'clubhouse/utils/in-groups';

const CallsignApprovedOptions = [
  [ 'Approved', true ],
  [ 'Rejected', false ]
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
    return this.session.user.hasRole([ Role.ADMIN, Role.TRAINER, Role.VC ]);
  }

  @computed
  get isManageAndGrandPosition() {
    const user = this.session.user;
    return user.hasRole(Role.MANAGE) && user.hasRole(Role.GRANT_POSITION);
  }

  @computed('person.{callsign_approved,status}')
  get canChangeApproval() {
    const person = this.person;
    const status = person.status;

    /*
     * Admins, Mentors, and Volunteer Coordinators can approve and edit
     * callsigns and FKA.  They can also *un*approve callsigns for people
     * who are alphas or prospectives.  But once you become a Ranger
     * it takes someone doing a SQL update :-) to unapprove your call.
     */
    return (this.isAdminMentorOrVC
          && (!person.callsign_approved
             || (status == 'prospective' || status == 'past prospective' || status == 'alpha'))
           );
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

  @action
  savePerson(model, isValid) {
    if (!isValid)
      return;

    model.save().then(() => {
      this.toast.success('The information was successfully updated.');
      // Reload the current user.
      if (model.get('id') == this.session.user_id) {
        this.session.loadUser();
      }
    }).catch((response) => this.house.handleErrorResponse(response));
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
        this.transitionToRoute('search.person');
      }).catch((response) => this.house.handleErrorResponse(response));
    }
  )
  }

  @action
  togglePositions() {
    this.set('showPositions', !this.showPositions);
  }

  @action
  editPositions() {
    this.set('editPositions', true);
  }

  @action
  savePositions(model) {
    const positionIds = model.get('positionIds');

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
  editRoles() {
    this.set('editRoles', true);
  }

  @action
  saveRoles(model) {
    const roleIds = model.get('roleIds');

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
}
