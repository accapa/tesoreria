<?php
namespace App\Model\Enums;

enum TipoPago: string
{
    case CUOTA = "C"; // Pago regular del concepto generado
    case OTROS = "O"; // Usado para registrar ingresos de tipo donación, saldo de años pasados, etc.


    public static function default(): string
    {
        return self::CUOTA->value;
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
