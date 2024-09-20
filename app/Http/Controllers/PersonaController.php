<?php
namespace App\Http\Controllers;

use App\Model\Persona;
use Exception;

class PersonaController extends Controller
{
    public function getByDni(string $dni)
    {
        try {
            if (empty($dni))
                throw new Exception("Falta DNI para consultar");
            if (preg_match('/^[0-9]{8}$/', $dni) !== 1)
                throw new Exception(str_encode("DNI ingresado [$dni] debe contener 8 caracteres numéricos [0-9]"));
            $per = Persona::where("dni", $dni)->first();
            if (empty($per)) {
                echo null;
                return;
            }
            echo json_encode(["nombres" => $per->nombres, "apellidoPaterno" => $per->apellidos, "apellidoMaterno" => ""]);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }
    /*
     * Este método consulta la API de RENIEC
     */
    public function getPersonaFromApi(string $dni)
    {
        try {
            if (empty($dni))
                throw new Exception("Falta DNI para consultar");
            if (preg_match('/^[0-9]{8}$/', $dni) !== 1)
                throw new Exception(str_encode("DNI ingresado [$dni] debe contener 8 caracteres numéricos [0-9]"));
            $url = API_RENIEC . "?tipoDocumento=2&nroDocumento=" . $dni;
            $response = CallAPI("GET", $url, null, ["Content-Type: application/json"], false);
            $data = json_decode($response["result"], true);
            if (in_array($data["resultCode"] ?? null, ["1002", "1003"])) {
                $msg = "Error al consultar al API de RENIEC";
                throw new Exception(isset($data["message"]) ? $msg . ": " . str_encode($data["message"]) : $msg);
            }
            if (empty($data))
                throw new Exception("El api[$url] ha retornado formato HTML en vez de JSON");
            echo json_encode(["nombres" => $data["nombres"], "apellidoPaterno" => $data["apellidoPaterno"], "apellidoMaterno" => $data["apellidoMaterno"]]);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }
}
