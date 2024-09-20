import { ModelBase } from "src/app/shared/base/base.model";

export const primaryKeyAsig = 'idEgreso';

export interface IEgreso extends ModelBase {
  idEgreso: number | null;
  concepto: string | null;
  observacion: string | null;
  operacion: string | null;
  monto: number;
  fechaComprobante: string | null;
}

export class Egreso implements IEgreso {
  constructor(
    public idEgreso: number | null,
    public concepto: string | null,
    public observacion: string | null,
    public operacion: string | null,
    public monto: number,
    public fechaComprobante: string | null,

    public row_num: number | null,
    public fechaRegistro: string | null,
    public usuarioReg: string | null,
    public fechaModifica: string | null,
    public usuarioMod: string | null,
    public estado: string | null,
  ) { }
}
