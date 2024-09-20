import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { Roles } from 'src/app/shared/base/roles.enum';
import { authGuard } from 'src/app/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: DashboardComponent,
    data: {
      title: $localize`Dashboard`,
      //roles: [Roles.Admin], //Si no se indica ROLES entonces es para todos los roles
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
}
