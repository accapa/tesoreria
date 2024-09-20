<?php

namespace App\Http\Controllers;

use App\Model\Archivo;
use App\Helpers\Log;
use Exception;

class ArchivoController extends Controller
{

    public function listByIdCompra(int $id_producto_stock)
    {
        try {
            $ser = new Archivo();
            $list = $ser->listByIdCompra($id_producto_stock);
            echo json_encode($list);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function listByIdActivo(int $id_activo, string $tipo)
    {
        try {
            $ser = new Archivo();
            $list = $ser->listByIdActivo($id_activo, $tipo);
            echo json_encode($list);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function showImage(string $codeIdArchivo)
    {
        header('Content-Type: image/jpeg');
        $logger = Log::logMonolog();
        try {
            $id_archivo = decryptID($codeIdArchivo);
            if (empty($id_archivo))
                throw new Exception("Código ID no es válido");
            $archivo = Archivo::select('nombre', 'tabla')->where('idArchivo', $id_archivo)->first();

            $logger->debug("archivo:: ", [$archivo]);

            $carpeta = $this->getCarpeta($archivo["tabla"]);
            $targetDir = FILE_SERVER . "/" . $carpeta . "/" . $archivo["nombre"];
            if (!@file_exists($targetDir))
                throw new Exception("Error, no existe el archivo ");
            echo file_get_contents($targetDir);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function delete(string $codeIdArchivo)
    {
        try {
            $id_archivo = decryptID($codeIdArchivo);
            if (empty($id_archivo))
                throw new Exception("Código ID no es válido");
            $archivo = Archivo::find($id_archivo);
            if (empty($archivo))
                throw new Exception(str_encode("No hay registros para realizar la operación"));
            $carpeta = $this->getCarpeta($archivo["tabla"]);
            $targetDir = FILE_SERVER . "/" . $carpeta . "/" . $archivo["nombre"];
            if (!@unlink($targetDir))
                throw new Exception("Error, al momento de eliminar archivo");
            $archivo->delete();
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    private function getCarpeta(string $tipo): string
    {
        return match ($tipo) {
            "pago" => REPOSITORY_PAGO,
            "egreso" => REPOSITORY_EGRESO,
            default => throw new Exception("Falta enviar tipo de repositorio"),
        };
    }

}
