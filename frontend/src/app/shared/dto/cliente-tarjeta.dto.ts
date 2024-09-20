

export interface IClienteTarjetaPuntos {
    id_cliente: string | null;
    dni: string | null;
    apellidos: string | null;
    nombres: string | null;
    cantVales: number | 0;
    codigo_barra: string | null;
    fecha_caducidad: string | null;
    fecha_registro: string | null;
    id_cliente_tarjeta: string | null;
    id_estado: string | null;
    id_tarjeta_tipo: string | null;
    puntos: string | null;
    tarjeta_tipo: string | null;
    tipo_vale_adquirido: string | null;
}

export class ClienteTarjetaPuntos implements IClienteTarjetaPuntos {
    constructor(
        public id_cliente: string | null,
        public dni: string | null,
        public apellidos: string | null,
        public nombres: string | null,
        public cantVales: number | 0,
        public codigo_barra: string | null,
        public fecha_caducidad: string | null,
        public fecha_registro: string | null,
        public id_cliente_tarjeta: string | null,
        public id_estado: string | null,
        public id_tarjeta_tipo: string | null,
        public puntos: string | null,
        public tarjeta_tipo: string | null,
        public tipo_vale_adquirido: string | null,

    ) { }
}
