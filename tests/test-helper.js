import Application from 'clubhouse/app';
import config from 'clubhouse/config/environment';
import * as QUnit from 'qunit';
import {setApplication} from '@ember/test-helpers';
import {setup} from 'qunit-dom';
import {start} from 'ember-qunit';
import {loadTests} from 'ember-qunit/test-loader';

setApplication(Application.create(config.APP));
setup(QUnit.assert);

// Fail (rather than hang CI forever) if a test leaks a timer or never resolves.
QUnit.config.testTimeout = 60000;

// loadTests() is synchronous in ember-qunit 9; it eagerly requires every
// `*-test` module before start() kicks off the run.
loadTests();

start();
