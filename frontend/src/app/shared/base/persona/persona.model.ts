
export interface IPersona {
    nombres: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
}

export class Persona implements IPersona {
    constructor(
        public nombres: string | null,
        public apellidoPaterno: string | null,
        public apellidoMaterno: string | null,
    ) { }
}
