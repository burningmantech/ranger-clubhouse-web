import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class PodSortControlsComponent extends Component {
  @tracked isSubmitting = false;

  @service ajax;
  @service house;

  @action
  async movePerson(direction) {
    const {pod,person} = this.args;

    this.isSubmitting = true;
    const idx = pod.people.findIndex((p) => p.id === person.id);
    let people = pod.people.filter((p) => p.id !== person.id);

    if (direction < 0) {
      if (idx === 1) {
        people.unshift(person);
      } else if (idx > 0) {
        people.splice(idx - 1, 0, person);
      }
    } else {
      if (idx < (people.length - 1)) {
        people.splice(idx + 1, 0, person);
      } else {
        people.push(person);
      }
    }

    for (let i = 0; i < people.length; i++) {
      const sortIdx = i + 1;
      const p = people[i];
      if (p.sort_index !== sortIdx) {
        p.sort_index = sortIdx;
        try {
          await this.ajax.request(`pod/${pod.id}/person`, {
            method: 'PATCH',
            data: {person_id: p.id, sort_index: p.sort_index}
          });
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      }
    }

    try {
      await pod.reload();
    } catch (response) {
      this.house.handleErrorResponse(response);
    }

    this.isSubmitting = false;
  }

  get isNotLast() {
    return this.args.index < (this.args.pod.people.length - 1);
  }
}
