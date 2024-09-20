<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Deuda extends Model
{
    protected $table = 'deuda';
    protected $primaryKey = 'idDeuda';
    const CREATED_AT = null;
    const UPDATED_AT = null;
    
    public function listWithFilter(array $filters): \Illuminate\Database\Query\Builder
    {
        $this->filters = $filters;
        list($column, $sort) = explode(",", $this->filters["sort"] ?? "d.idDeuda,desc");
        $query = DB::table('deuda as d')->select(
            DB::raw("ROW_NUMBER() OVER ( ORDER BY d.idDeuda desc) as row_num"),
            "d.idDeuda",
            "d.idConcepto",
            "d.monto",
            "d.montoRestante",
            "c.concepto",
            "d.estadoDeuda",
            DB::raw("DATE_FORMAT(d.fechaRegistro, '%d/%m/%Y %H:%i') as fechaRegistro"),
        )
            ->leftJoin('concepto as c', 'c.idConcepto', '=', 'd.idConcepto')
            ->when(!empty($this->filters["idAlumno"] ?? ""), function ($query) {
                $query->where("d.idAlumno",  $this->filters["idAlumno"]);
            })
            //Rango de Fechas
            ->when(!empty($this->filters["fechaRegDesde"]) && !empty($this->filters["fechaRegHasta"]), function ($query) {
                $query->whereBetween(DB::raw("DATE(c.fecha)"), [$this->filters["fechaRegDesde"], $this->filters["fechaRegHasta"]]);
            })
            ->when(!empty($this->filters["fechaRegDesde"]) && empty($this->filters["fechaRegHasta"]), function ($query) {
                $query->where(DB::raw("DATE(c.fecha)"), $this->filters["fechaRegDesde"]);
            })
            ->when(empty($this->filters["fechaRegDesde"]) && !empty($this->filters["fechaRegHasta"]), function ($query) {
                $query->where(DB::raw("DATE(c.fecha)"), $this->filters["fechaRegHasta"]);
            })
            ->orderBy($column, $sort);
            return $query;
    }
}
