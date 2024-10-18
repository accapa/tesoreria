export interface IEgresoDto {
  observacion: string | null;
  monto: number | 0;
}

export class EgresoDto implements IEgresoDto {
  constructor(
    public observacion: string | null,
    public monto: number | 0,
  ) { }
}
