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
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CheckBoxInterface } from 'src/app/interfaces/CheckBox';
import { ToDoSecondInterface } from 'src/app/interfaces/ToDoSecond';
import { UserService } from 'src/app/services/user.service';
import { CheckBoxComponent } from 'src/app/shared/components';

@Component({
  selector: 'app-edit-to-do',
  templateUrl: './edit-to-do.component.html',
  styleUrls: ['./edit-to-do.component.scss'],
})
export class EditToDoComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  displayValue: string = 'none';

  title: string = '';
  description: string = '';
  checkBoxListOld: CheckBoxInterface[] = [];
  checkBoxList: CheckBoxInterface[] = [];
  checkBoxComponentList: ComponentRef<any>[] = [];
  index: number = 0;
  todoId: string;
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
    public alertController: AlertController,
    private route: ActivatedRoute
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
      progress: [0, [Validators.min(0), Validators.max(100)]],
    });
    this.route.params.subscribe((params: Params) => {
      if (params['id'] !== undefined && params['id'] !== null) {
        this.userService
          .getOneToDo(params['id'])
          .then((result: { todo: any }) => {
            this.isLoading = false;
            this.displayValue = 'flex';
            this.todoId = result.todo.id;
            this.title = result.todo.title;
            this.desc.nativeElement.innerHTML = result.todo.description;
            this.form.get('progress').setValue(result.todo.progress);
            this.form.get('priority').setValue(result.todo.priority / 2);
            this.form.get('desireToDo').setValue(result.todo.desireToDo / 2);
            this.form.get('avodiance').setValue(result.todo.avodiance / 2);
            this.form.get('estimatedTime').setValue(result.todo.estimatedTime);
            let dateStart = new Date(result.todo.startTime);
            let dateStartMonth = dateStart.getMonth() + 1;
            let dateStartFinal = '';
            if (dateStartMonth < 10) {
              dateStartFinal = dateStart.getFullYear() + '-0' + dateStartMonth;
            } else {
              dateStartFinal = dateStart.getFullYear() + '-' + dateStartMonth;
            }
            if (dateStart.getDate() < 10) {
              dateStartFinal = dateStartFinal + '-0' + dateStart.getDate();
            } else {
              dateStartFinal = dateStartFinal + '-' + dateStart.getDate();
            }
            this.form.get('startTime').setValue(dateStartFinal);
            let dateEnd = new Date(result.todo.endTime);
            let dateEndMonth = dateEnd.getMonth() + 1;
            let dateEndFinal = '';
            if (dateEndMonth < 10) {
              dateEndFinal = dateEnd.getFullYear() + '-0' + dateEndMonth;
            } else {
              dateEndFinal = dateEnd.getFullYear() + '-' + dateEndMonth;
            }
            if (dateEnd.getDate() < 10) {
              dateEndFinal = dateEndFinal + '-0' + dateEnd.getDate();
            } else {
              dateEndFinal = dateEndFinal + '-' + dateEnd.getDate();
            }
            this.form.get('estimatedHour').setValue(result.todo.workHour);
            this.form.get('estimatedMinute').setValue(result.todo.workMinute);
            this.form.get('startHour').setValue(result.todo.startHour);
            this.form.get('startMinute').setValue(result.todo.startMinute);
            this.form.get('endHour').setValue(result.todo.endHour);
            this.form.get('endMinute').setValue(result.todo.endMinute);
            this.form.get('endTime').setValue(dateEndFinal);
            let indis = 0;
            result.todo.checkBoxList.forEach((t) => {
              let todoTemp: CheckBoxInterface = {
                index: indis,
                value: t.value,
                content: t.content,
                deleted: false,
              };
              indis++;
              this.checkBoxListOld.push(todoTemp);
            });
          });
      }
    });
  }

  deleteOldCheckBox(index: number) {
    this.checkBoxListOld = this.checkBoxListOld.filter(
      (c) => c.index !== index
    );
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
    //HER ZAMAN BURAYA GİRMEDİĞİ İÇİN DÜZGÜN ÇALIŞMIYOR
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
    let checkListFinal: CheckBoxInterface[];
    checkListFinal = this.checkBoxListOld.concat(this.checkBoxList);
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
      this.form.get('endTime').value === '' ||
      this.form.get('endTime').value === null ||
      this.form.get('endTime').value === undefined
    ) {
      await this.presentAlert('End date is required!', 'ERROR');
      return;
    }
    if (
      this.form.get('estimatedTime').value === null ||
      this.form.get('estimatedTime').value === undefined
    ) {
      this.form.get('estimatedTime').setValue(0);
    }
    this.isLoading = true;
    this.displayValue = 'none';
    try {
      const sT: Date = new Date(this.form.get('startTime').value);
      const eT: Date = new Date(this.form.get('endTime').value);
      let priority = this.form.get('priority').value;
      if (priority > 1) priority = priority * 2;
      let dtd = this.form.get('desireToDo').value;
      if (dtd > 1) dtd = dtd * 2;
      let avod = this.form.get('avodiance').value;
      if (avod > 1) avod = avod * 2;
      const response = await this.userService.editToDo(
        this.todoId,
        this.title,
        this.description,
        checkListFinal,
        sT.toString(),
        eT.toString(),
        this.form.get('estimatedTime').value,
        priority,
        dtd,
        avod,
        this.form.get('progress').value,
        this.form.get('startHour').value,
        this.form.get('startMinute').value,
        this.form.get('endHour').value,
        this.form.get('endMinute').value,
        this.form.get('estimatedHour').value,
        this.form.get('estimatedMinute').value
      );
      this.isLoading = false;
      this.displayValue = 'block';
      this.router.navigate(['/app'], { replaceUrl: true });
    } catch (error) {
      this.isLoading = false;
      this.displayValue = 'block';
      await this.presentAlert(error.error.message, 'ERROR');
    }
  }
}
