import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {TYPE_SPECIAL, TYPE_POSITION, TYPE_TEAM, REBUILD_INFO} from "clubhouse/models/person-award";

export default class PersonAwardsController extends ClubhouseController {
  @tracked person;
  @tracked awards;
  @tracked personAwards;
  @tracked entry;
  @tracked entryType;

  @cached
  get awardOptions() {
    return this.awards.map((a) => [a.title, a.id]);
  }

  @cached
  get teamOptions() {
    return this._buildOptions(this.teams);
  }

  @cached
  get positionOptions() {
    return this._buildOptions(this.positions);
  }

  _buildOptions(rows) {
    return rows.map((a) => [a.active ? a.title : `${a.title} (inactive)`, a.id]);
  }

  @cached
  get teamAwards() {
    return this.personAwards.filter((a) => a.type === TYPE_TEAM);
  }

  @cached
  get positionAwards() {
    return this.personAwards.filter((a) => a.type === TYPE_POSITION);
  }

  @cached
  get specialAwards() {
    return this.personAwards.filter((a) => a.type === TYPE_SPECIAL);
  }

  @cached
  get yearOptions() {
    const currentYear = this.house.currentYear();
    const years = [];
    for (let year = currentYear; year >= 1996; year--) {
      years.push(year);
    }

    return years;
  }

  @action
  newTeamAward() {
    if (!this.teams.length) {
      this._noneAvailable('teams');
      return;
    }

    this._setupAward(TYPE_TEAM);
  }

  @action
  newSpecialAward() {
    if (!this.awards.length) {
      this._noneAvailable('special service');
      return;
    }

    this._setupAward(TYPE_SPECIAL);
  }

  @action
  newPositionAward() {
    if (!this.positions.length) {
      this._noneAvailable('positions');
      return;
    }

    this._setupAward(TYPE_POSITION);
  }

  _noneAvailable(thing) {
    this.modal.info(`No ${thing} awards available`, `Sorry, there are no ${thing} awards available.`);
  }

  @action
  editAward(award) {
    this.entry = award;
    this.entryType = award.type;
  }

  @action
  closeAward() {
    this.entry = null;
  }

  @action
  async saveAward(model, isValid) {
    if (!isValid) {
      return;
    }

    this.isSubmitting = true;
    try {
      await model.save();
      this.toast.success('Award successfully saved.');
      await this.personAwards.update();
      await this.person.reload();
      this.entry = null;
    } catch (e) {
      this.house.handleErrorResponse(e);
    } finally {
      this.isSubmitting = false;
    }
  }

  _setupAward(type) {
    this.entry = this.store.createRecord('person-award', {
      person_id: this.person.id,
      year: this.house.currentYear,
    });

    this.entryType = type;
  }

  @action
  deleteAward() {
    this.modal.confirm('Delete Award', `This operation cannot be undone. Are you sure you wish to delete this award?`,
      async () => {
        try {
          this.isSubmitting = true;
          await this.entry.destroyRecord();
          this.toast.success('The award has been deleted.');
          this.entry = null;
          await this.personAwards.update();
          await this.person.reload();
        } catch (e) {
          this.house.handleErrorResponse(e);
        } finally {
          this.isSubmitting = false;
        }
      });
  }

  @action
  rebuildAwards() {
    this.modal.confirm('Rebuild Awards', REBUILD_INFO,
      async () => {
        try {
          this.isSubmitting = true;
          await this.ajax.post(`person-award/person/${this.person.id}/rebuild`);
          await this.personAwards.update();
          await this.person.reload();
          this.toast.success('Award rebuild was successfully.');
        } catch (e) {
          this.house.handleErrorResponse(e);
        } finally {
          this.isSubmitting = false;
        }
      });
  }
}
