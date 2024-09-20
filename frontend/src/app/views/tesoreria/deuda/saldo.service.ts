import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { environment } from '../../../../environments/environment';
import { ISaldo } from './saldo.model';

@Injectable({ providedIn: 'root' })
export class SaldoService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  save(compra: ISaldo): Observable<ISaldo> {
    return this.http.post<ISaldo>(`${this.resourceUrl}/Saldo/save`, compra);
  }

  find(id: number): Observable<ISaldo> {
    return this.http.get<ISaldo>(`${this.resourceUrl}/Saldo/getById/${id}`);
  }

  delete(id: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/Saldo/delete/${id}`);
  }

  listSaldoByIdAlumno(idAlumno: number): Observable<ISaldo[]> {
    return this.http.get<ISaldo[]>(`${this.resourceUrl}/Saldo/listSaldoByIdAlumno/${idAlumno}`);
  }
}
