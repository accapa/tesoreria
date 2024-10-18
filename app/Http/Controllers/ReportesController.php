<?php

namespace App\Http\Controllers;

use App\Model\Concepto;
use Illuminate\Support\Facades\DB;
use App\Model\Deuda;
use App\Model\Egreso;
use App\Model\Enums\Estado;
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
            $years[] = ['id' => $year, 'label' => (string) $year];
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

    public function alumnoConcepto(): void
    {
        $data = $this->request;
        try {
            if (!is_numeric($data["idGrupo"] ?? null)) {
                throw new Exception(str_encode("El parámetro debe ser numérico"));
            }
            $estados = implode(",", array_map(function ($estado) {
                return "'$estado'";
            }, $data["estados"]));
            if (empty($estados)) {
                throw new Exception("Seleccione un estado");
            }
            $conceptos = Concepto::select("idConcepto", "concepto")->
                where("estado", "=", Estado::ACTIVO->value)->
                where("idGrupo", "=", $data["idGrupo"])->orderBy("idConcepto", "asc")->get()->toArray();
            $resultados = DB::select('CALL SP_REPORTE_ALUMNO_CONCEPTO(?, ?)', [$data["idGrupo"], $estados]);
            $map = [];
            foreach ($conceptos as $item) {
                $map[] = $item["concepto"];
            }
            echo json_encode(["data" => $resultados, "head" => $map]);
        } catch (Exception $e) {
            header("HTTP/1.0 405 " . $e->getMessage());
        }
    }

    public function listEstado()
    {
        echo json_encode(Estado::list());
    }

    public function balanceGrupo(): void
    {
        $data = $this->request;
        try {
            if (!is_numeric($data["idGrupo"] ?? null)) {
                throw new Exception(str_encode("El parámetro debe ser numérico"));
            }
            $resultados = DB::select('CALL SP_REPORTE_BALANCE_GRUPO(?)', [$data["idGrupo"]]);
            foreach($resultados as $row) {
                $egresos = Egreso::select("observacion", "monto")
                ->where("idConcepto", "=", $row->idConcepto)
                ->orderBy("idEgreso", "asc")->get()->toArray();
                $row->egresos = $egresos;
            }
            echo json_encode($resultados);
        } catch (Exception $e) {
            header("HTTP/1.0 405 " . $e->getMessage());
        }
    }
}
