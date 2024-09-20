import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { Pagination } from '../../core/request/request.model';
import { createRequestOption } from '../../core/request/request-util';
import { IAlumno } from './alumno.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlumnoService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  save(tables: IAlumno): Observable<IAlumno> {
    return this.http.post<IAlumno>(`${this.resourceUrl}/Alumno/save`, tables);
  }

  find(id: string): Observable<IAlumno> {
    return this.http.get<IAlumno>(`${this.resourceUrl}/Alumno/getById/${id}`);
  }

  query(req?: Pagination): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<IAlumno[]>(`${this.resourceUrl}/Alumno/listWithFilter`, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/Alumno/delete/${id}`);
  }

  downloadExcel(req?: Pagination): Observable<any>  {
    const options = createRequestOption(req);
    return this.http.get(`${this.resourceUrl}/Alumno/listWithFilter`, { params: options, responseType: 'arraybuffer'})
  }

  listAlumnoByConcepto(idConcepto: number): Observable<any> {
    return this.http.get<any>(`${this.resourceUrl}/Alumno/listAlumnoByConcepto/${idConcepto}`);
  }

  listAlumnoByGrupo(idGrupo: number): Observable<any> {
    return this.http.get<any>(`${this.resourceUrl}/Alumno/listAlumnoByGrupo/${idGrupo}`);
  }
}
