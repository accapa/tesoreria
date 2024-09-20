<?php
namespace App\Model\Enums;

enum TipoConcepto: string
{
    case INGRESO = "INGRESO"; 
    case EGRESO = "EGRESO"; 


    public static function default(): string
    {
        return self::INGRESO->value;
    }

    public function lowerName(): string
    {
        return strtolower($this->name);
    }

    public static function list(): array
    {
        return array_map(fn($case) => ['value' => $case->value], self::cases());
    }
}
