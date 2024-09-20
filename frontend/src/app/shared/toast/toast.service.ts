import { Injectable, ViewChild } from '@angular/core';
import { ToasterComponent } from '@coreui/angular';
import { AppToastComponent } from './toast.app.component';
import { ToastMessage } from './toast.message.interface';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  @ViewChild(ToasterComponent) toaster!: ToasterComponent;

  public setToaster(toaster: ToasterComponent) {
    this.toaster = toaster;
  }

  public addToast(param: ToastMessage | any) { //ToastMessage: para saber los nombres de los parametros
    if (this.toaster) {
      this.toaster.addToast(AppToastComponent, { ...Object.assign({ title: 'Aviso', color: 'secondary' }, param) });
    } else {
      console.error('ToasterService: toaster is not set');
    }
  }

  public onError(e: any): void {
    this.addToast({ title: e.status === 500 ? 'Error' : 'Aviso', color: e.status === 500 ? 'danger' : 'warning', msg: (!e.ok ? (typeof e.error === 'string' ? e.error : (e.error !== null ? e.error.text : e.statusText)) : e.statusText) });
    if (e.status === 401) {
      console.error('Sesion caducada');
      window.location.href = '#/login';
    }
  }
}
