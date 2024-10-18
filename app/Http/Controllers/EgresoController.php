<?php
namespace App\Http\Controllers;

use App\Helpers\Log;
use App\Model\{Archivo, Concepto, Egreso, Grupo};
use DateTime;
use Exception;
use Illuminate\Support\Facades\DB;
use PDOException;

class EgresoController extends Controller {
    private $filters = [];
    public function save()
    {
        $logger = Log::logMonolog();
        $data = $this->request;
        $logger->debug("data:", [$data]);
        $id = $data["idEgreso"] ?? null;
        try {
            if (empty($data["monto"]))
                throw new Exception("Falta monto");
            DB::beginTransaction();
            $pago = empty($id) ? new Egreso() : Egreso::find($data["idEgreso"]);
            $pago->idConcepto = $data["idConcepto"] ?? null;
            $pago->observacion = $data["observacion"];
            $pago->operacion = $data["operacion"];
            $pago->monto = $data["monto"];
            $pago->fechaComprobante = $data["fechaComprobante"];
            $pago->save();
            if (isset($_FILES["imgsPago"])) {
                $targetDir = FILE_SERVER . "/" . REPOSITORY_EGRESO . "/";
                if (!is_dir($targetDir))
                    throw new Exception("Error, no exite la carpeta [formula] en el servidor de archivos");
                $uploadedFiles = $_FILES["imgsPago"]["name"];
                $numFiles = count($uploadedFiles);
                for ($i = 0; $i < $numFiles; $i++) {
                    $fileExtension = pathinfo($uploadedFiles[$i], PATHINFO_EXTENSION);
                    $nombre = time() . mt_rand() . "." . strtolower($fileExtension);
                    $targetFile = $targetDir . $nombre;
                    if (!@move_uploaded_file($_FILES["imgsPago"]["tmp_name"][$i], $targetFile))
                        throw new Exception("Error al subir el archivo " . htmlspecialchars($uploadedFiles[$i]));
                    $archivo = new Archivo();
                    $archivo->nombreReal = basename($uploadedFiles[$i]);
                    $archivo->nombre = $nombre;
                    $archivo->idTabla = $pago->idEgreso;
                    $archivo->tabla = $pago->getTable();
                    $archivo->save();
                }
            }
            DB::commit();
            echo json_encode($pago);
        } catch (Exception $e) {
            DB::rollBack();
            header("HTTP/1.0 500 " . str_encode($e->getMessage()));
        }
    }
        
    public function getById(int $idEgreso)
    {
        try {
            $egreso = Egreso::find($idEgreso);
            $arrEgreso = $egreso ? $egreso->toArray() : [];
            $concepto = Concepto::where("idConcepto", $arrEgreso["idConcepto"])->first();
            $arrEgreso["idGrupo"] = $concepto->idGrupo;
            $fecha = new DateTime($arrEgreso["fechaComprobante"]);
            $arrEgreso["fechaComprobante"] = $fecha->format('Y-m-d');
            echo json_encode($arrEgreso);
        } catch (Exception $e) {
            header("HTTP/1.0 404 " . $e->getMessage());
        }
    }

    public function delete(string $idEgreso)
    {
        try {
            if (empty($idEgreso))
                throw new Exception("Falta enviar el ID", 500);
            $deleted = Egreso::destroy($idEgreso);
            if (!$deleted)
                throw new Exception(str_encode("Error, no se hizo la acción"), 500);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function listWithFilter()
    {
        $logger = Log::logMonolog();
        $this->filters = $this->request;
        $page = $this->filters["page"] ?? 1;
        $perPage = $this->filters["size"] ?? SHOW_ROWS_GRID;
        $isToExcel = $this->filters["isToExcel"] ?? null; // flag que indica exportar a excel
        try {
            $mantenimiento = new Egreso();
            $query = $mantenimiento->listWithFilter($this->filters);
            if ($isToExcel) {
               // $this->toExcel($query->get()->toArray());
                exit;
            }
            echo $query->paginate($perPage, ['*'], 'page', $page)->toJson();
        } catch (PDOException $e) {
            header("HTTP/1.0 500 Error de sintaxis SQL. " . (LOGGER_LEVEL == "100" ? $e->getMessage() : ""));
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
            $logger->error($e->getMessage());
        }
    }
}
