<?php

namespace App\Model;

use App\Model\Enums\Estado;
use Illuminate\Database\Eloquent\Model;

class Persona extends Model
{
    protected $table = 'persona';
    protected $primaryKey = 'idPersona';
    const CREATED_AT = null;
    const UPDATED_AT = null;
    public function listPersonaCombo() {
        return self::select([
            "idPersona", "nombres", "apellidos"
        ])
        ->where('estado', '=', Estado::ACTIVO->value)->orderBy('apellidos', 'asc')->get();
    }
}
