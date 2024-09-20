
export interface IMantenimientoDto {
  fechaMant: string | null;
  tipo: string | null;
  estado: string | null;
  proveedor: string | null;
  costo: string | null;
  observacion: string | null;
}

export class MantenimientoDto implements IMantenimientoDto {
  constructor(
    public fechaMant: string | null,
    public tipo: string | null,
    public estado: string | null,
    public proveedor: string | null,
    public costo: string | null,
    public observacion: string | null,
  ) { }
}
