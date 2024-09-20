<?php
namespace App\Model\Enums;

enum Sexo: string
{
    case MASCULINO = "M"; 
    case FEMENINO = "F"; 


    public static function default(): string
    {
        return self::MASCULINO->value;
    }

    public function lowerName(): string
    {
        return strtolower($this->name);
    }
}
