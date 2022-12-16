import Component from '@glimmer/component';
import {set} from '@ember/object';
import _ from 'lodash';
import {service} from '@ember/service';
import shirtGroupsSort from 'clubhouse/utils/shirt-groups-sort';

const ALPHAS_PER_PAGE = 28;
export default class MentorAlphaAparelSheetComponent extends Component {
  @service house;

  constructor() {
    super(...arguments);

    const people = this.args.slot.people.filter((p) => p.on_alpha_shift);
    // Figure out the mentor status
    const year = this.house.currentYear();

    people.forEach((person) => {
      const mentor = person.mentor_history.find((h) => h.year == year);

      set(person, 'mentor_status', mentor ? mentor.status : 'pending');
    });

    const good = people.filter((p) => (p.mentor_status === 'pass' || p.mentor_status === 'pending'));
    const bonked = people.filter((p) => !(p.mentor_status === 'pass' || p.mentor_status === 'pending'));

    this.shirtGroups = shirtGroupsSort(people);


    this.alphaGroups = [
      {
        title: 'Pass/Pending',
        people: good,
        pages: _.chunk(good, ALPHAS_PER_PAGE)
      },
      {
        title: 'BONKED',
        people: bonked,
        pages: _.chunk(bonked, ALPHAS_PER_PAGE),
      }
    ];
  }
}
