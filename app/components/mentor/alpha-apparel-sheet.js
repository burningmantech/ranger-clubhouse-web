import Component from '@ember/component';

import { set } from '@ember/object';

import _ from 'lodash';

const ALPHAS_PER_PAGE = 28;
export default class MentorAlphaAparelSheetComponent extends Component {
    slot = null;

    didReceiveAttrs() {
      super.didReceiveAttrs(...arguments);

      const people = this.slot.people.filter((p) => p.on_alpha_shift);
      // Figure out the mentor status
      const year = this.house.currentYear();

      people.forEach((person) => {
        const mentor = person.mentor_history.find((h) => h.year == year);

        set(person, 'mentor_status', mentor ? mentor.status:  'pending');
      });

      const good = people.filter((p) => (p.mentor_status == 'pass' || p.mentor_status == 'pending') );
      const bonked = people.filter((p) => !(p.mentor_status == 'pass' || p.mentor_status == 'pending') );

      const shortSleeve = _.sortBy(_.map(_.groupBy(good, 'teeshirt_size_style'), (group, type) => {
        return { type, count: group.length }
      }), 'type');

      const longSleeve = _.sortBy(_.map(_.groupBy(good, 'longsleeveshirt_size_style'), (group, type) => {
        return { type, count: group.length }
      }), 'type');

      this.set('shirtGroups', [
        {
          name: 'Tee Shirts',
          exportName: 'tee-shirts',
          types: shortSleeve
        },
        {
          name: 'Long Sleeves',
          exportName: 'long-sleeves',
          types: longSleeve
        }
      ]);


      this.set('alphaGroups', [
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
      ])
    }

}
