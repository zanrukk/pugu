import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NumBox } from 'src/app/interfaces/NumBox';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { ReCaptcha2Component } from 'ngx-captcha';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
})
export class VerifyComponent implements OnInit {
  siteKey: string = environment.recaptchaSiteKey;
  userId: string = '';
  @ViewChild('numBoxes') numBoxes: ElementRef<HTMLElement>;
  @ViewChild('captchaElem') captchaElem: ReCaptcha2Component;
  booleanStart = true;
  codeSize = 6;
  currentBox = 0;
  error = false;
  form: FormGroup;
  fakeArray = new Array(this.codeSize);
  isLoading = false;
  numBoxTemp: NumBox;
  valueArray = new Array(this.codeSize);
  page: string = '';
  pageTitle: string = '';
  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    public alertController: AlertController
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      recaptcha: ['', Validators.required],
    });
    this.route.params.subscribe(
      (params: Params) => (this.userId = params['userId'])
    );
    const currentPage = this.router.url.split('/')[1];
    this.page = currentPage;
    if (this.page === 'verify') {
      this.pageTitle = 'Verification';
    } else {
      this.pageTitle = 'Recover';
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

  async onSendCode() {
    if (this.form.get('recaptcha').invalid) {
      if (this.form.get('recaptcha').errors.required) {
        await this.presentAlert('Recaptcha is required!', 'ERROR');
        return;
      }
    }
    const verCode = this.valueArray.join('');
    if (verCode.length !== this.codeSize) {
      this.error = true;
      for (let i = 0; i < this.valueArray.length; i++) {
        this.valueArray[i] = '';
      }
      this.currentBox = 0;
    } else {
      if (this.userId === null || verCode === null) {
        this.error = true;
        for (let i = 0; i < this.valueArray.length; i++) {
          this.valueArray[i] = '';
        }
        this.currentBox = 0;
        return;
      }
      if (this.page === 'verify') {
        this.isLoading = true;
        this.authService
          .verify(this.userId, verCode, this.form.get('recaptcha').value)
          .then((result) => {
            if (result?.message === 'Email verified sucessfully!') {
              this.isLoading = false;
              this.router.navigate(['/'], { replaceUrl: true });
            }
          })
          .catch(async (error) => {
            this.form.get('recaptcha').setValue('');
            this.captchaElem.resetCaptcha();
            if (error.error.message === 'Are you a robot?') {
              this.isLoading = false;
              await this.presentAlert('Are you a robot?', 'ERROR');
              return;
            }
            this.isLoading = false;
            this.error = true;
            for (let i = 0; i < this.valueArray.length; i++) {
              this.valueArray[i] = '';
            }
            this.currentBox = 0;
          });
      } else {
        this.isLoading = true;
        this.authService
          .checkRecoverCode(
            this.userId,
            verCode,
            this.form.get('recaptcha').value
          )
          .then((result) => {
            this.router.navigate(['change-password', this.userId, verCode], {
              replaceUrl: true,
            });
          })
          .catch(async (error) => {
            this.form.get('recaptcha').setValue('');
            this.captchaElem.resetCaptcha();
            if (error.error.message === 'Are you a robot?') {
              this.isLoading = false;
              await this.presentAlert('Are you a robot?', 'ERROR');
              return;
            }
            this.isLoading = false;
            this.error = true;
            for (let i = 0; i < this.valueArray.length; i++) {
              this.valueArray[i] = '';
            }
            this.currentBox = 0;
          });
      }
    }
  }

  onChangeBox(int: number): void {
    if (int === 0) {
      this.currentBox = int;
    } else {
      const missingValue = int;
      let val = int;
      for (let i = missingValue - 1; i >= 0; i--) {
        if (
          this.valueArray[i] === undefined ||
          this.valueArray[i] === null ||
          this.valueArray[i] === ''
        ) {
          val = i;
        }
      }
      this.currentBox = val;
      const grandParentElement = this.numBoxes.nativeElement;
      const parent = grandParentElement.children[val];
      const child = parent.children[0];
      const grandchild = child.children[0];
      const grandchild2 = grandchild.children[0];
      (grandchild2 as HTMLElement).focus();
    }
  }

  onChangeNumber(data: NumBox): void {
    this.error = false;
    this.valueArray[data.index] = data.value;
    if (data.value === '') {
      if (data.index !== 0) this.currentBox--;
    } else {
      if (data.index !== this.codeSize - 1) this.currentBox++;
    }
  }

  onPasteContent(str: string): void {
    this.error = false;
    const list = str.split('');
    if (list.length >= this.codeSize) {
      for (let i = 0; i < this.codeSize; i++) {
        this.valueArray[i] = list[i];
      }
      this.currentBox = this.codeSize - 1;
    } else {
      for (let i = 0; i < list.length; i++) {
        this.valueArray[i] = list[i];
      }
      this.currentBox = list.length;
    }
  }
}
