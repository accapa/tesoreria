import { ModelBase } from "src/app/shared/base/base.model";
import { Deuda } from "../../tesoreria/deuda/deuda.model";

export const primaryKeyProd = 'idConcepto';

export interface IConcepto extends ModelBase {
    idConcepto: number | null;
    idGrupo: string | null;
    tipo: string | null;
    concepto: string | null;
    monto: number;
    grupoDescripcion: string | null;
    fechaGenera: string | null;
    deudas: Deuda[] | [];
}

export class Concepto implements IConcepto {
    constructor(
        public idConcepto: number | null,
        public idGrupo: string | null,
        public tipo: string | null,
        public concepto: string | null,
        public monto: number,
        public grupoDescripcion: string | null,
        public fechaGenera: string | null,
        public deudas: Deuda[] | [],

        public row_num: number | null,
        public fechaRegistro: string | null,
        public usuarioReg: string | null,
        public fechaModifica: string | null,
        public usuarioMod: string | null,
        public estado: string | null,
    ) { }
}
