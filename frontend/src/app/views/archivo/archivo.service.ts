import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../core/config/application-config.service';
import { Pagination } from '../core/request/request.model';
import { createRequestOption } from '../core/request/request-util';
import { IArchivo } from './archivo.model';
import { environment } from '../../../../src/environments/environment';
import { FormBuilder } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ArchivoService {
  public resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService, private fb: FormBuilder) { }

  save(data: FormData): Observable<IArchivo> {
    return this.http.post<IArchivo>(`${this.resourceUrl}/Archivo/save`, data);
  }

  find(id: number): Observable<IArchivo> {
    return this.http.get<IArchivo>(`${this.resourceUrl}/Archivo/getById/${id}`);
  }

  query(req?: Pagination): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<IArchivo[]>(`${this.resourceUrl}/Archivo/listWithFilter`, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/Archivo/delete/${id}`);
  }

  listArchivosByPago(idPago: string, tipo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.resourceUrl}/Archivo/listByIdActivo/${idPago}/${tipo}`);
  }
}
