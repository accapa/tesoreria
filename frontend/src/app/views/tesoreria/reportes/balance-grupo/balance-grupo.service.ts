import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../../core/config/application-config.service';
import { environment } from '../../../../../environments/environment';
import { IBalanceGrupoDto } from './balance-grupo.dto';

@Injectable({ providedIn: 'root' })
export class BalanceGrupoService {
  public resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  balanceGrupo(req: any): Observable<IBalanceGrupoDto>  {
    return this.http.post<IBalanceGrupoDto>(`${this.resourceUrl}/Reportes/balanceGrupo`, req);
  }
}
