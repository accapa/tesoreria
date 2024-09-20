<?php

namespace App\Model;

use Exception;
use Illuminate\Database\Eloquent\Model;
use App\Helpers\Log;

class Archivo extends Model
{
    protected $table = 'archivo';
    protected $primaryKey = 'idArchivo';
    const CREATED_AT = null;
    const UPDATED_AT = null;

    protected $attributes = [];

    public function listByIdActivo(int $idTabla, string $tipo)
    {
        $tipo = $this->getTipo($tipo);
        $list = Archivo::select(
            'idArchivo',
            'nombre',
            'nombreReal',
        )->where('idTabla', $idTabla)->where('tabla', $tipo)->get()->toArray();
        foreach ($list as $i => $archivo) {
            $list[$i]["idArchivo"] = encryptID($archivo["idArchivo"]);
        }
        return $list;
    }

    private function getTipo(string $tipo)
    {
        return match ($tipo) {
            "pago" => "pago",
            "egreso" => "egreso",
            default => throw new Exception("Falta enviar tipo de repositorio o [$tipo] no existe"),
        };
    }
}
