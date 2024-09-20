export const primaryKey = 'idUsuario';

export interface IUsuario {
    idUsuario: number | null;
    idGrupo: number | null;
    nombres: string | null;
    apellidos: string | null;
    dni: string | null;
    usuario: string | null;
    contraenna: string | null;
    celular: string | null;
    direccion: string | null;
    correo: string | null;
    sucursal: string | null;
    roles: string | null;
    estado: string | null;
    fechaRegistro: string | null;
    row_num: string | null;
}

export class Usuario implements IUsuario {
    constructor(
      public idUsuario: number | null,
      public idGrupo: number | null,
      public nombres: string | null,
      public apellidos: string | null,
      public dni: string | null,
      public usuario: string | null,
      public contraenna: string | null,
      public celular: string | null,
      public direccion: string | null,
      public correo: string | null,
      public sucursal: string | null,
      public roles: string | null,
      public estado: string | null,
      public fechaRegistro: string | null,
      public row_num: string | null

    ) { }
}
