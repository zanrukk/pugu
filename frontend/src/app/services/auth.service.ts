import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { AuthData } from '../models/auth-data.model';

import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated = false;
  private token: string | null;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer: any;
  private userId: string | null;

  constructor(private http: HttpClient, private router: Router) {}

  getIsAuth() {
    return this.isAuthenticated;
  }
  getToken() {
    return this.token;
  }
  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }
  async createUser(
    username: string,
    email: string,
    password: string
  ): Promise<{ message: string } | undefined> {
    const createUserData = {
      username: username,
      email: email,
      password: password,
    };
    try {
      const response = await this.http
        .post<{ message: string }>(
          environment.hostURL + '/api/auth/signup',
          createUserData
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      this.authStatusListener.next(false);
      throw error;
    }
  }

  async resendVerificationCode(
    email: string
  ): Promise<{ message: string } | undefined> {
    const body = {
      email: email,
    };
    try {
      const response = await this.http
        .post<{ message: string }>(
          environment.hostURL + '/api/auth/resend',
          body
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  async checkRecoverCode(
    userId: string | null,
    code: string | null,
    recaptcha: string | null
  ): Promise<{ message: string } | undefined> {
    const body = {
      userId: userId,
      code: code,
      recaptcha: recaptcha,
    };
    try {
      const response = await this.http
        .post<{ message: string }>(
          environment.hostURL + '/api/auth/check-recover-code',
          body
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(
    usernameOrMail: string | null
  ): Promise<{ message: string } | undefined> {
    const body = {
      usernameOrMail: usernameOrMail,
    };
    try {
      const response = await this.http
        .post<{ message: string }>(
          environment.hostURL + '/api/auth/forgot-password',
          body
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  async recoverPassword(
    id: string | null,
    token: string | null,
    password: string | null
  ): Promise<{ message: string } | undefined> {
    try {
      const body = {
        id: id,
        token: token,
        password: password,
      };
      const response = await this.http
        .post<{ message: string }>(
          environment.hostURL + '/api/auth/recover-password',
          body
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  async verify(
    id: string | null,
    token: string | null,
    recaptcha: string | null
  ): Promise<{ message: string } | undefined> {
    try {
      const response = await this.http
        .get<{ message: string }>(
          `${environment.hostURL}/api/auth/verify/${id}/${token}/${recaptcha}`
        )
        .toPromise();
      return Promise.resolve(response);
    } catch (error) {
      throw error;
    }
  }

  async login(usernameOrMail: string, password: string, recaptcha: string) {
    try {
      const authData: AuthData = {
        usernameOrMail: usernameOrMail,
        password: password,
        recaptcha: recaptcha,
      };
      const response = await this.http
        .post<{
          token: string;
          expiresIn: number;
          userId: string;
          username: string;
          message: string;
          hasFilled: boolean;
        }>(environment.hostURL + '/api/auth/login', authData)
        .toPromise();
      const usernameValue = response.username;
      const token = response.token;
      this.token = token;
      if (token) {
        let hasFilled = 'false';
        if (response.hasFilled) {
          hasFilled = 'true';
        } else {
          hasFilled = 'false';
        }
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.userId = response.userId;
        const now = new Date();
        const expirationDate = new Date(
          now.getTime() + expiresInDuration * 1000
        );
        this.saveAuthData(
          token,
          expirationDate,
          this.userId,
          usernameValue,
          hasFilled
        );
        this.authStatusListener.next(true);
      }
      const newResponse = {
        message: response.message,
      };
      return Promise.resolve(newResponse);
    } catch (error) {
      this.authStatusListener.next(false);
      throw error;
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.userId = null;
    this.clearAuthData();
    this.router.navigate(['/'], { replaceUrl: true });
  }

  private saveAuthData(
    token: string,
    expirationDate: Date,
    userId: string,
    username: string,
    hasFilled: string
  ) {
    localStorage.setItem('username', username);
    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
    localStorage.setItem('hasFilled', hasFilled);
  }

  private clearAuthData() {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('hasFilled');
  }

  getUsername() {
    const username = localStorage.getItem('username');
    if (!username) {
      return null;
    } else {
      return username;
    }
  }

  private getAuthData() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expirationDate');
    if (!token || !expirationDate || !userId) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
    };
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
}
