import {
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CheckBoxInterface } from 'src/app/interfaces/CheckBox';
import { UserService } from 'src/app/services/user.service';
import { CheckBoxComponent } from 'src/app/shared/components';

@Component({
  selector: 'app-create-to-do',
  templateUrl: './create-to-do.page.html',
  styleUrls: ['./create-to-do.page.scss'],
})
export class CreateToDoPage implements OnInit, OnDestroy {
  isLoading: boolean = false;

  title: string = '';
  description: string;
  checkBoxList: CheckBoxInterface[] = [];
  checkBoxComponentList: ComponentRef<any>[] = [];
  index: number = 0;
  form: FormGroup;
  hours: number[] = [];
  minutes: number[] = [];

  @ViewChild('description') desc;
  @ViewChild('checkList', { read: ViewContainerRef }) checkList;

  constructor(
    private fb: FormBuilder,
    private resolver: ComponentFactoryResolver,
    private router: Router,
    private userService: UserService,
    public alertController: AlertController
  ) {}

  ngOnInit() {
    for (let i = 0; i < 24; i++) {
      this.hours.push(i);
    }
    for (let i = 0; i < 60; i++) {
      this.minutes.push(i);
    }
    if (this.userService.getHasFilled() === 'false') {
      this.router.navigate(['/app/survey'], { replaceUrl: true });
    }
    this.form = this.fb.group({
      startTime: [''],
      startHour: [0, [Validators.required]],
      startMinute: [0, [Validators.required]],
      endTime: [''],
      endHour: [0, [Validators.required]],
      endMinute: [0, [Validators.required]],
      estimatedTime: [1, [Validators.required, Validators.min(0)]],
      estimatedHour: [0, [Validators.required]],
      estimatedMinute: [0, [Validators.required]],
      priority: [1, [Validators.required]],
      desireToDo: [1, [Validators.required]],
      avodiance: [1, [Validators.required]],
    });
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

  ngOnDestroy() {
    this.checkBoxComponentList.forEach((c) => {
      c.instance.outputEvent.unsubscribe();
      c.destroy();
    });
    this.checkBoxComponentList = [];
    this.checkBoxList = [];
    this.title = '';
    this.description = '';
    this.index = 0;
    this.form.get('startTime').setValue('');
    this.form.get('endTime').setValue('');
    this.form.get('estimatedTime').setValue(1);
    this.form.get('priority').setValue(1);
    this.form.get('desireToDo').setValue(1);
    this.form.get('avodiance').setValue(1);
  }

  addCheckBox() {
    //create component dynamically
    const factory: ComponentFactory<any> =
      this.resolver.resolveComponentFactory(CheckBoxComponent);
    let componentRef = this.checkList.createComponent(factory);

    //set style
    let element: HTMLElement = <HTMLElement>componentRef.location.nativeElement;
    element.style.alignSelf = 'flex-start';
    element.style.width = '90%';
    element.style.marginLeft = '0.8rem';
    element.style.marginRight = '1.6rem';

    //send input
    componentRef.instance.someData = { index: this.index };

    //create and save checkbox values in parent component
    const checkBox: CheckBoxInterface = {
      index: this.index,
      value: false,
      deleted: false,
      content: '',
    };
    this.checkBoxList.push(checkBox);

    //increase index
    this.index = this.index + 1;

    //subscribe outputevent in child component
    componentRef.instance.outputEvent.subscribe((val) => {
      //delete checkbox from checkBoxList
      if (val.deleted) {
        let indis;
        this.checkBoxList = this.checkBoxList.map((checkBox, i) => {
          if (val.index === checkBox.index) {
            indis = i;
          }
          return checkBox;
        });
        this.checkBoxComponentList[indis].instance.outputEvent.unsubscribe();
        this.checkBoxComponentList[indis].destroy();
        this.checkBoxComponentList.splice(indis, 1);
        this.checkBoxList.splice(indis, 1);
      } else {
        this.checkBoxList = this.checkBoxList.map((checkBox) => {
          if (val.index === checkBox.index) {
            const data: CheckBoxInterface = {
              index: val.index,
              value: val.value,
              content: val.content,
              deleted: val.deleted,
            };
            return data;
          } else {
            return checkBox;
          }
        });
      }
    });

    //save component ref
    this.checkBoxComponentList.push(componentRef);
  }

  async onSubmit() {
    this.description = this.desc.nativeElement.innerText;
    if (this.title === '' || this.title === null || this.title === undefined) {
      await this.presentAlert('Title is required!', 'ERROR');
      return;
    }
    if (
      this.description === '' ||
      this.description === null ||
      this.description === undefined
    ) {
      await this.presentAlert('Description is required!', 'ERROR');
      return;
    }
    if (
      this.form.get('startTime').value === '' ||
      this.form.get('startTime').value === null ||
      this.form.get('startTime').value === undefined
    ) {
      await this.presentAlert('Start date is required!', 'ERROR');
      return;
    }
    if (
      this.form.get('startHour').value === null ||
      this.form.get('startHour').value === undefined
    ) {
      await this.presentAlert('Start hour is required!', 'ERROR');
      return;
    }
    if (
      this.form.get('startMinute').value === null ||
      this.form.get('startMinute').value === undefined
    ) {
      await this.presentAlert('Start minute is required!', 'ERROR');
      return;
    }
    if (
      this.form.get('endTime').value === '' ||
      this.form.get('endTime').value === null ||
      this.form.get('endTime').value === undefined
    ) {
      await this.presentAlert('End time is required!', 'ERROR');
      return;
    }
    if (
      this.form.get('endHour').value === null ||
      this.form.get('endHour').value === undefined
    ) {
      await this.presentAlert('End hour is required!', 'ERROR');
      return;
    }
    if (
      this.form.get('endMinute').value === null ||
      this.form.get('endMinute').value === undefined
    ) {
      await this.presentAlert('End minute is required!', 'ERROR');
      return;
    }
    if (
      this.form.get('estimatedTime').value === null ||
      this.form.get('estimatedTime').value === undefined
    ) {
      this.form.get('estimatedTime').setValue(0);
    }
    this.isLoading = true;
    try {
      const sT: Date = this.form.get('startTime').value;
      const eT: Date = this.form.get('endTime').value;
      const response = await this.userService.createToDo(
        this.title,
        this.description,
        this.checkBoxList,
        sT.toString(),
        eT.toString(),
        this.form.get('estimatedTime').value,
        this.form.get('priority').value * 2,
        this.form.get('desireToDo').value * 2,
        this.form.get('avodiance').value * 2,
        this.form.get('startHour').value,
        this.form.get('startMinute').value,
        this.form.get('endHour').value,
        this.form.get('endMinute').value,
        this.form.get('estimatedHour').value,
        this.form.get('estimatedMinute').value
      );
      this.isLoading = false;
      this.router.navigate(['/app'], { replaceUrl: true });
    } catch (error) {
      this.isLoading = false;
      console.log(error);
      await this.presentAlert(error.error.message, 'ERROR');
    }
  }
}
