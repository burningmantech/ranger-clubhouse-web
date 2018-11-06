import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,

  didTransition() {
    this._super(...arguments);
    if (!this.get('fastboot.isFastBoot')) {
      window.scrollTo(0,0);
    }
  }
});

Router.map(function() {
  this.route('login');
  this.route('offline');
  this.route('reset-password');
  this.route('me', function() {
    this.route('overview');
    this.route('ranger-info');
    this.route('personal-info');
    this.route('emergency-contact');
    this.route('password');
    this.route('messages');
    this.route('timesheet');
    this.route('schedule');
    this.route('tickets');
    this.route('help');
    this.route('motorpool-policy');
    this.route('alerts');
    this.route('mentees');
    this.route('contact');
  });

  this.route('search', function() {
    this.route('person');
    this.route('assets');
    this.route('languages');
  });
  this.route('admin', function() {
    this.route('positions');
    this.route('slots');
  });
  this.route('handle-checker');

  this.route('person', { path: '/person/:person_id' } ,function() {
    this.route('index', { path: '/' });
    this.route('assets');
    this.route('password');
  });
  this.route('logout');
  this.route('training', { path: '/training/:position_id' }, function() {
    this.route('capacity');
    this.route('multiple-enrollments');
  });
  this.route('debug');
});

export default Router;
