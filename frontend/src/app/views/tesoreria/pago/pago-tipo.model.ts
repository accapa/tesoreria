import { ModelBase } from '../../../shared/base/base.model';

export const primaryKeyPt = 'idPagoTipo';

export interface IPagoTipo extends ModelBase {
  idPagoTipo: number | null;
  tipo: number;
}

export class PagoTipo implements IPagoTipo {
  constructor(
    public idPagoTipo: number | null,
    public tipo: number,

    public row_num: number | null,
    public fechaRegistro: string | null,
    public usuarioReg: string | null,
    public fechaModifica: string | null,
    public usuarioMod: string | null,
    public estado: string | null,
  ) { }
}
