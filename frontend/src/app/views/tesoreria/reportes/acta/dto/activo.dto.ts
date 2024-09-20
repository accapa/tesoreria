
export interface IActivoDto {
    codigo: string | null;
    descripcion: string | null;
    marca: string | null;
    nro_serie: string | null;
    estadoActivo: string | null;
    valorCompra: number | 0;
    area: string | null;
    areaOri: string | null;
    areaDes: string | null;
    estadoOri: string | null;
    estadoDes: string | null;
    custodio: string | null;
  }
  
  export class ActivoDto implements IActivoDto {
    constructor(
      public codigo: string | null,
      public descripcion: string | null,
      public marca: string | null,
      public nro_serie: string | null,
      public estadoActivo: string | null,
      public valorCompra: number | 0,
      public area: string | null,
      public areaOri: string | null,
      public areaDes: string | null,
      public estadoOri: string | null,
      public estadoDes: string | null,
      public custodio: string | null,
    ) { }
  }
  