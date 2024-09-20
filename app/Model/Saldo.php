<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Saldo extends Model
{
    protected $table = 'saldo';
    protected $primaryKey = 'idSaldo';
    const CREATED_AT = null;
    const UPDATED_AT = null;
    private $filters = [];

    public function listWithFilter(array $filters): \Illuminate\Database\Query\Builder
    {
        $this->filters = $filters;
        list($column, $sort) = explode(",", $this->filters["sort"] ?? "c.idSaldo,desc");
        $query = DB::table('saldo as c')->select(
            DB::raw("ROW_NUMBER() OVER ( ORDER BY c.idSaldo desc) as row_num"),
            "c.idSaldo",
            "c.monto",
            "p.operacion",
            DB::raw("DATE_FORMAT(c.fechaRegistro, '%d/%m/%Y %H:%i') as fechaRegistro"),
        )
            ->leftJoin('pago as p', 'p.idPago', '=', 'c.idPago')
            ->when(!empty($this->filters["idAlumno"] ?? ""), function ($query) {
                $query->where("c.idAlumno", $this->filters["idAlumno"]);
            })
            ->when(in_array($this->filters["estado"] ?? "", [0, 1]), function ($query) {
                $query->where("c.estado", $this->filters["estado"]);
            })
            //Rango de Fechas
            ->when(!empty($this->filters["fechaDesde"]) && !empty($this->filters["fechaHasta"]), function ($query) {
                $query->whereBetween(DB::raw("DATE(c.fechaRegistro)"), [$this->filters["fechaDesde"], $this->filters["fechaHasta"]]);
            })
            ->when(!empty($this->filters["fechaDesde"]) && empty($this->filters["fechaHasta"]), function ($query) {
                $query->where(DB::raw("DATE(c.fechaRegistro)"), $this->filters["fechaDesde"]);
            })
            ->when(empty($this->filters["fechaDesde"]) && !empty($this->filters["fechaHasta"]), function ($query) {
                $query->where(DB::raw("DATE(c.fechaRegistro)"), $this->filters["fechaHasta"]);
            })
            ->orderBy($column, $sort);
        return $query;
    }
}
