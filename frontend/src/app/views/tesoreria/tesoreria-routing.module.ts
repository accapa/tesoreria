import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PagoComponent } from './pago/pago.component';
import { DeudaComponent } from './deuda/deuda.component';
import { DeudaListComponent } from './deuda-list/deuda-list.component';
import { EgresoComponent } from './egreso/egreso.component';
import { ExcelComponent } from './reportes/export-excel/excel.component';
import { ActaComponent } from './reportes/acta/acta.component';
import { primaryKeyAsig } from './egreso/egreso.model';
import { primaryKeyActivo } from './pago/pago.model';
import { primaryKeyAlumno } from '../admin/alumno/alumno.model';
import { authGuard } from 'src/app/auth.guard';
import { Roles } from 'src/app/shared/base/roles.enum';

const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    data: {
      title: 'Tesorería',
      roles: [Roles.Admin],
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pagos'
      },
      
      {
        path: 'pagos/acta/:id/:acta',
        canActivate: [authGuard],
        component: ActaComponent,
        data: {
          title: 'Hoja de vida',
          roles: [Roles.Admin]
        }
      },
      {
        path: 'deuda/:idAlumno',
        canActivate: [authGuard],
        component: DeudaComponent,
        data: {
          title: 'Pagar deuda',
          roles: [Roles.Admin]
        }
      },
      {
        path: 'deuda/acta/:id/:acta',
        canActivate: [authGuard],
        component: ActaComponent,
        data: {
          title: 'Acta de ingreso',
          roles: [Roles.Admin]
        }
      },
      {
        path: 'deuda-list',
        canActivate: [authGuard],
        component: DeudaListComponent,
        data: {
          title: 'Deuda alumno',
          defaultSort: `${primaryKeyAlumno},desc`,
          roles: [Roles.Admin]
        }
      },
      {
        path: 'pagos',
        canActivate: [authGuard],
        component: PagoComponent,
        data: {
          title: 'Otros ingresos',
          defaultSort: `${primaryKeyActivo},desc`,
          roles: [Roles.Admin],
        }
      },
      {
        path: 'egresos',
        canActivate: [authGuard],
        component: EgresoComponent,
        data: {
          title: 'Egresos',
          defaultSort: `${primaryKeyAsig},desc`,
          roles: [Roles.Admin],
        }
      },
      {
        path: 'cambio-estado/acta/:id/:acta',
        canActivate: [authGuard],
        component: ActaComponent,
        data: {
          title: 'Documento de cambio de estado',
          roles: [Roles.Admin]
        }
      },
      {
        path: 'reportes',
        canActivate: [authGuard],
        component: ExcelComponent,
        data: {
          title: 'Reportes',
          defaultSort: `${primaryKeyActivo},desc`,
          roles: [Roles.Admin],
        }
      },  
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivoFijoRoutingModule {
}
