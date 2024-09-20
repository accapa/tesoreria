import { ModelBase } from "../../shared/base/base.model";

export const primaryKeyForArchivo = 'idArchivo';

export interface IArchivo extends ModelBase {
    idArchivo: number | null;
    id_venta: string | null;
    fechaIngreso: string | null;
    fecha_registro: string | null;
    formula: string | null; //quitar cuando se haya modificado en la tabla por ESTADO
    observacion: string | null;
    dni_cliente: string | null;
    fotos: number | null;
}

export class Archivo implements IArchivo {
    constructor(
        public idArchivo: number | null,
        public id_venta: string | null,
        public fechaIngreso: string | null,
        public fecha_registro: string | null,
        public formula: string | null,
        public observacion: string | null,
        public dni_cliente: string | null,
        public fotos: number | null,

        public row_num: number | null,
        public fechaRegistro: string | null,
        public usuarioReg: string | null,
        public fechaModifica: string | null,
        public usuarioMod: string | null,
        public estado: string | null,

    ) { }
}
