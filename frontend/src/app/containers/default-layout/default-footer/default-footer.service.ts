import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../../views/core/config/application-config.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FooterService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  getVersion(): Observable<string> {
    return this.http.get<string>(`${this.resourceUrl}/Login/getVersion`);
  }
}
