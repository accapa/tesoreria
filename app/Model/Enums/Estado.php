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

    public static function list(): array
    {
        return array_map(fn($case) => ['value' => $case->value, 'label' => $case->name], self::cases());
    }
}
