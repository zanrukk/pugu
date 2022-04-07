import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  userId: string;
  code: string;
  isLoading: boolean = false;
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public alertController: AlertController,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.userId = params['userId'];
      this.code = params['code'];
    });
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      if (this.form.get('password').errors.required) {
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
    try {
      await this.authService.recoverPassword(
        this.userId,
        this.code,
        this.form.get('password').value
      );
      this.router.navigate(['/'], { replaceUrl: true });
    } catch (error) {
      this.isLoading = false;
      await this.presentAlert('Password cannot be changed!', 'ERROR');
    }
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
}
