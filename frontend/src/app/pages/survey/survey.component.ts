import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
  error: boolean = false;
  errorMessage = '';
  surveyForm: FormGroup;
  isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    public alertController: AlertController
  ) {}

  ngOnInit() {
    if (this.userService.getHasFilled() === 'true') {
      this.router.navigate(['/'], { replaceUrl: true });
    }
    this.surveyForm = this.fb.group({
      age: [
        null,
        [Validators.required, Validators.min(1), Validators.max(120)],
      ],
      distractibility: [1, [Validators.required]],
      impulsiveness: [1, [Validators.required]],
      lackOfSelfControl: [1, [Validators.required]],
    });
  }

  onChange() {
    this.errorMessage = '';
    this.error = false;
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
    this.error = false;
    this.errorMessage = '';
    if (this.surveyForm.get('age').invalid) {
      if (this.surveyForm.get('age').errors.required) {
        this.error = true;
        this.errorMessage = 'Age is required!';
      } else {
        this.error = true;
        this.errorMessage = 'Age must be between 1 and 120!';
      }
      await this.presentAlert(this.errorMessage, 'ERROR');
      return;
    }
    this.isLoading = true;
    try {
      const response = await this.userService.sendSurvey(
        this.surveyForm.get('age').value,
        this.surveyForm.get('distractibility').value * 2,
        this.surveyForm.get('impulsiveness').value * 2,
        this.surveyForm.get('lackOfSelfControl').value * 2
      );
      this.surveyForm.get('age').setValue(null);
      this.surveyForm.get('distractibility').setValue(1);
      this.surveyForm.get('impulsiveness').setValue(1);
      this.surveyForm.get('lackOfSelfControl').setValue(1);
      this.isLoading = false;
      this.userService.setHasFilled('true');
      this.router.navigate(['/app'], { replaceUrl: true });
    } catch (error) {
      this.isLoading = false;
      await this.presentAlert(error.error.message, 'ERROR');
      console.log(error);
    }
  }
}
