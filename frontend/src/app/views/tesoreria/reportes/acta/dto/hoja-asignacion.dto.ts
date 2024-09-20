
export interface IHojaVidaAsigDto {
  nroDocumento: string | null;
  fechaAsignacion: string | null;
  custodio: string | null;
  area: string | null;
  estado: string | null;
  observacion: string | null;
}

export class HojaVidaAsigDto implements IHojaVidaAsigDto {
  constructor(
    public nroDocumento: string | null,
    public fechaAsignacion: string | null,
    public custodio: string | null,
    public area: string | null,
    public estadoActivo: string | null,
    public estado: string | null,
    public observacion: string | null,
  ) { }
}





