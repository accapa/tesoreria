<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Egreso extends Model
{
    protected $table = 'egreso';
    protected $primaryKey = 'idEgreso';
    const CREATED_AT = null;
    const UPDATED_AT = null;
    private $filters = [];

    public function listWithFilter(array $filters): \Illuminate\Database\Query\Builder
    {
        $this->filters = $filters;
        list($column, $sort) = explode(",", $this->filters["sort"] ?? "e.idEgreso,desc");
        $query = DB::table('egreso as e')->select(
            DB::raw("ROW_NUMBER() OVER ( ORDER BY e.idEgreso desc) as row_num"),
            "e.idEgreso",
            "c.concepto",
            "e.observacion",
            "e.operacion",
            "e.monto",
            DB::raw("DATE_FORMAT(e.fechaComprobante, '%d/%m/%Y') AS fechaComprobante"),
            DB::raw("DATE_FORMAT(e.fechaRegistro, '%d/%m/%Y') AS fechaRegistro"),
            DB::raw("SUM(e.monto) OVER () as totalMonto"),
        )->leftJoin('concepto as c', 'c.idConcepto', '=', 'e.idConcepto')
        
            ->when(!empty($this->filters["idGrupo"] ?? ""), function ($query) {
                $query->where("c.idGrupo",  $this->filters["idGrupo"]);
            })
            ->when(!empty($this->filters["estado"] ?? ""), function ($query) {
                $query->where("e.estado", $this->filters["estado"]);
            })
            //Rango de Fechas
            ->when(!empty($this->filters["fechaRegDesde"]) && !empty($this->filters["fechaRegHasta"]), function ($query) {
                $query->whereBetween(DB::raw("DATE(e.fechaRegistro)"), [$this->filters["fechaRegDesde"], $this->filters["fechaRegHasta"]]);
            })
            ->when(!empty($this->filters["fechaRegDesde"]) && empty($this->filters["fechaRegHasta"]), function ($query) {
                $query->where(DB::raw("DATE(e.fechaRegistro)"), $this->filters["fechaRegDesde"]);
            })
            ->when(empty($this->filters["fechaRegDesde"]) && !empty($this->filters["fechaRegHasta"]), function ($query) {
                $query->where(DB::raw("DATE(e.fechaRegistro)"), $this->filters["fechaRegHasta"]);
            })
            ->orderBy($column, $sort);
            return $query;
    }
}
