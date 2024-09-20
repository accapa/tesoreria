import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { IUsuario } from '../../admin/usuario/usuario.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  login(usuario: IUsuario): Observable<IUsuario> {
    return this.http.post<IUsuario>(`${this.resourceUrl}/Login/login`, usuario);
  }

  logout(): Observable<any> {
    return this.http.get<any>(`${this.resourceUrl}/Login/logout`);
  }
  
  getVersion(): Observable<string> {
    return this.http.get<string>(`${this.resourceUrl}/Login/getVersion`);
  }
}
