import { ModelBase } from "src/app/shared/base/base.model";

export const primaryKeyGru = 'idGrupo';

export interface IGrupo extends ModelBase {
    idGrupo: number | null;
    nombre: string| null;
    descripcion: string| null;
    
}

export class Grupo implements IGrupo {
    constructor(
        public idGrupo: number | null,
        public nombre: string | null,
        public descripcion: string | null,

        public row_num: number | null,
        public fechaRegistro: string | null,
        public usuarioReg: string | null,
        public fechaModifica: string | null,
        public usuarioMod: string | null,
        public estado: string | null,
    ) { }
}
