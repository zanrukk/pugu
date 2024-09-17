import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToDoInterface } from 'src/app/interfaces/ToDo';
import { UserService } from 'src/app/services/user.service';
import colorGradient from 'javascript-color-gradient';

@Component({
  selector: 'app-to-do-list',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.scss'],
})
export class ToDoListComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  width: number = 0;
  height: number = 0;
  totalArea: number = 0;
  today: number;
  private todoSub: Subscription;
  todos: any[];
  interval;
  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    if (this.userService.getHasFilled() === 'false') {
      this.router.navigate(['/app/survey'], { replaceUrl: true });
    }
    this.width = window.innerWidth;
    this.height = window.innerHeight - 55;
    this.totalArea = this.width * this.height;
    this.today = new Date().getTime();
    try {
      this.isLoading = true;
      this.userService.getToDo(this.width, this.height, this.today);
      this.todoSub = this.userService
        .getToDoUpdateListener()
        .subscribe((response: { todos: any[] }) => {
          this.todos = response.todos;
          this.todos = this.todos.map((todo) => {
            return {
              ...todo,
              color: this.pickColor(Math.floor(todo.totalPoint)),
            };
          });
          this.isLoading = false;
        });
    } catch (error) {
      this.isLoading = false;
      console.log(error);
    }
    this.interval = setInterval(() => {
      try {
        this.today = new Date().getTime();
        this.userService.getToDo(this.width, this.height, this.today);
      } catch (e) {
        console.log(e);
      }
    }, 60000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.todoSub.unsubscribe();
  }

  pickColor(point) {
    if (point >= 70 && point < 80) {
      point = point + 10;
    } else if (point >= 80) {
      point = 100;
    }
    if (point > 50) {
      let green = 100 - point;
      green = (green * 255) / 50;
      green = Math.floor(green);
      let hex = green.toString(16);
      if (hex.length === 1) hex = '0' + hex;
      return '#ff' + hex + '00';
    } else if (point < 50) {
      let red = (point * 255) / 50;
      red = Math.floor(red);
      let hex = red.toString(16);
      if (hex.length === 1) hex = '0' + hex;
      return '#' + hex + 'ff00';
    } else {
      return '#ffff00';
    }
  }

  onClickBox(box: ToDoInterface) {
    const id = box.id;
    const color = box.color;
    this.router.navigate(['/app/to-do', id, color], { replaceUrl: true });
  }
}
