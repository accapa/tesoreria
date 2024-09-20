import { HojaVidaAsigDto } from "./hoja-asignacion.dto";
import { MantenimientoDto } from "./hoja-mantenimiento.dto";

export interface IHojaVida {
  codigo: string | null;
  fechaHoy: string | null;
  descripcion: string | null;
  marca: string | null;
  modelo: string | null;
  nro_serie: string | null;
  estadoActivo: string | null;
  observacion: string | null;

  custodio: string | null;
  sucursal: string | null;
  ubicacion: string | null;
  categoria: string | null;
  subCategoria: string | null;

  comprobante: string | null;
  nro_comprobante: string | null;
  fechaCompra: string | null;
  valorCompra: number | 0;
  vidaUtil: number | 0;
  fechaDepreciacion: string | null;
  nroDocumento: string | null; //nro de compra
  proveedor: string | null;
  aseguradora: string | null;
  nroPoliza: string | null;
  fechaIniSeguro: string | null;
  fechaFinSeguro: string | null;
  montoSeguro: string | null;
  movimientos: Array<HojaVidaAsigDto>;
  mantenimientos: Array<MantenimientoDto>;
}

export class HojaVida implements IHojaVida {
  constructor(
    public codigo: string | null,
    public fechaHoy: string | null,
    public descripcion: string | null,
    public marca: string | null,
    public modelo: string | null,
    public nro_serie: string | null,
    public estadoActivo: string | null,
    public observacion: string | null,

    public custodio: string | null,
    public sucursal: string | null,
    public ubicacion: string | null,
    public categoria: string | null,
    public subCategoria: string | null,

    public comprobante: string | null,
    public nro_comprobante: string | null,
    public fechaCompra: string | null,
    public valorCompra: number | 0,
    public vidaUtil: number | 0,
    public fechaDepreciacion: string | null,
    public nroDocumento: string | null, //nro de compra
    public proveedor: string | null,
    public aseguradora: string | null,
    public nroPoliza: string | null,
    public fechaIniSeguro: string | null,
    public fechaFinSeguro: string | null,
    public montoSeguro: string | null,
    public movimientos: Array<HojaVidaAsigDto>,
    public mantenimientos: Array<MantenimientoDto>,
  ) { }
}
