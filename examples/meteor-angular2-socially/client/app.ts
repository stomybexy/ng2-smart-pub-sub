import {Component, View, NgZone, provide} from 'angular2/core';

import {bootstrap} from 'angular2-meteor';

import {ROUTER_PROVIDERS, ROUTER_DIRECTIVES, RouteConfig, APP_BASE_HREF} from 'angular2/router';

import {PartiesList} from 'client/parties-list/parties-list';

import {PartyDetails} from 'client/party-details/party-details';

import 'collections/methods';

import {ANGULAR2_GOOGLE_MAPS_PROVIDERS} from 'ng2-google-maps/core';

import {LoginPage, Login} from 'socially'; 

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

@Component({
    selector: 'app'
})
@View({
    template: '<router-outlet></router-outlet>',
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
    { path: '/', as: 'PartiesList', component: PartiesList },
    { path: '/party/:partyId', as: 'PartyDetails', component: PartyDetails },
    { path: '/login', as: 'LoginPage', component: LoginPage || Login }
])
class Socially {}

bootstrap(Socially, [ROUTER_PROVIDERS, ANGULAR2_GOOGLE_MAPS_PROVIDERS, provide(APP_BASE_HREF, { useValue: '/' })]);
