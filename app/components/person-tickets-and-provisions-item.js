import Component from '@glimmer/component';

export default class PersonTicketsAndProvisionsItemComponent extends Component {
  get workedOrEarned() {
    return this.args.item?.measure === 'credits' ? 'earned' : 'worked';
  }

  get workOrEarn() {
    return this.args.item?.measure === 'credits' ? 'earn' : 'work';
  }
}
