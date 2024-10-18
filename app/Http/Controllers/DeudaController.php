<?php

namespace App\Http\Controllers;

use App\Model\Deuda;
use App\Model\Enums\EstadoDeuda;
use Exception;

class DeudaController extends Controller
{
    
    public function save()
    {
        $data = $this->request;
        $id = $data["idDeuda"] ?? null;
        try {
            if (empty($data["monto"]))
                throw new Exception("Falta enviar datos", 500);
            $prod = empty($id) ? new Deuda() : Deuda::find($id);
            $prod->idAlumno = $data["idAlumno"];
            $prod->idConcepto = $data["idConcepto"];
            $prod->monto = $data["monto"];
            $prod->montoRestante = $data["montoRestante"];
            $prod->estadoDeuda = $data["estadoDeuda"];
            $prod->save();
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function listDeudaByIdAlumno(string $idAlumno)
    {
        try {
            $deuda = new Deuda();
            $list = $deuda->listWithFilter(["idAlumno" => $idAlumno])->get()->toArray();
            echo json_encode($list);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function listEstadoDeuda() {
        $list = EstadoDeuda::list();
        echo json_encode($list);
    }

    
    public function getById(int $idDeuda)
    {
        try {
            $deuda = Deuda::find($idDeuda);
            $arrDeuda = $deuda ? $deuda->toArray() : [];
            echo json_encode($arrDeuda);
        } catch (Exception $e) {
            header("HTTP/1.0 404 " . $e->getMessage());
        }
    }
}
