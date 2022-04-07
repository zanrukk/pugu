import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { environment } from 'src/environments/environment';
import { CheckBoxInterface } from '../interfaces/CheckBox';
import { ToDoInterface } from '../interfaces/ToDo';

@Injectable({ providedIn: 'root' })
export class UserService {
  private todos: ToDoInterface[] = [];
  private todosUpdated = new Subject<{ todos: ToDoInterface[] }>();
  private usernameStatusListener = new Subject<string>();

  constructor(private http: HttpClient, private router: Router) {}

  getToDoUpdateListener() {
    return this.todosUpdated.asObservable();
  }

  getUsernameStatusListener() {
    return this.usernameStatusListener.asObservable();
  }

  getToDo(width: number, height: number, today: number) {
    this.http
      .get<{ message: string; todos: ToDoInterface[] }>(
        environment.hostURL +
          '/api/user/get-to-do/' +
          width +
          '/' +
          height +
          '/' +
          today
      )
      .subscribe((response) => {
        this.todos = response.todos;
        this.todosUpdated.next({
          todos: [...this.todos],
        });
      });
  }

  async getOutdatedTodos() {
    const response = await this.http
      .get<{ message: string; todos: any }>(
        environment.hostURL + '/api/user/get-outdated-todos'
      )
      .toPromise();
    return Promise.resolve(response);
  }
  async getFinishedTodos() {
    const response = await this.http
      .get<{ message: string; todos: any }>(
        environment.hostURL + '/api/user/get-finished-todos'
      )
      .toPromise();
    return Promise.resolve(response);
  }

  async getOneToDo(id: string) {
    try {
      const response = await this.http
        .get<{ todo: any; message: string }>(
          `${environment.hostURL}/api/user/get-one-to-do/${id}`
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  async createToDo(
    title: string,
    description: string,
    checkBoxList: CheckBoxInterface[],
    startTime: string,
    endTime: string,
    estimatedTime: number,
    priority: number,
    desireToDo: number,
    avodiance: number,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
    estimatedHour: number,
    estimatedMinute: number
  ) {
    try {
      const body = {
        title: title,
        description: description,
        checkBoxList: checkBoxList,
        startTime: startTime,
        endTime: endTime,
        estimatedTime: estimatedTime,
        priority: priority,
        desireToDo: desireToDo,
        avodiance: avodiance,
        today: new Date().getTime(),
        startHour: startHour,
        startMinute: startMinute,
        endHour: endHour,
        endMinute: endMinute,
        estimatedHour: estimatedHour,
        estimatedMinute: estimatedMinute,
      };
      const response = await this.http
        .post<{ message: string }>(
          environment.hostURL + '/api/user/create-to-do',
          body
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  async editToDo(
    id: string,
    title: string,
    description: string,
    checkBoxList: CheckBoxInterface[],
    startTime: string,
    endTime: string,
    estimatedTime: number,
    priority: number,
    desireToDo: number,
    avodiance: number,
    progress: number,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
    estimatedHour: number,
    estimatedMinute: number
  ) {
    try {
      const body = {
        id: id,
        title: title,
        description: description,
        checkBoxList: checkBoxList,
        startTime: startTime,
        endTime: endTime,
        estimatedTime: estimatedTime,
        priority: priority,
        desireToDo: desireToDo,
        avodiance: avodiance,
        progress: progress,
        today: new Date().getTime(),
        startHour: startHour,
        startMinute: startMinute,
        endHour: endHour,
        endMinute: endMinute,
        estimatedHour: estimatedHour,
        estimatedMinute: estimatedMinute,
      };
      const response = await this.http
        .post<{ message: string }>(
          environment.hostURL + '/api/user/edit-to-do',
          body
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  async deleteToDo(id: string) {
    try {
      const response = await this.http
        .delete<{ message: string }>(
          `${environment.hostURL}/api/user/delete-to-do/${id}`
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  async updateProgress(content: string, val: boolean, id: string) {
    try {
      const body = {
        content: content,
        val: val,
        id: id,
      };
      const response = await this.http
        .post<{ message: string; progress: number }>(
          environment.hostURL + '/api/user/update-progress',
          body
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  async getHasFilledFromBackend() {
    const userId = localStorage.getItem('userId');
    try {
      const response = await this.http
        .get<{ hasFilled: boolean; message: string }>(
          `${environment.hostURL}/api/user/get-has-filled/${userId}`
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  getHasFilled(): string {
    let hasFilled = localStorage.getItem('hasFilled');
    return hasFilled;
  }

  setHasFilled(value: string): void {
    localStorage.setItem('hasFilled', value);
  }

  async sendSurvey(
    age: number,
    distrac: number,
    impul: number,
    lackOfSelfControl: number
  ) {
    try {
      const body = {
        age: age,
        distrac: distrac,
        impul: impul,
        lackOfSelfControl: lackOfSelfControl,
      };
      const response = await this.http
        .post<{ message: string }>(
          environment.hostURL + '/api/user/survey',
          body
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  async getProfile() {
    try {
      const response = await this.http
        .get<{ user: any; message: string }>(
          environment.hostURL + '/api/user/get-user-info'
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(
    username: string,
    age: number,
    distractibility: number,
    impulsiveness: number,
    lackOfSelfControl: number
  ) {
    try {
      const body = {
        username: username,
        age: age,
        distractibility: distractibility,
        impulsiveness: impulsiveness,
        lackOfSelfControl: lackOfSelfControl,
      };
      const response = await this.http
        .post<{ message: string }>(
          environment.hostURL + '/api/user/update-profile',
          body
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  updateUsernameInLocal(username: string) {
    localStorage.setItem('username', username);
    this.usernameStatusListener.next(username);
  }

  async changePassword(password: string) {
    try {
      const body = {
        password: password,
      };
      const response = await this.http
        .post<{ message: string }>(
          environment.hostURL + '/api/user/change-password',
          body
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }
}
