import { ModelBase } from "../../../shared/base/base.model";

export const primaryKeySaldo = 'idSaldo';

export interface ISaldo extends ModelBase {
  idSaldo: number;
  idAlumno: number;
  idPago: number;
  monto: number;
  operacion: string | '';
  selected: boolean | false;
}

export class Saldo implements ISaldo {
  constructor(
    public idSaldo: number,
    public idAlumno: number,
    public idPago: number,
    public monto: number,
    public operacion: string | '',
    public selected: boolean | false, // usado para seleccionar registro en el modulo de asignacion

    public row_num: number| null,
    public fechaRegistro: string| null,
    public usuarioReg: string| null,
    public fechaModifica: string| null,
    public usuarioMod: string| null,
    public estado: string| null,
  ) { }
}
