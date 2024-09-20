import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { Pagination } from '../../core/request/request.model';
import { createRequestOption } from '../../core/request/request-util';
import { IGrupo } from './grupo.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  save(tables: IGrupo): Observable<IGrupo> {
    return this.http.post<IGrupo>(`${this.resourceUrl}/Grupo/save`, tables);
  }

  find(id: string): Observable<IGrupo> {
    return this.http.get<IGrupo>(`${this.resourceUrl}/Grupo/getById/${id}`);
  }

  query(req?: Pagination): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<IGrupo[]>(`${this.resourceUrl}/Grupo/listWithFilter`, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/Grupo/delete/${id}`);
  }

  listGrupoCombo(): Observable<IGrupo> {
    return this.http.get<any>(`${this.resourceUrl}/Grupo/listGrupo`);
  }

  downloadExcel(req?: Pagination): Observable<any>  {
    const options = createRequestOption(req);
    return this.http.get(`${this.resourceUrl}/Grupo/listWithFilter`, { params: options, responseType: 'arraybuffer'})
  }
}
