import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../../core/config/application-config.service';
import { Pagination } from '../../../core/request/request.model';
import { createRequestOption } from '../../../core/request/request-util';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlumnoConceptoService {
  public resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  alumnoConcepto(req: any): Observable<any>  {
    return this.http.post<any>(`${this.resourceUrl}/Reportes/alumnoConcepto`, req);
  }

  repMantenimiento(req?: Pagination): Observable<any>  {
    const options = createRequestOption(req);
    return this.http.get(`${this.resourceUrl}/activosFijos/Activo/reporteMantenimiento`, { params: options, responseType: 'arraybuffer'})
  }
  
  listEstado(): Observable<any>  {
    return this.http.get(`${this.resourceUrl}/Reportes/listEstado`)
  }
}
