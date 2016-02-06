
import {Component} from 'angular2/core';

import {ROUTER_DIRECTIVES} from 'angular2/router';

import {MeteorComponent} from 'angular2-meteor';

export * from './login-page';

@Component({
  selector: 'login',
  templateUrl: '/packages/socially-mobile/client/login/login.html',
  directives: [ROUTER_DIRECTIVES]
})
export class Login {}
