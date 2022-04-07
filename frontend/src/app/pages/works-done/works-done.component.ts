import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-works-done',
  templateUrl: './works-done.component.html',
  styleUrls: ['./works-done.component.scss'],
})
export class WorksDoneComponent implements OnInit {
  isLoading: boolean = true;
  todos: any[];
  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    if (this.userService.getHasFilled() === 'false') {
      this.router.navigate(['/app/survey'], { replaceUrl: true });
    }
    try {
      this.isLoading = true;
      this.userService.getFinishedTodos().then((result) => {
        this.todos = result.todos;
        this.isLoading = false;
      });
    } catch (error) {
      console.log(error);
    }
  }

  async onClickDelete(id: string) {
    try {
      await this.userService.deleteToDo(id);
      this.todos = this.todos.filter((t) => t.id !== id);
    } catch (error) {
      console.log(error);
    }
  }
}
