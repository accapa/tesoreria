import { ModelBase } from '../../../shared/base/base.model';

export const primaryKeyActivo = 'idPago';

export interface IPago extends ModelBase {
  idPago: number | null;
  monto: number;
  fechaPago: string | null;
  observacion: string | null;
  alumno: string | null;
  operacion: string | null;
  grupo: string | '';
  selected: boolean | false;
}

export class Pago implements IPago {
  constructor(
    public idPago: number | null,
    public monto: number,
    public fechaPago: string | null,
    public observacion: string | null,
    public alumno: string | null,
    public operacion: string | null,
    public grupo: string | '',
    public selected: boolean | false, // usado para seleccionar registro en el modulo de asignacion

    public row_num: number | null,
    public fechaRegistro: string | null,
    public usuarioReg: string | null,
    public fechaModifica: string | null,
    public usuarioMod: string | null,
    public estado: string | null,
  ) { }
}
