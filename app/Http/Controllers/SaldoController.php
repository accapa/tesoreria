<?php
namespace App\Http\Controllers;

use App\Helpers\Log;
use App\Model\Enums\Estado;
use App\Model\Saldo;
use Exception;
use PDOException;

class SaldoController extends Controller
{
    private $filters = [];

    public function listWithFilter()
    {
        $logger = Log::logMonolog();
        $this->filters = $this->request;
        $page = $this->filters["page"] ?? 1;
        $perPage = $this->filters["size"] ?? SHOW_ROWS_GRID;
        try {
            $mantenimiento = new Saldo();
            $query = $mantenimiento->listWithFilter($this->filters);
            echo $query->paginate($perPage, ['*'], 'page', $page)->toJson();
        } catch (PDOException $e) {
            header("HTTP/1.0 500 Error de sintaxis SQL. " . (LOGGER_LEVEL == "100" ? $e->getMessage() : ""));
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
            $logger->error($e->getMessage());
        }
    }
  
    public function getById(int $idPago)
    {
        try {
            $pago = Saldo::find($idPago);
            echo json_encode($pago);
        } catch (Exception $e) {
            header("HTTP/1.0 404 " . $e->getMessage());
        }
    }

    public function listSaldoByIdAlumno(int $idAlumno) {
        try {
            $mantenimiento = new Saldo();
            $query = $mantenimiento->listWithFilter(["idAlumno" => $idAlumno, "estado" => Estado::ACTIVO->value]);
            echo $query->get()->toJson();
        } catch (PDOException $e) {
            header("HTTP/1.0 500 Error de sintaxis SQL. " . (LOGGER_LEVEL == "100" ? $e->getMessage() : ""));
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }
}
