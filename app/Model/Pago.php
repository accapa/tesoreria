<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Pago extends Model
{
    protected $table = 'pago';
    protected $primaryKey = 'idPago';
    const CREATED_AT = null;
    const UPDATED_AT = null;
    private $filters = [];

    public function listWithFilter(array $filters): \Illuminate\Database\Query\Builder
    {
        $this->filters = $filters;
        list($column, $sort) = explode(",", $this->filters["sort"] ?? "c.idPago,desc");
        $query = DB::table('pago as c')->select(
            DB::raw("ROW_NUMBER() OVER ( ORDER BY c.idPago desc) as row_num"),
            "c.idPago",
            "c.monto",
            "c.operacion",
            "c.observacion",
            DB::raw("concat(p.apellidos, ' ', p.nombres) as alumno"),
            "g.descripcion as grupo",
            DB::raw("DATE_FORMAT(c.fechaComprobante, '%d/%m/%Y') as fechaComprobante"),
            DB::raw("DATE_FORMAT(c.fechaRegistro, '%d/%m/%Y %H:%i') as fechaRegistro"),
        )
            ->leftJoin('alumno as a', 'a.idAlumno', '=', 'c.idAlumno')
            ->leftJoin('persona as p', 'p.idPersona', '=', 'a.idPersona')
            ->leftJoin('grupo as g', 'g.idGrupo', '=', 'c.idGrupo')
            ->when(!empty($this->filters["idGrupo"] ?? ""), function ($query) {
                $query->where("c.idGrupo", $this->filters["idGrupo"]);
            })
            ->when(!empty($this->filters["nombres"] ?? ""), function ($query) {
                $query->where(DB::raw("concat(p.apellidos, ' ', p.nombres)"), 'like', "%" . str_replace(" ", "%", $this->filters["nombres"]) . "%");
            })
            ->when(!empty($this->filters["operacion"] ?? ""), function ($query) {
                $query->where("c.operacion", 'like', "%" . $this->filters["operacion"]. "%");
            })
            ->when(!empty($this->filters["observacion"] ?? ""), function ($query) {
                $query->where("c.observacion", 'like', "%" . $this->filters["observacion"]. "%");
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
