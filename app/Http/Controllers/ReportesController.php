<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Model\Deuda;
use DateTime;
use Exception;
use PDOException;

class ReportesController extends Controller
{
    public function listPeriodoByAlumno(int $idAlumno)
    {
        $row = Deuda::select(
            DB::raw("YEAR(MIN(fechaRegistro)) AS anno"),
        )->where("idAlumno", $idAlumno)->first();
        if (!$row || !$row->anno) {
            echo json_encode([]);
            return;
        }
        $annoMin = $row->anno;
        $now = date("Y");
        $years = [];
        foreach (range($now, $annoMin) as $year) {
            $years[] = ['id' => $year, 'label' => (string)$year];
        }
        echo json_encode($years);
    }

    /**
     * Retorna el estado de cuenta del alumno seleccionado
     */
    public function estado()
    {
        $data = $this->request;
        $resultados = DB::select('CALL SP_ESTADO_CUENTA(?)', [$data["idAlumno"]]);
        echo json_encode($resultados);
    }


    public function initForm()
    {
        $fecha = new DateTime();
        $primerDiaDelMes = new DateTime($fecha->format('Y-m-01'));
        $ultimoDiaDelMes = new DateTime($fecha->format('Y-m-t'));
        echo json_encode(["id_sucursal" => 1, "fechaDesde" => $primerDiaDelMes->format('Y-m-d'), "fechaHasta" => $ultimoDiaDelMes->format('Y-m-d')]);
    }
}
