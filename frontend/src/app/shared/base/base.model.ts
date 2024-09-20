export class ModelBase {
  fechaRegistro: string | null;
  usuarioReg: string | null;
  fechaModifica: string | null;
  usuarioMod: string | null;
  estado: string | null;
  row_num: number | null;

  constructor(fechaRegistro: string, usuarioReg: string, fechaModifica: string, usuarioMod: string, estado: string, row_num: number) {
    this.fechaRegistro = fechaRegistro;
    this.usuarioReg = usuarioReg;
    this.fechaModifica = fechaModifica;
    this.usuarioMod = usuarioMod;
    this.estado = estado;
    this.row_num = row_num;
  }
}