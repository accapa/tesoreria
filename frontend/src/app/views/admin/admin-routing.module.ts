import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GrupoComponent } from './grupo/grupo.component';
import { UsuarioComponent } from './usuario/usuario.component';
import { primaryKey } from './usuario/usuario.model';
import { Roles } from 'src/app/shared/base/roles.enum';
import { authGuard } from 'src/app/auth.guard';
import { primaryKeyGru } from './grupo/grupo.model';
import { AlumnoComponent } from './alumno/alumno.component';
import { ConceptoComponent } from './concepto/concepto.component';
import { primaryKeyAlumno } from './alumno/alumno.model';
import { primaryKeyProd } from '../admin/concepto/concepto.model';

const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    data: {
      title: 'Administración',
      roles: [Roles.Admin],
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'colors',
      },
      {
        path: 'grupo',
        canActivate: [authGuard],
        component: GrupoComponent,
        data: {
          title: 'Grupo',
          defaultSort: `${primaryKeyGru},desc`,
          roles: [Roles.Admin],
        },
      },
      {
        path: 'usuario',
        canActivate: [authGuard],
        component: UsuarioComponent,
        data: {
          title: 'Usuarios',
          defaultSort: `${primaryKey},desc`,
          roles: [Roles.Admin],
        },
      },
      {
        path: 'alumno',
        canActivate: [authGuard],
        component: AlumnoComponent,
        data: {
          title: 'Alumno',
          defaultSort: `${primaryKeyAlumno},desc`,
          roles: [Roles.Admin]
        }
      },
      {
        path: 'concepto',
        canActivate: [authGuard],
        component: ConceptoComponent,
        data: {
          title: 'Concepto',
          defaultSort: `${primaryKeyProd},desc`,
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
export class AdminRoutingModule {}
