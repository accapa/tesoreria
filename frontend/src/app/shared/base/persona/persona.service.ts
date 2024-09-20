import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../../views/core/config/application-config.service';
import { IPersona } from './persona.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PersonaService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  getByDni(dni: string): Observable<IPersona> {
    return this.http.get<IPersona>(`${this.resourceUrl}/Persona/getByDni/${dni}`);
  }
  getPersonaFromApi(dni: string): Observable<IPersona> {
    return this.http.get<IPersona>(`${this.resourceUrl}/Persona/getPersonaFromApi/${dni}`);
  }
}
