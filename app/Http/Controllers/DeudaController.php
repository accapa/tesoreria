<?php

namespace App\Http\Controllers;

use App\Model\Deuda;
use Exception;

class DeudaController extends Controller
{

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
}
