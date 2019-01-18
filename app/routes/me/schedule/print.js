import Route from '@ember/routing/route';
import markSlotsOverlap from 'clubhouse/utils/mark-slots-overlap';

export default class MeSchedulePrintRoute extends Route {
  setupController(controller) {
    const model = this.modelFor('me/schedule');
    controller.setProperties(model);
    controller.set('person', this.modelFor('me'));

    const slots = model.slots.filterBy('person_assigned', true);
    markSlotsOverlap(slots);
    controller.set('scheduleSlots', slots);
    controller.set('overlapping',
      slots.reduce((total, slot) => ((slot.is_overlapping ? 1 : 0)+total), 0)
    );
  }
}
