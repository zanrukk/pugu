import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { IsLoggedGuard } from './guards/is-logged.guard';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { CreateToDoPage } from './pages/create-to-do/create-to-do.page';
import { EditToDoComponent } from './pages/edit-to-do/edit-to-do.component';
import { HomePage } from './pages/home/home.page';
import { OutdatedToDoComponent } from './pages/outdated-to-do/outdated-to-do.component';
import { SurveyComponent } from './pages/survey/survey.component';
import { ToDoListComponent } from './pages/to-do-list/to-do-list.component';
import { ToDoComponent } from './pages/to-do/to-do.component';
import { UpdateProfileComponent } from './pages/update-profile/update-profile.component';
import { VerifyComponent } from './pages/verify/verify.component';
import { WorksDoneComponent } from './pages/works-done/works-done.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
    canActivate: [IsLoggedGuard],
  },
  {
    path: 'signup',
    loadChildren: () =>
      import('./pages/signup/signup.module').then((m) => m.SignupPageModule),
    canActivate: [IsLoggedGuard],
  },
  {
    path: 'verify/:userId',
    component: VerifyComponent,
    canActivate: [IsLoggedGuard],
  },
  {
    path: 'recover/:userId',
    component: VerifyComponent,
    canActivate: [IsLoggedGuard],
  },
  {
    path: 'change-password/:userId/:code',
    component: ChangePasswordComponent,
    canActivate: [IsLoggedGuard],
  },
  {
    path: 'app',
    component: HomePage,
    children: [
      {
        path: '',
        component: ToDoListComponent,
      },
      {
        path: 'create-to-do',
        component: CreateToDoPage,
      },
      {
        path: 'to-do/:id/:color',
        component: ToDoComponent,
      },
      {
        path: 'edit-to-do/:id',
        component: EditToDoComponent,
      },
      {
        path: 'update-profile',
        component: UpdateProfileComponent,
      },
      {
        path: 'survey',
        component: SurveyComponent,
      },
      {
        path: 'works-done',
        component: WorksDoneComponent,
      },
      {
        path: 'outdated-todos',
        component: OutdatedToDoComponent,
      },
    ],
    canActivate: [AuthGuard],
  },
  // FOLLOWING OBJs SHOULD STAY AT THE END
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadChildren: () =>
      import('./pages/not-found/not-found.module').then(
        (m) => m.NotFoundPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
  providers: [AuthGuard, IsLoggedGuard],
})
export class AppRoutingModule {}
