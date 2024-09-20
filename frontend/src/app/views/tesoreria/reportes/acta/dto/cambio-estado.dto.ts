import { ActivoDto } from "./activo.dto";

export interface ICambioEstadoDto {
  nroDocumento: string | null;
  _fechaDocumento: string | null;
  observacion: string | null;
  activos: Array<ActivoDto>
}

export class CambioEstadoDto implements ICambioEstadoDto {
  constructor(
    public nroDocumento: string | null,
    public _fechaDocumento: string | null,
    public observacion: string | null,
    public activos: Array<ActivoDto>
  ) { }
}
