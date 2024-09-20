<?php

namespace App\Model;

use App\Model\Enums\Estado as EnumsEstado;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Grupo extends Model
{
    protected $table = 'grupo';
    protected $primaryKey = 'idGrupo';
    const CREATED_AT = null;
    const UPDATED_AT = null;
    private $filters = [];
    public function listGrupo()
    {
        $list = self::select(
            'idGrupo',
            'descripcion',
            'estado',
        )->where('estado', EnumsEstado::ACTIVO->value)->get()->toArray();
        return $list;
    }

    public function listWithFilter(array $filters): \Illuminate\Database\Query\Builder
    {
        $this->filters = $filters;
        list($column, $sort) = explode(",", $this->filters["sort"] ?? "c.idGrupo,desc");
        $query = DB::table('grupo as c')->select(
            DB::raw("ROW_NUMBER() OVER ( ORDER BY c.idGrupo desc) as row_num"),
            "c.idGrupo",
            "c.descripcion",
            "c.estado"
        )
            ->when(!empty($this->filters["descripcion"] ?? ""), function ($query) {
                $query->where("c.descripcion", 'like', "%" . str_replace(" ", "%", $this->filters["descripcion"]) . "%");
            })
            ->when(!empty($this->filters["estado"] ?? ""), function ($query) {
                $query->where("c.estado", $this->filters["estado"]);
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
