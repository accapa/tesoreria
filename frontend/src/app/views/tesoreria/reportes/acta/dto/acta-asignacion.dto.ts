import { ActivoDto } from "./activo.dto";

export interface IActaAsignacion {
  nroDocumento: string | null;
  trabEntrega: string | null;
  trabRecibe: string | null;
  dniEntrega: string | null;
  dniRecibe: string | null;
  observacion: string | null;
  _fechaRegistro: string | null;
  usuarioReg: string | null;
  activos: Array<ActivoDto>
}

export class ActaAsignacion implements IActaAsignacion {
  constructor(
    public nroDocumento: string | null,
    public trabEntrega: string | null,
    public trabRecibe: string | null,
    public dniEntrega: string | null,
    public dniRecibe: string | null,
    public observacion: string | null,
    public _fechaRegistro: string | null,
    public usuarioReg: string | null,
    public activos: Array<ActivoDto>
  ) { }
}
