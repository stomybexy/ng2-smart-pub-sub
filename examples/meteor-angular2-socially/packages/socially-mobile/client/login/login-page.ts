
import {Component} from 'angular2/core';

import {Router} from 'angular2/router';

@Component({
  selector: 'login-page',
  templateUrl: '/packages/socially-mobile/client/login/login-page.html'
})
export class LoginPage {
  phoneNumber: string;
  verCode: string;
  phoneStage: boolean = true;

  constructor(private router: Router) {}

  requestVerification() {
    Accounts.requestPhoneVerification(this.phoneNumber);
    this.phoneStage = false;
  }

  verifyPhone() {
    Accounts.verifyPhone(this.phoneNumber, this.verCode, (err) => {
      if (!err) {
        this.router.navigateByUrl('/');
      }
    });
  }
}
