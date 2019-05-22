import Component from '@ember/component';
import { computed} from '@ember/object';
import { argument } from '@ember-decorators/argument';
import _ from 'lodash';

const ALPHAS_PER_PAGE = 30;
export default class MentorAlphaAparelSheetComponent extends Component {
    @argument('object') slot;

    didReceiveAttrs() {
      super.didReceiveAttrs(...arguments);

      const people = this.slot.people;

      const shortSleeve = _.sortBy(_.map(_.groupBy(people, 'teeshirt_size_style'), (group, type) => {
        return { type, count: group.length }
      }), 'type');

      const longSleeve = _.sortBy(_.map(_.groupBy(people, 'longsleeveshirt_size_style'), (group, type) => {
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

      // Figure out the mentor status
      const year = this.house.currentYear();

      people.forEach((person) => {
        const mentor = person.mentor_history.find((h) => h.year == year);

        person.mentor_status = mentor ? mentor.status:  'pending';
      });
    }

    @computed('slot')
    get alphaPages() {
      return _.chunk(this.slot.people, ALPHAS_PER_PAGE);
    }
}
