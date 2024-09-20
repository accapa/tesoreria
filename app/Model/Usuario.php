<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Usuario extends Model
{
    protected $table = 'usuario';
    protected $primaryKey = 'idUsuario';
    const CREATED_AT = null;
    const UPDATED_AT = null;

    public function getUserByLogin(string $login)
    {
        return Usuario::select(["idUsuario", "usuario"])->where('usuario', '=', $login)->first();
    }

    public function listWithFilter(array $filters): \Illuminate\Database\Query\Builder
    {
        $this->filters = $filters;
        list($column, $sort) = explode(",", $this->filters["sort"] ?? "u.idUsuario,desc");
        $query = DB::table('usuario as u')->select(
            DB::raw("ROW_NUMBER() OVER ( ORDER BY u.idUsuario) as row_num"),
            'u.idUsuario',
            "u.usuario",
            "p.dni",
            DB::raw("concat(p.nombres, ' ', p.apellidos) as nombres"),
            "u.roles",
            DB::raw("DATE_FORMAT(u.fechaRegistro, '%d/%m/%Y %H:%i') as fechaRegistro"),
            "u.estado",
        )
            ->leftJoin('persona as p', 'p.dni', '=', 'u.usuario')
            ->when(!empty($this->filters["usuario"] ?? ""), function ($query) {
                $query->where("u.usuario", 'like', "%" . str_replace(" ", "%", $this->filters["usuario"]) . "%");
            })
            ->when(in_array($this->filters["estado"] ?? "", [1, 0]), function ($query) {
                $query->where("u.estado", $this->filters["estado"]);
            })
            //Rango de Fechas
            ->when(!empty($this->filters["fechaDesde"]) && !empty($this->filters["fechaHasta"]), function ($query) {
                $query->whereBetween(DB::raw("DATE(u.fechaRegistro)"), [$this->filters["fechaDesde"], $this->filters["fechaHasta"]]);
            })
            ->when(!empty($this->filters["fechaDesde"]) && empty($this->filters["fechaHasta"]), function ($query) {
                $query->where(DB::raw("DATE(u.fechaRegistro)"), $this->filters["fechaDesde"]);
            })
            ->when(empty($this->filters["fechaDesde"]) && !empty($this->filters["fechaHasta"]), function ($query) {
                $query->where(DB::raw("DATE(u.fechaRegistro)"), $this->filters["fechaHasta"]);
            })
            ->orderBy($column, $sort);
        return $query;
    }
}
