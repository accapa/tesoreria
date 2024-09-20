import { ModelBase } from "src/app/shared/base/base.model";

export const primaryKeyAlumno = 'idAlumno';

export interface IAlumno extends ModelBase {
    idAlumno: number | null;
    idGrupo: number | null;
    dni: string | null;
    nombres: string | null;
    apellidos: string | null;
    grupoDescripcion: string | null;
}

export class Alumno implements IAlumno {
    constructor(
        public idAlumno: number | null,
        public idGrupo: number | null,
        public dni: string | null,
        public nombres: string | null,
        public apellidos: string | null,
        public grupoDescripcion: string | null,

        public row_num: number | null,
        public fechaRegistro: string | null,
        public usuarioReg: string | null,
        public fechaModifica: string | null,
        public usuarioMod: string | null,
        public estado: string | null,
    ) { }
}
