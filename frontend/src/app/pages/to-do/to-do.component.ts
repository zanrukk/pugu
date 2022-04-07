import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ToDoSecondInterface } from 'src/app/interfaces/ToDoSecond';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-to-do',
  templateUrl: './to-do.component.html',
  styleUrls: ['./to-do.component.scss'],
})
export class ToDoComponent implements OnInit {
  progressValue: number = 0;
  checkBoxList: any[] = [];
  endTime: string;
  todo: ToDoSecondInterface;
  color: string = 'white';
  isLoading: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    public alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.userService.getHasFilled() === 'false') {
      this.router.navigate(['/app/survey'], { replaceUrl: true });
    }
    this.route.params.subscribe((params: Params) => {
      if (params['id'] !== undefined && params['id'] !== null) {
        this.userService
          .getOneToDo(params['id'])
          .then((result: { todo: ToDoSecondInterface }) => {
            this.todo = result.todo;
            this.isLoading = false;
            this.checkBoxList = result.todo.checkBoxList;
            this.progressValue = Math.floor(result.todo.progress);
            let strList = result.todo.endTime.split(' ');
            this.endTime =
              strList[0] +
              ', ' +
              strList[1] +
              ' ' +
              strList[2] +
              ' ' +
              strList[3];
            let strListTwo = strList[4].split(':');
            let hourAndMinute = strListTwo[0] + ':' + strListTwo[1];
            this.endTime = this.endTime + ' ' + hourAndMinute;
          });
      }
      if (params['color'] !== undefined && params['color'] !== null) {
        this.color = params['color'];
      }
    });
  }

  async onClickCheckBox(box) {
    this.todo.checkBoxList = this.checkBoxList;
    const response = await this.userService.updateProgress(
      box.content,
      !box.value,
      this.todo.id
    );
    this.progressValue = Math.floor(response.progress);
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'WARNING',
      message: 'Do you really want to delete this to do? ',
      buttons: ['CANCEL', 'DELETE'],
      backdropDismiss: false,
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    //rol atamayı öğren, ve undefined yerine delete rolünü ata!
    if (role === undefined) await this.deleteToDo();
  }

  async presentError() {
    const error = await this.alertController.create({
      header: 'ERROR',
      message: 'Cannot deleted!',
      buttons: ['OK'],
      backdropDismiss: false,
    });

    await error.present();

    const { role } = await error.onDidDismiss();
  }

  async deleteToDo() {
    try {
      await this.userService.deleteToDo(this.todo.id);
      this.router.navigate(['/app'], { replaceUrl: true });
    } catch (error) {
      await this.presentError();
    }
  }

  async onClickDelete() {
    await this.presentAlert();
  }

  onClickEdit() {
    let id = this.todo.id;
    this.router.navigate(['/app/edit-to-do', id], { replaceUrl: true });
  }
}
