<?php
namespace App\Model\Enums;

enum Rol: string
{
    case ADMIN = "ADMIN";
    case ALUMNO = "ALUMNO";


    public static function default(): string
    {
        return self::ALUMNO->value;
    }

    public function lowerName(): string
    {
        return strtolower($this->name);
    }

    public static function all(): array
    {
        return [
            ["roleNombre" => self::ADMIN->name, "idRole" => self::ADMIN->value],
            ["roleNombre" => self::ALUMNO->name, "idRole" => self::ALUMNO->value]
        ];
    }
}
