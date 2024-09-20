import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BaseComponent } from './base.component';
import { authGuard } from 'src/app/auth.guard';
import { Roles } from 'src/app/shared/base/roles.enum';

const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    data: {
      title: 'Base',
      roles: [Roles.Admin],
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'cards',
      },
      {
        path: 'accordion',
        canActivate: [authGuard],
        component: BaseComponent,
        data: {
          title: 'Accordion',
          roles: [Roles.Admin]
        },
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BaseRoutingModule {}

