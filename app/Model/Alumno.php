<?php

namespace App\Model;

use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use PDOException;

class Alumno extends Model
{
    protected $table = 'alumno';
    protected $primaryKey = 'idAlumno';
    const CREATED_AT = null;
    const UPDATED_AT = null;
    private $filters = [];

    public function listWithFilter(array $filters): \Illuminate\Database\Query\Builder
    {
        $this->filters = $filters;
        list($column, $sort) = explode(",", $this->filters["sort"] ?? "c.idAlumno,desc");
        $query = DB::table('alumno as c')->select(
            DB::raw("ROW_NUMBER() OVER ( ORDER BY c.idAlumno desc) as row_num"),
            "c.idAlumno",
            "c.idGrupo",
            "s.dni",
            "s.nombres",
            "s.apellidos",
            "g.descripcion as grupoDescripcion",
            DB::raw("DATE_FORMAT(c.fechaRegistro, '%d/%m/%Y %H:%i') as fechaRegistro"),
            "c.estado"
        )
            ->leftJoin('persona as s', 's.idPersona', '=', 'c.idPersona')
            ->leftJoin('grupo as g', 'g.idGrupo', '=', 'c.idGrupo')
            ->when(!empty($this->filters["idGrupo"] ?? ""), function ($query) {
                $query->where("g.idGrupo",  $this->filters["idGrupo"]);
            })
            ->when(!empty($this->filters["idPersona"] ?? ""), function ($query) {
                $query->where("s.idPersona",  $this->filters["idPersona"]);
            })
            ->when(!empty($this->filters["dni"] ?? ""), function ($query) {
                $query->where("s.dni",  $this->filters["dni"]);
            })
            ->when(!empty($this->filters["nombres"] ?? ""), function ($query) {
                $query->where(DB::raw("concat(s.nombres, ' ', s.apellidos)"), 'like', "%" . str_replace(" ", "%", $this->filters["nombres"]) . "%");
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
