import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BadgeModule, CardModule, GridModule, TableModule, ButtonModule, FormModule, AlertModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { ChartjsModule } from '@coreui/angular-chartjs';
import { ConfirmDialogService } from '../../shared/confirm/confirm.app.service';

import { EstadoFinancieroComponent } from './estado-financiero/estado-financiero.component';

import { ReportesRoutingModule } from './reportes-routing.module';
import { DocsComponentsModule } from '@docs-components/docs-components.module';
import { NgbdSortableHeader } from '../../shared/sort/NgbdSortableHeader';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [EstadoFinancieroComponent],
  imports: [
    CommonModule,
    ReportesRoutingModule,
    ChartjsModule,
    CardModule,
    GridModule,
    IconModule,
    BadgeModule,
    DocsComponentsModule, //todo: quitar
    NgbdSortableHeader,
    TableModule,
    NgSelectModule,
    ReactiveFormsModule,
    ButtonModule,
    FormModule, AlertModule
  ],
  providers: [ ConfirmDialogService ]
})
export class ReportesModule {
}
