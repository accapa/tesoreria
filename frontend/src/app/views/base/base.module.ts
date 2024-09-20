import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// CoreUI Modules
import {ButtonModule, ModalModule, ToastModule} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';

// views
import { BaseComponent } from '../base/base.component';

// Components Routing
import { BaseRoutingModule } from './base-routing.module';
import { NgxSpinnerModule } from "ngx-spinner";
import { AppToastComponent } from '../../shared/toast/toast.app.component';
import { ConfirmDialogComponent } from '../../shared/confirm/confirm.app.component';
import { ConfirmDialogService } from '../../shared/confirm/confirm.app.service';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  imports: [
    CommonModule, NgxSpinnerModule, ModalModule, ToastModule, NgSelectModule,
    BaseRoutingModule,
    ButtonModule,
    IconModule,
  ],
  declarations: [
    BaseComponent,
    AppToastComponent, 
    ConfirmDialogComponent
  ],
  providers: [ ConfirmDialogService ],
})
export class BaseModule {}
