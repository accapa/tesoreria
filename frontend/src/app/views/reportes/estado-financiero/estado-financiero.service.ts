import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../core/request/request.model';
import { createRequestOption } from '../../core/request/request-util';

@Injectable({ providedIn: 'root' })
export class EstadoFinancieroService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  initForm(): Observable<any> {
    return this.http.get<any>(`${this.resourceUrl}/Reportes/initForm`, { observe: 'body' });
  }

  estado(data: FormData): Observable<any> {
    return this.http.post<any>(`${this.resourceUrl}/Reportes/estado`, data);
  }
  
  query(req?: Pagination): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<any>(`${this.resourceUrl}/Reportes/listWithFilter`, { params: options, observe: 'body' });
  }

  downloadExcel(req?: Pagination): Observable<any>  {
    const options = createRequestOption(req);
    return this.http.get(`${this.resourceUrl}/Reportes/listConsumo`, { params: options, responseType: 'arraybuffer'})
  }

  listPeriodoByAlumno(idAlumno: number): Observable<any> {
    return this.http.get<any>(`${this.resourceUrl}/Reportes/listPeriodoByAlumno/${idAlumno}`);
  }
}
