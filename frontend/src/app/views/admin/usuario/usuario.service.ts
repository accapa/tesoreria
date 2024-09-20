import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { Pagination } from '../../core/request/request.model';
import { createRequestOption } from '../../core/request/request-util';
import { IUsuario } from './usuario.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  save(usuario: IUsuario): Observable<IUsuario> {
    return this.http.post<IUsuario>(`${this.resourceUrl}/Usuario/save`, usuario);
  }

  find(id: string): Observable<IUsuario> {
    return this.http.get<IUsuario>(`${this.resourceUrl}/Usuario/getById/${id}`);
  }

  query(req?: Pagination): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<IUsuario[]>(`${this.resourceUrl}/Usuario/listWithFilter`, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/Usuario/delete/${id}`);
  }

  downloadExcel(req?: Pagination): Observable<any>  {
    const options = createRequestOption(req);
    return this.http.get(`${this.resourceUrl}/Usuario/listWithFilter`, { params: options, responseType: 'arraybuffer'})
  }

  listUsuarioCombo(idGrupo: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.resourceUrl}/Usuario/listUsuarioCombo/${idGrupo}`);
  }

  listRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.resourceUrl}/Usuario/listRoles`);
  }

  getByUser(user: string): Observable<IUsuario> {
    return this.http.get<IUsuario>(`${this.resourceUrl}/Usuario/getByUser/${user}`);
  }
}
