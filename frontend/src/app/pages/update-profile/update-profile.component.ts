import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss'],
})
export class UpdateProfileComponent implements OnInit {
  errorForAge: boolean = false;
  errorMessageForAge = '';
  errorForUsername: boolean = false;
  errorMessageForUsername: string = '';

  profileForm: FormGroup;
  passwordForm: FormGroup;

  isLoadingUpdateProfile: boolean = false;
  isLoadingChangePassword: boolean = false;
  isLoadingInitial: boolean = true;

  email: string = '';
  displayValue: string = 'none';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    public alertController: AlertController
  ) {}

  ngOnInit() {
    if (this.userService.getHasFilled() === 'false') {
      this.router.navigate(['/app/survey'], { replaceUrl: true });
    }
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordRepeat: ['', [Validators.required]],
    });
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(6)]],
      age: [
        null,
        [Validators.required, Validators.min(1), Validators.max(120)],
      ],
      distractibility: [1, [Validators.required]],
      impulsiveness: [1, [Validators.required]],
      lackOfSelfControl: [1, [Validators.required]],
    });
    this.userService.getProfile().then((result) => {
      this.email = result.user.email;
      this.profileForm.get('username').setValue(result.user.username);
      this.profileForm.get('age').setValue(result.user.age);
      this.profileForm
        .get('distractibility')
        .setValue(result.user.distractibility / 2);
      this.profileForm
        .get('impulsiveness')
        .setValue(result.user.impulsiveness / 2);
      this.profileForm
        .get('lackOfSelfControl')
        .setValue(result.user.lackOfSelfControl / 2);
      this.isLoadingInitial = false;
      this.displayValue = 'block';
    });
  }

  onChange(val: number) {
    if (val === 0) {
      this.errorForUsername = false;
      this.errorMessageForUsername = '';
    } else {
      this.errorMessageForAge = '';
      this.errorForAge = false;
    }
  }

  async presentAlert(message) {
    const alert = await this.alertController.create({
      cssClass: 'alertClass',
      header: 'ERROR',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }

  async onClickUpdateProfile() {
    this.errorForAge = false;
    this.errorMessageForAge = '';
    this.errorForUsername = false;
    this.errorMessageForUsername = '';
    let canSubmit = true;
    if (this.profileForm.get('username').invalid) {
      canSubmit = false;
      if (this.profileForm.get('username').errors.required) {
        this.errorForUsername = true;
        this.errorMessageForUsername = 'Username is required!';
      } else {
        this.errorForUsername = true;
        this.errorMessageForUsername = 'min username lentgh is 6!';
      }
      await this.presentAlert(this.errorMessageForUsername);
    }
    if (this.profileForm.get('age').invalid) {
      canSubmit = false;
      if (this.profileForm.get('age').errors.required) {
        this.errorForAge = true;
        this.errorMessageForAge = 'Age is required!';
      } else {
        this.errorForAge = true;
        this.errorMessageForAge = 'Age must be between 1 and 120!';
      }
      await this.presentAlert(this.errorMessageForAge);
      return;
    }
    if (canSubmit) {
      this.isLoadingUpdateProfile = true;
      try {
        await this.userService.updateProfile(
          this.profileForm.get('username').value,
          this.profileForm.get('age').value,
          this.profileForm.get('distractibility').value * 2,
          this.profileForm.get('impulsiveness').value * 2,
          this.profileForm.get('lackOfSelfControl').value * 2
        );
        this.userService.updateUsernameInLocal(
          this.profileForm.get('username').value
        );
        this.router.navigate(['/'], { replaceUrl: true });
      } catch (error) {
        this.isLoadingUpdateProfile = false;
        await this.presentAlert(error.error.message);
        console.log(error);
      }
    }
  }

  async onClickChangePassword() {
    if (this.passwordForm.get('password').invalid) {
      if (this.profileForm.get('password').errors.required) {
        await this.presentAlert('Password is required!');
      } else {
        await this.presentAlert('Min password length is 6!');
      }
    } else if (this.passwordForm.get('passwordRepeat').invalid) {
      await this.presentAlert('Password repeat is required!');
    } else {
      try {
        this.isLoadingChangePassword = true;
        await this.userService.changePassword(
          this.passwordForm.get('password').value
        );
        this.router.navigate(['/'], { replaceUrl: true });
      } catch (error) {
        this.isLoadingChangePassword = false;
        await this.presentAlert(error.error.message);
        console.log(error);
      }
    }
  }
}
