import { Egreso } from "../../egreso/egreso.model";

export interface IBalanceGrupoDto {
  idConcepto: string | null;
  concepto: string | null;
  total: number | 0;
  egresos: Egreso[];
}

export class BalanceGrupoDto implements IBalanceGrupoDto {
  constructor(
    public idConcepto: string | null,
    public concepto: string | null,
    public total: number | 0,
    public egresos: Egreso[],
  ) { }
}
