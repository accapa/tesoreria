export interface IEstadoFinancieroDto {
  fecha: string | '';
  mov: string | '';
  glosa: string | '';
  debito: number | 0;
  credito: number | 0;
}

export class EstadoFinancieroDto implements IEstadoFinancieroDto {
  constructor(
    public fecha: string | '',
    public mov: string | '',
    public glosa: string | '',
    public debito: number | 0,
    public credito: number | 0,
  ) { }
}
