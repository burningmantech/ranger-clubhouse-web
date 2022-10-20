import Component from '@glimmer/component';

export default class DashboardArtsComponent extends Component {
  get arts() {
    return this.args.step.arts.map((a) => {
      const art = {...a};
      art.requiredTitles = a.required_by.map((r, idx) => {
        if (a.required_by.length > 1 && idx < a.required_by.length - 1) {
          return `${r.title},`;
        } else {
          return r.title;
        }
      });

      return art;
    });
  }
}
