import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'
import { DeudaComponent } from './deuda/deuda.component';
import { EgresoComponent } from './egreso/egreso.component';
import { PagoComponent } from './pago/pago.component';
import { ActaComponent } from './reportes/acta/acta.component';
import { DeudaListComponent } from './deuda-list/deuda-list.component';
import { ExcelComponent } from './reportes/export-excel/excel.component';

import { ActivoFijoRoutingModule } from './tesoreria-routing.module';
import { CardModule, GridModule, ButtonModule, TableModule, ModalModule, FormModule, CollapseModule, NavModule, AlertModule  } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbdSortableHeader } from '../../shared/sort/NgbdSortableHeader';
import { ConfirmDialogService } from '../../shared/confirm/confirm.app.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    DeudaComponent,
    PagoComponent,
    EgresoComponent, ActaComponent, ExcelComponent, DeudaListComponent
  ],
  imports: [FormsModule,
    CommonModule,
    ActivoFijoRoutingModule,
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
    NavModule,
    AlertModule,
    NgSelectModule,
    ReactiveFormsModule,
    NgbCarouselModule
  ],
  providers: [ ConfirmDialogService ]
})
export class ActivoFijoModule {
}
