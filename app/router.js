import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { run } from '@ember/runloop';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,

  init() {
    this._super(...arguments);

    this.on('routeDidChange', () => {
      // Move the window back to the top when heading to a new route
      if (!this.get('fastboot.isFastBoot')) {
        run.schedule('afterRender', () => {
          window.scrollTo(0,0);
        });
      }
    });
  }
});

Router.map(function() {
  this.route('login');
  this.route('offline');
  this.route('reset-password');
  this.route('me', function() {
    this.route('overview', { path: '/' });
    this.route('personal-info');
    this.route('emergency-contact');
    this.route('password');
    this.route('messages');
    this.route('timesheet');
    this.route('schedule', function() {
      this.route('index',  { path: '/' });
    });
    this.route('tickets');
    this.route('help');
    this.route('motorpool-policy');
    this.route('alerts');
    this.route('mentees');
    this.route('contact');
    this.route('timesheet-corrections', function() {
      this.route('review');
      this.route('missing');
      this.route('confirm');
    });
    this.route('event-info');
  });

  this.route('search', function() {
    this.route('assets');
    this.route('languages');
  });
  this.route('admin', function() {
    this.route('action-log');
    this.route('bulk-upload');
    this.route('credits');
    this.route('error-log');
    this.route('event-dates');
    this.route('positions');
    this.route('roles');
    this.route('salesforce');
    this.route('settings');
    this.route('slots');
    this.route('motd');
    this.route('assets');
    this.route('help');
    this.route('radio-eligibility');
    this.route('bulk-sign-in-out');
  });

  this.route('hq', { path: '/hq/:person_id' }, function() {
    this.route('index', { path: '/' });
    this.route('site-checkin');
    this.route('shift');
    this.route('schedule');
    this.route('timesheet');
    this.route('assets');
    this.route('messages');
    this.route('training-info');
  });

  this.route('debug');

  this.route('mentor', function() {
    this.route('mentees');
  });

  this.route('handle-checker');

  this.route('person', { path: '/person/:person_id' } ,function() {
    this.route('index', { path: '/' });
    this.route('assets');
    this.route('password');
    this.route('event-info');
    this.route('personal-info');
    this.route('emergency-contact');
    this.route('timesheet');
    this.route('messages');
    this.route('mentors');
    this.route('schedule');
    this.route('timesheet-log');
    this.route('contact-log');
    this.route('broadcast-log');
    this.route('access-documents');
    this.route('tickets');
    this.route('bmid');
  });

  this.route('logout');

  this.route('training', { path: '/training/:position_id' }, function() {
    this.route('index', { path: '/'});
    this.route('session', { path: '/session/:slot_id'}, function() {
      this.route('index', { path: '/' });
      this.route('signup-sheet');
      this.route('trainers-report');
    });
    this.route('capacity');
    this.route('multiple-enrollments');
    this.route('people-training-completed');
    this.route('untrained-people');
  });


  this.route('reports', function() {
    this.route('timesheet-correction-requests');
    this.route('timesheet-unconfirmed');
    this.route('asset-history');
    this.route('assets-outstanding');
    this.route('radio-assets');
    this.route('radio-checkout');
    this.route('shirts');
    this.route('freaking-years');
    this.route('alpha-shirts');
  });

  this.route('vc', function() {
    this.route('access-documents', function() {
      this.route('index', { path: '/'} );
      this.route('expiring');
      this.route('trs');
    });
    this.route('bmid');
    this.route('bmid-sanity-check');
    this.route('bmid-print');
  });
  this.route('register');

  // Catch all for unrecognized urls
  this.route('not-found', { path: '/*path'} );
});

export default Router;
