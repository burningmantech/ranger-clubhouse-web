import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';

export default class UnifiedFlaggingBonk extends Component {
  @cached
  get bonkedYears() {
    const person = this.args.person;
    const bonks = [];

    if (!person.pnv_history) {
      return bonks;
    }

    for (const year of Object.keys(person.pnv_history)) {
      const event = person.pnv_history[year];

      if (event.mentor_status === 'bonk' || event.mentor_status === 'self-bonk') {
        bonks.push({ year, status: event.mentor_status });
      }
    }

    bonks.sort((a,b) => b.year - a.year);
    return bonks;
  }
}
