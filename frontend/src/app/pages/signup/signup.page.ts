import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  isLoading: boolean = false;
  signUpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
    public alertController: AlertController
  ) {}

  ngOnInit() {
    this.signUpForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(6)]],
      mail: [
        '',
        [
          Validators.required,
          Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}'),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordRepeat: ['', [Validators.required]],
    });
  }

  onClickToLogin() {
    this.signUpForm.get('username').setValue('');
    this.signUpForm.get('mail').setValue('');
    this.signUpForm.get('password').setValue('');
    this.signUpForm.get('passwordRepeat').setValue('');
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  async presentAlert(message, header) {
    const alert = await this.alertController.create({
      cssClass: 'alertClass',
      header: 'ERROR',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }

  async onClickResend() {
    if (this.signUpForm.get('mail').errors?.required) {
      await this.presentAlert('Mail address is required!', 'ERROR');
      return;
    } else if (this.signUpForm.get('mail').errors?.pattern) {
      await this.presentAlert('Mail address is invalid!', 'ERROR');
      return;
    } else {
      this.isLoading = true;
      try {
        const response = await this.authService.resendVerificationCode(
          this.signUpForm.get('mail').value
        );
        this.isLoading = false;
        const userId = response.message;
        this.signUpForm.get('username').setValue('');
        this.signUpForm.get('mail').setValue('');
        this.signUpForm.get('password').setValue('');
        this.signUpForm.get('passwordRepeat').setValue('');
        this.router.navigate(['verify', userId], { replaceUrl: true });
      } catch (error) {
        this.isLoading = false;
        await this.presentAlert(error?.error, 'ERROR');
      }
    }
  }

  async onSubmit() {
    let uname = this.signUpForm.get('username')?.value;
    if (this.signUpForm.invalid) {
      if (this.signUpForm.get('username').invalid) {
        if (this.signUpForm.get('username').errors.required) {
          await this.presentAlert('Username is required!', 'ERROR');
        } else {
          await this.presentAlert(
            'Username must be at least 6 characters!',
            'ERROR'
          );
        }
      } else if (this.signUpForm.get('mail').invalid) {
        if (this.signUpForm.get('mail').errors.required) {
          await this.presentAlert('Mail address is required!', 'ERROR');
        } else {
          await this.presentAlert('Invalid mail address!', 'ERROR');
        }
      } else if (this.signUpForm.get('password').invalid) {
        if (this.signUpForm.get('password').errors.required) {
          await this.presentAlert('Password is required!', 'ERROR');
        } else {
          await this.presentAlert(
            'Password must be at least 6 characters!',
            'ERROR'
          );
        }
      } else if (this.signUpForm.get('passwordRepeat').invalid) {
        if (this.signUpForm.get('passwordRepeat').errors.required) {
          await this.presentAlert('Password repeat is required!', 'ERROR');
        }
      }
      return;
    }
    if (uname.includes('@')) {
      await this.presentAlert(
        "Username cannot includes '@' character!",
        'ERROR'
      );
      return;
    }
    if (
      this.signUpForm.get('password')?.value !==
      this.signUpForm.get('passwordRepeat')?.value
    ) {
      await this.presentAlert(
        'Password and password repeat are not equal!',
        'ERROR'
      );
      return;
    }
    this.isLoading = true;
    try {
      const response = await this.authService.createUser(
        this.signUpForm.get('username')?.value,
        this.signUpForm.get('mail')?.value,
        this.signUpForm.get('password')?.value
      );
      this.isLoading = false;
      const userId = response.message;
      this.signUpForm.get('username').setValue('');
      this.signUpForm.get('mail').setValue('');
      this.signUpForm.get('password').setValue('');
      this.signUpForm.get('passwordRepeat').setValue('');
      this.router.navigate(['verify', userId], { replaceUrl: true });
    } catch (error) {
      this.isLoading = false;
      if (error.error.message === 'Username already exists!') {
        await this.presentAlert('Username already exists!', 'ERROR');
        return;
      } else if (error.error.message === 'Email already exists!') {
        await this.presentAlert('Email already exists!', 'ERROR');
        return;
      } else if (
        error.error.message === "Username cannot include '@' character!"
      ) {
        await this.presentAlert(
          "Username cannot includes '@' character!",
          'ERROR'
        );
        return;
      } else {
        await this.presentAlert('User cannot be created!', 'ERROR');
        return;
      }
    }
  }
}
