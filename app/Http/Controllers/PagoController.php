<?php
namespace App\Http\Controllers;

use App\Helpers\Log;
use App\Model\{Alumno, Archivo, Deuda, Pago, PagoDeuda, Saldo};
use App\Model\Enums\{Estado, EstadoDeuda};
use Exception;
use Illuminate\Support\Facades\DB;
use PDOException;

class PagoController extends Controller
{
    private $filters = [];

    public function listWithFilter()
    {
        $logger = Log::logMonolog();
        $this->filters = $this->request;
        $page = $this->filters["page"] ?? 1;
        $perPage = $this->filters["size"] ?? SHOW_ROWS_GRID;
        $isToExcel = $this->filters["isToExcel"] ?? null; // flag que indica exportar a excel
        try {
            $mantenimiento = new Pago();
            $query = $mantenimiento->listWithFilter($this->filters);
            if ($isToExcel) {
                $this->toExcel($query->get()->toArray());
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
    private function toExcel(array $data)
    {
        $head = array(
            ["label" => "Nro.", "width" => 5],
            ["label" => "Profesión", "width" => 25],
            ["label" => "Estado", "width" => 25],
            ["label" => "Fecha registro", "width" => 17],
            ["label" => "Registrado por", "width" => 17],
            ["label" => "Fecha modifica", "width" => 17],
            ["label" => "Modificado por", "width" => 17],

        );
        $path = UPLOAD_TMP_DIR . uniqid("EXCEL_") . ".xlsx";
        $excel = new \App\Helpers\Excel($path);
        $excel->title = "Reporte";
        $excel->setHead($head);
        $i = 0;
        foreach ($data as $item) {
            $excel->setBody(
                $i,
                [
                    "row" => ($i + 1),
                    "desc" => $item->descripcion,
                    "est" => $item->estado,
                    "fre" => $item->fecha_registro,
                    "ure" => $item->usu_registra,
                    "fmo" => $item->fecha_modifica,
                    "umo" => $item->usu_modifica,
                ]
            );
            $i++;
        }
        $excel->generateFile();
        smartReadFile($path, "REPORTE.xlsx", "application/octet-stream", "attachment");
        @unlink($path);
    }

    public function save()
    {
        $logger = Log::logMonolog();
        $data = $this->request;
        $logger->debug("data:", [$data]);
        $id = $data["idPago"] ?? null;
        $aplicarSaldo = $data["aplicarSaldo"] ?? "false";
        $saldos = [];
        try {
            if (empty($data["monto"]))
                throw new Exception("Falta monto");
            $idGrupo = null;
            DB::beginTransaction();
            $pago = empty($id) ? new Pago() : Pago::find($id);
            if (!empty($data["idGrupo"])) {
                $idGrupo = $data["idGrupo"];
            } else if (empty($idGrupo) && !empty($data["idAlumno"])) {
                $rowAlumno = Alumno::select("idGrupo")->where("idAlumno", "=", $data["idAlumno"])->first();
                $idGrupo = $rowAlumno->idGrupo;
            }

            if (!empty($data["idAlumno"] ?? null) && $aplicarSaldo == "true") {
                $logger->debug("Aplicando saldo");
                $saldos = Saldo::where("idAlumno", "=", $data["idAlumno"])->where("estado", "=", Estado::ACTIVO->value)->get()->toArray();
                $logger->debug("saldos", [$saldos]);
                $pago->idPago = $saldos[0]["idPago"];
                $pago->monto = $data["monto"];
                $pago->idAlumno = $data["idAlumno"];
            } else {
                $logger->debug("Sin aplicar saldo", [$data["idAlumno"]]);
                $pago->idAlumno = empty($data["idAlumno"] ?? "") ? null : $data["idAlumno"];
                $pago->idGrupo = $idGrupo;
                $pago->idPagoTipo = 1; // todo: falta afinar
                $pago->monto = $data["monto"];
                $pago->operacion = $data["operacion"];
                $pago->observacion = $data["observacion"];
                $pago->fechaComprobante = $data["fechaComprobante"];
                $pago->save();
            }
            $_pagoTotal = $pago->monto;
            $_deudaTotal = 0;
            foreach (json_decode($data["deudas"] ?? "[]") as $idDeuda) {
                $pd = new PagoDeuda();
                $pd->idPago = $pago->idPago;
                $pd->idDeuda = $idDeuda;
                $pd->save();
                $deuda = Deuda::find($idDeuda);
                $_deuda = $deuda->montoRestante > 0 ? $deuda->montoRestante : $deuda->monto;
                $_pagoTotal -= $_deuda;
                $deuda->montoRestante = $_pagoTotal >= 0 ? 0 : $_pagoTotal * -1;
                $deuda->estadoDeuda = $_pagoTotal >= 0 ? EstadoDeuda::PAGADA->value : EstadoDeuda::PENDIENTE->value;
                $deuda->fechaActualiza = date("Y-m-d H:i:s");
                $deuda->save();
                $_deudaTotal += $_deuda;
            }

            $logger->debug("Sin aplicar saldo: " . $aplicarSaldo);
            if (!empty($pago->idAlumno) && $aplicarSaldo == "true") {
                $logger->debug("Gestionando saldo");
                //$saldos = Saldo::where("idAlumno", "=", $pago->idAlumno)->where("estado", "=", Estado::ACTIVO->value)->get()->toArray();
                $totalSaldo = array_reduce($saldos, function ($carry, $s) {return $carry + $s["monto"];}, 0);
                $logger->debug("saldos", [$totalSaldo, $_deudaTotal]);
                if ($totalSaldo >= $_deudaTotal) {
                    $_deudaTotalSaldo = $_deudaTotal;
                    foreach ($saldos as $_saldo) {
                        if ($_saldo["monto"] <= $_deudaTotalSaldo) {
                            Saldo::where('idSaldo', "=", $_saldo["idSaldo"])->update([
                                'estado' => Estado::INACTIVO->value
                            ]);
                            $_deudaTotalSaldo -= $_saldo["monto"];
                        } else {
                            Saldo::where('idSaldo', "=", $_saldo["idSaldo"])->update([
                                'monto' => $_saldo["monto"] - $_deudaTotalSaldo
                            ]);
                            break;
                        }
                    }
                } else {
                    Saldo::where("idAlumno", "=", $pago->idAlumno)->where("estado", "=", Estado::ACTIVO->value)->update([
                        'estado' => Estado::INACTIVO->value
                    ]);
                }
            }

            if ($pago->idAlumno /*&& empty($aplicarSaldo)*/ && $pago->monto > $_deudaTotal) {
                $logger->debug("Insertando en la tabla SALDO", [$pago->monto, $_deudaTotal]);
                $saldo = new Saldo();
                $saldo->idAlumno = $pago->idAlumno;
                $saldo->idPago = $pago->idPago;
                $saldo->monto = $pago->monto - $_deudaTotal;
				$saldo->estado = Estado::ACTIVO->value;
                $saldo->save();
            }
            if (isset($_FILES["imgsPago"])) {
                $targetDir = FILE_SERVER . "/" . REPOSITORY_PAGO . "/";
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
                    $archivo->idTabla = $pago->idPago;
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

    public function delete(int $idPago)
    {
        try {
            if (empty($idPago))
                throw new Exception("Falta enviar el ID", 500);
			DB::beginTransaction();
			$pagoDeudas = PagoDeuda::where("idPago", "=", $idPago)->get()->toArray();
			$ids = array_column($pagoDeudas, 'idDeuda');
			Deuda::whereIn('idDeuda', $ids)->update([
				'estadoDeuda' => EstadoDeuda::PENDIENTE->value
			]);
			PagoDeuda::where("idPago", "=", $idPago)->delete();
			Pago::destroy($idPago);
			DB::commit();
        } catch (Exception $e) {
			DB::rollBack();
            header("HTTP/1.0 500 " . ($e->getCode() == "500" ? $e->getMessage() : "Error al momento de eliminar, puede que el registro esté usado"));
        }
    }

    public function getById(int $idPago)
    {
        try {
            $pago = Pago::find($idPago);
            echo json_encode($pago);
        } catch (Exception $e) {
            header("HTTP/1.0 404 " . $e->getMessage());
        }
    }
}
