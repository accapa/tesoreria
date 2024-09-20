import { ModelBase } from "../../../shared/base/base.model";

export const primaryKeyCompra = 'idDeuda';

export interface IDeuda extends ModelBase {
  idDeuda: number;
  idAlumno: number | null;
  idConcepto: number | null;
  monto: number;
  montoRestante: number;
  concepto: string | null;
  estadoDeuda: string | null;
  selected: boolean | false;
}

export class Deuda implements IDeuda {
  constructor(
    public idDeuda: number,
    public idAlumno: number | null,
    public idConcepto: number | null,
    public monto: number,
    public montoRestante: number,
    public concepto: string | null,
    public estadoDeuda: string | null,
    public selected: boolean | false, // usado para seleccionar registro en el modulo de asignacion

    public row_num: number| null,
    public fechaRegistro: string| null,
    public usuarioReg: string| null,
    public fechaModifica: string| null,
    public usuarioMod: string| null,
    public estado: string| null,
  ) { }
}
