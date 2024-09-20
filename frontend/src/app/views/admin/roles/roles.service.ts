import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

}
