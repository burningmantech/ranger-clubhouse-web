import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {StatusLabels} from 'clubhouse/models/prospective-application';

export default class VcApplicationsController extends ClubhouseController {
  @tracked searchForm = EmberObject.create({query: ''});
  @tracked isSubmitting = false;
  @tracked noneFound = false;
  @tracked query;
  @tracked results;

  @action
  async searchForStuff(model) {
    const query = model.query.trim();

    if (query.length < 3) {
      return;
    }

    try {
      this.isSubmitting = true;

      const results = await this.ajax.request('prospective-application/search', {data: {query}});

      this.query = query;
      if (results.length) {
        this.results = results;
        this.noneFound = false;
        model.query = '';
      } else {
        this.results = [];
        this.noneFound = true;
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  clearQuery(model) {
    model.query = '';
  }

  @action
  clearResults() {
    this.noneFound = false;
    this.results = [];
  }

  statusLabel(status) {
    return StatusLabels[status] ?? `Bug: ${status}`;
  }
}
