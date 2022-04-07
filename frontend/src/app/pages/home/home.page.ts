import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  username: string = '';
  private usernameStatusSub: Subscription;
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private menu: MenuController,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.username = this.authService.getUsername();
    if (this.username === null) {
      this.username = '';
    }
    this.usernameStatusSub = this.userService
      .getUsernameStatusListener()
      .subscribe((u) => {
        this.username = u;
      });
  }
  onClickLogout() {
    this.authService.logout();
    this.menu.close();
  }
  onClickNavigate(path: string) {
    this.userService.getHasFilledFromBackend().then((result) => {
      if (!result.hasFilled && result.hasFilled !== undefined) {
        this.router.navigate(['/app/survey'], { replaceUrl: true });
      } else {
        this.router.navigate([path], { replaceUrl: true });
      }
      this.menu.close();
    });
  }

  ngOnDestroy() {
    this.elementRef.nativeElement.remove();
    this.usernameStatusSub.unsubscribe();
  }
}
