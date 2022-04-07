import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { SharedModule } from './shared/shared.module';
import { HomePage } from './pages/home/home.page';
import { ToDoListComponent } from './pages/to-do-list/to-do-list.component';
import { VerifyComponent } from './pages/verify/verify.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UpdateProfileComponent } from './pages/update-profile/update-profile.component';
import { SurveyComponent } from './pages/survey/survey.component';
import { MatSliderModule } from '@angular/material/slider';
import { WorksDoneComponent } from './pages/works-done/works-done.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { CreateToDoPage } from './pages/create-to-do/create-to-do.page';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OutdatedToDoComponent } from './pages/outdated-to-do/outdated-to-do.component';
import { ToDoComponent } from './pages/to-do/to-do.component';
import { EditToDoComponent } from './pages/edit-to-do/edit-to-do.component';
import { MatSelectModule } from '@angular/material/select';
import { NgxCaptchaModule } from 'ngx-captcha';

@NgModule({
  declarations: [
    AppComponent,
    HomePage,
    ToDoListComponent,
    VerifyComponent,
    ChangePasswordComponent,
    UpdateProfileComponent,
    SurveyComponent,
    WorksDoneComponent,
    CreateToDoPage,
    OutdatedToDoComponent,
    ToDoComponent,
    EditToDoComponent,
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSelectModule,
    NgxCaptchaModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
