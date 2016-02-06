
import {Component, View} from 'angular2/core';

import {MeteorComponent} from 'angular2-meteor';

import {AccountsUI} from 'meteor-accounts-ui';

@Component({
  selector: 'login',
  templateUrl: '/packages/socially-browser/client/login/login.html',
  directives: [AccountsUI]
})
export class Login {}
