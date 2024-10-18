<?php
namespace App\Model\Enums;

enum EstadoDeuda: string
{
    case PAGADA = "PA"; 
    case PENDIENTE = "PE"; 


    public static function default(): string
    {
        return self::PENDIENTE->value;
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
