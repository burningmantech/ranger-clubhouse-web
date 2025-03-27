import Application from 'clubhouse/app';
import config from 'clubhouse/config/environment';
import * as QUnit from 'qunit';
import {setApplication} from '@ember/test-helpers';
import {setup} from 'qunit-dom';
import {start} from 'ember-qunit';
import {loadTests} from 'ember-qunit/test-loader';

setApplication(Application.create(config.APP));
setup(QUnit.assert);
loadTests()

start();
