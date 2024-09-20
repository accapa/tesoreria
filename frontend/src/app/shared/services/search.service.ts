import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
//Sirve para abrir y cerrar el modal compartiendo informacion entre 2 a mas componentes
@Injectable({ providedIn: 'root' })
export class SearchService {
  private modalSubject = new Subject<any>();

  openModal(data: any): void {
    this.modalSubject.next({ action: 'open', data });
  }

  closeModal(data: any): void {
    this.modalSubject.next({ action: 'close', data });
  }

  onModalAction(): Observable<any> {
    return this.modalSubject.asObservable();
  }
}
