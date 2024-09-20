<?php
namespace App\Model\Enums;

enum Estado: string
{
    case ACTIVO = "1"; 
    case INACTIVO = "0"; 


    public static function default(): string
    {
        return self::ACTIVO->value;
    }

    public function lowerName(): string
    {
        return strtolower($this->name);
    }
}
