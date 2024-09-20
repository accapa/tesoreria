import { ActivoDto } from "./activo.dto";

export interface IActaIngresoDto {
  nroDocumento: string | null;
  fechaCompra: string | null;
  nro_comprobante: string | null;
  proveedor: string | null;
  observacion: string | null;
  _fechaRegistro: string | null;
  usuarioReg: string | null;
  activos: Array<ActivoDto>
}

export class ActaIngresoDto implements IActaIngresoDto {
  constructor(
    public nroDocumento: string | null,
    public fechaCompra: string | null,
    public nro_comprobante: string | null,
    public proveedor: string | null,
    public observacion: string | null,
    public _fechaRegistro: string | null,
    public usuarioReg: string | null,
    public activos: Array<ActivoDto>
  ) { }
}
