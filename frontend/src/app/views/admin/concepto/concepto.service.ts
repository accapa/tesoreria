import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { Pagination } from '../../core/request/request.model';
import { createRequestOption } from '../../core/request/request-util';
import { Concepto, IConcepto } from './concepto.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConceptoService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  save(tables: IConcepto): Observable<IConcepto> {
    return this.http.post<IConcepto>(`${this.resourceUrl}/Concepto/save`, tables);
  }

  find(id: string): Observable<IConcepto> {
    return this.http.get<IConcepto>(`${this.resourceUrl}/Concepto/getById/${id}`);
  }

  query(req?: Pagination): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<IConcepto[]>(`${this.resourceUrl}/Concepto/listWithFilter`, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/Concepto/delete/${id}`);
  }

  downloadExcel(req?: Pagination): Observable<any>  {
    const options = createRequestOption(req);
    return this.http.get(`${this.resourceUrl}/Concepto/listWithFilter_ng`, { params: options, responseType: 'arraybuffer'})
  }

  generarDeuda(concepto: Concepto): Observable<Concepto> {
    return this.http.post<IConcepto>(`${this.resourceUrl}/Concepto/generarDeuda`, concepto);
  }

  listConceptoByGrupo(idGrupo: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.resourceUrl}/Concepto/listConceptoByGrupo/${idGrupo}`);
  }

  listTipoCombo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.resourceUrl}/Concepto/listTipoCombo`);
  }
}
