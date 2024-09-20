export const primaryKey = 'idRole';

export interface IRole {
    idRole: string | null;
    roleNombre: string | null;
}

export class Role implements IRole {
    constructor(
      public idRole: string | null,
      public roleNombre: string | null,

    ) { }
}
