import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { cached, tracked } from '@glimmer/tracking';

export default class MentorConvertController extends ClubhouseController {
  @tracked prospectives;

  @cached
  get personnelFlagCount() {
    return this.prospectives.filter((p) => p.personnel_issue).length;
  }

  // Bulk-convert action handed to <UnifiedFlagging @selectable>. It receives the
  // selected people, POSTs their ids, and resolves to the array of converted ids
  // so the component can flip those rows to "Converted". Selection, the busy
  // overlay, and the converted state all live in the component.
  @action
  async convertAction(people) {
    const ids = people.map((p) => p.id);

    try {
      const { alphas } = await this.ajax.request('mentor/convert-prospectives', {
        method: 'POST',
        data: { prospectives: ids },
      });
      this.toast.success(`${alphas.length} ${alphas.length === 1 ? 'Prospective has' : 'Prospectives have'} been converted to Alpha status`);
      return alphas;
    } catch (response) {
      this.errors.handleErrorResponse(response);
      return [];
    }
  }
}
