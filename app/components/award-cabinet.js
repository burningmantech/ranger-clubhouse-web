import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking'
import _ from 'lodash';
import {TypeSortOrder, TypeLabels} from 'clubhouse/models/award';

export default class AwardCabinetComponent extends Component {
  @cached
  get awardTypes() {
    const types = _.map(_.groupBy(this.args.personAwards, (a) => a.award.type), (awards, type) => ({
        type,
        label: TypeLabels[type] ?? `Other ${type}`,
        awards
      })
    );

    types.sort((a, b) => ((TypeSortOrder[a.type] ?? 99) - (TypeSortOrder[b.type] ?? 99)));

    return types;
  }
}
