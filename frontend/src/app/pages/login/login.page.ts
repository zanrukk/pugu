import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { ReCaptcha2Component } from 'ngx-captcha';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  isLoading: boolean = false;
  loginForm: FormGroup;
  siteKey: string = environment.recaptchaSiteKey;
  displayValue: string = 'flex';
  @ViewChild('captchaElem') captchaElem: ReCaptcha2Component;

  private authStatusSub: Subscription;
  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private userService: UserService,
    public alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });
    this.loginForm = this.fb.group({
      recaptcha: ['', Validators.required],
      usernameOrMail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

  onClickSignUp() {
    this.loginForm.get('usernameOrMail').setValue('');
    this.loginForm.get('password').setValue('');
    this.router.navigate(['/signup'], { replaceUrl: true });
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

  async onSubmit() {
    if (this.loginForm.get('recaptcha').invalid) {
      if (this.loginForm.get('recaptcha').errors.required) {
        await this.presentAlert('Recaptcha is required!', 'ERROR');
        return;
      }
    }
    if (this.loginForm.get('usernameOrMail').invalid) {
      await this.presentAlert('Username/mail is required!', 'ERROR');
      return;
    }
    if (this.loginForm.get('usernameOrMail').value.length < 6) {
      await this.presentAlert(
        'Username/mail field must be at least 6 characters!',
        'ERROR'
      );
      return;
    }
    const regex = new RegExp('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}');
    if (
      this.loginForm.get('usernameOrMail').value.includes('@') &&
      !regex.test(this.loginForm.get('usernameOrMail').value)
    ) {
      await this.presentAlert('Invalid mail adress!', 'ERROR');
      return;
    }
    if (this.loginForm.get('password').invalid) {
      if (this.loginForm.get('password').errors.required) {
        await this.presentAlert('Password is required!', 'ERROR');
      } else {
        await this.presentAlert(
          'Password must be at least 6 characters!',
          'ERROR'
        );
      }
      return;
    }
    this.isLoading = true;
    this.displayValue = 'none';
    try {
      const response = await this.authService.login(
        this.loginForm.get('usernameOrMail')?.value,
        this.loginForm.get('password')?.value,
        this.loginForm.get('recaptcha').value
      );
      this.loginForm.get('usernameOrMail').setValue('');
      this.loginForm.get('password').setValue('');
      if (this.userService.getHasFilled() === 'true') {
        this.router.navigate(['/app'], { replaceUrl: true });
      } else {
        this.router.navigate(['/app/survey'], { replaceUrl: true });
      }
    } catch (error) {
      this.isLoading = false;
      this.displayValue = 'flex';
      this.captchaElem.resetCaptcha();
      this.loginForm.get('recaptcha').setValue('');
      await this.presentAlert(error.error.message, 'ERROR');
    }
  }

  async onClickForgot() {
    if (this.loginForm.get('usernameOrMail').invalid) {
      await this.presentAlert('Username/mail is required!', 'ERROR');
      return;
    }
    if (this.loginForm.get('usernameOrMail').value.length < 6) {
      await this.presentAlert(
        'Username/mail field must be at least 6 characters!',
        'ERROR'
      );
      return;
    }
    const regex = new RegExp('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}');
    if (
      this.loginForm.get('usernameOrMail').value.includes('@') &&
      !regex.test(this.loginForm.get('usernameOrMail').value)
    ) {
      await this.presentAlert('Invalid mail adress!', 'ERROR');
      return;
    }
    this.isLoading = true;
    try {
      const response = await this.authService.forgotPassword(
        this.loginForm.get('usernameOrMail')?.value
      );
      this.isLoading = false;
      const userId = response.message;
      this.loginForm.get('usernameOrMail').setValue('');
      this.loginForm.get('password').setValue('');
      this.router.navigate(['/recover', userId], { replaceUrl: true });
    } catch (error) {
      this.isLoading = false;
      await this.presentAlert(error.error.message, 'ERROR');
    }
  }
}
