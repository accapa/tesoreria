import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule, GridModule, ButtonModule, ModalModule, FormModule, CollapseModule, TableModule, SpinnerModule} from '@coreui/angular';

import { IconModule } from '@coreui/icons-angular';

import { GrupoComponent } from './grupo/grupo.component';
import { UsuarioComponent } from './usuario/usuario.component';

import { ConceptoComponent } from '../admin/concepto/concepto.component';
import { AlumnoComponent } from './alumno/alumno.component';


import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../../shared/confirm/confirm.app.service';
import { NgbdSortableHeader } from '../../shared/sort/NgbdSortableHeader';
// Theme Routing
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  declarations: [
    GrupoComponent,
    UsuarioComponent,
    ConceptoComponent,
    AlumnoComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    CardModule,
    GridModule,
    ButtonModule,
    IconModule,
    NgbPaginationModule,
    TableModule,
    NgbdSortableHeader,
    ModalModule,
    FormModule,
    CollapseModule,
    NgSelectModule,
    ReactiveFormsModule, SpinnerModule
  ],
  providers: [ ConfirmDialogService ]
})
export class AdminModule {
}
