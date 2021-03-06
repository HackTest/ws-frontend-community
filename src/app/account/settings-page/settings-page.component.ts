import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {AccountService} from "../../services/api-services/account.service";
import {AuthService} from "../../services/api-services/auth.service";
import {ApiErrorService} from "../../services/api-services/api-error.service";
import {NotificationsService} from "angular2-notifications";
import {Router} from "@angular/router";
import {WsTitleService} from "../../services/ui-services/ws-title.service";
import {WsBreadcrumbsService} from "../../services/ui-services/ws-breadcrumbs.service";

@Component({
  selector: 'ws-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.sass']
})
export class SettingsPageComponent implements OnInit {

  private passwordChangeMet: boolean;
  private changePasswordForm: FormGroup;
  private response: string;
  private success: boolean;
  private submitted: boolean;

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private errorService: ApiErrorService,
    private router: Router,
    private titleService: WsTitleService,
    private breadcrumbsService: WsBreadcrumbsService,
    private changeDetector: ChangeDetectorRef,
    private notifyService: NotificationsService,
  ) {
    this.response = '';
  }

  ngOnInit() {
    this.response = '';
    this.success = true;
    this.submitted = false;
    this.titleService.currentTitle = 'Account Settings';
    this.breadcrumbsService.setBreadcrumbsForAccountSettings();
  }

  private onAllMetChanged(event: boolean): void {
    if (event != this.passwordChangeMet) {
      this.passwordChangeMet = event;
      this.changeDetector.detectChanges();
    } else {
      this.passwordChangeMet = event;
    }
  }

  private onChangePasswordClicked(): void {
    if (this.changePasswordForm.value.newPassword == this.changePasswordForm.value.newPasswordRepeat) {
      this.submitChangePassword();
    } else {
      this.submitted = true;
      this.success = false;
      this.response = 'The new passwords entered do not match.'
    }
  }

  private onChangePasswordEnterPressed(): void {
    if (this.changePasswordEnabled) {
      this.onChangePasswordClicked()
    }
  }

  private onChangePasswordFailure(response: Object): void {
    console.log(response);
    this.success = false;
    this.submitted = true;
    this.response = this.errorService.getFirstError(response).error_message;
  }

  private onChangePasswordSuccess(response: Object): void {
    this.authService.clearAuthToken();
    this.notifyService.success('Your password was changed successfully', 'Please log in with your new password to continue using Web Sight.');
    this.router.navigate(['/greeting/log-in']);
  }

  private submitChangePassword(): void {
    this.accountService.changePassword(
      this.changePasswordForm.value.currentPassword,
      this.changePasswordForm.value.newPassword
    ).subscribe(
      (data) => this.onChangePasswordSuccess(data),
      (err) => this.onChangePasswordFailure(err)
    );
  }

  get changePasswordEnabled(): boolean {
    return this.changePasswordForm.valid && this.passwordChangeMet;
  }

}
