import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EstadoFinancieroComponent } from './estado-financiero/estado-financiero.component';
import { Roles } from 'src/app/shared/base/roles.enum';
import { authGuard } from 'src/app/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    data: {
      title: 'Reportes',
      roles: [Roles.Admin, Roles.Alumno],
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'estado-financiero'
      },
      {
        path: 'estado-financiero',
        canActivate: [authGuard],
        component: EstadoFinancieroComponent,
        data: {
          title: 'Estado Financiero',
          defaultSort: `cantidad,desc`,
          roles: [Roles.Admin, Roles.Alumno],
        }
      }
    ]
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportesRoutingModule {}

