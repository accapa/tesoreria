<?php

namespace App\Http\Controllers;

use App\Model\{Concepto, Deuda};
use App\Helpers\Log;
use App\Model\Alumno;
use App\Model\Enums\Estado;
use App\Model\Enums\TipoConcepto;
use Illuminate\Support\Facades\DB;
use Exception;
use PDOException;

class ConceptoController extends Controller
{

    private $filters = [];

    /**
     * Usado en proyecto angular
     * Sirve para mostrar en el combo
     */
    public function listConceptoByGrupo(int $idGrupo)
    {
        $list = Concepto::where("idGrupo", $idGrupo)->get()->toArray();
        echo json_encode($list);
    }

    public function save()
    {
        $data = $this->request;
        $id = $data["idConcepto"] ?? null;
        try {
            if (empty($data["concepto"]))
                throw new Exception("Falta enviar datos", 500);
            $prod = empty($id) ? new Concepto() : Concepto::find($id);
            $prod->idGrupo = $data["idGrupo"];
            $prod->tipo = $data["tipo"];
            $prod->concepto = $data["concepto"];
            $prod->monto = $data["monto"];
            $prod->estado = $data["estado"];
            $prod->save();
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
        list($column, $sort) = explode(",", $this->filters["sort"] ?? "p.idConcepto,desc");
        $isToExcel = $this->filters["isToExcel"] ?? null; // flag que indica exportar a excel
        try {
            $query = DB::table('concepto as p')->select(
                DB::raw("ROW_NUMBER() OVER ( ORDER BY p.idConcepto desc) as row_num"),
                'p.idConcepto',
                'p.idGrupo',
                'p.tipo',
                "p.concepto",
                "g.descripcion as grupoDescripcion",
                "p.monto",
                DB::raw("case when p.tipo = '" . TipoConcepto::EGRESO->value . "' then 'No aplica' else DATE_FORMAT(p.fechaGenera, '%d/%m/%Y') end as fechaGenera"),
                DB::raw("DATE_FORMAT(p.fechaRegistro, '%d/%m/%Y %H:%i') as fechaRegistro"),
                "p.estado",
            )
                ->leftJoin('grupo as g', 'g.idGrupo', '=', 'p.idGrupo')
                ->when(!empty($this->filters["idGrupo"] ?? ""), function ($query) {
                    $query->where("p.idGrupo", $this->filters["idGrupo"]);
                })
                ->when(!empty($this->filters["concepto"] ?? ""), function ($query) {
                    $query->where("concepto", 'like', "%" . str_replace(" ", "%", $this->filters["concepto"]) . "%");
                })
                ->when(in_array($this->filters["estado"] ?? "", [0, 1]), function ($query) {
                    $query->where("p.estado", $this->filters["estado"]);
                })
                //Rango de Fechas
                ->when(!empty($this->filters["fechaDesde"]) && !empty($this->filters["fechaHasta"]), function ($query) {
                    $query->whereBetween(DB::raw("DATE(p.fechaRegistro)"), [$this->filters["fechaDesde"], $this->filters["fechaHasta"]]);
                })
                ->when(!empty($this->filters["fechaDesde"]) && empty($this->filters["fechaHasta"]), function ($query) {
                    $query->where(DB::raw("DATE(p.fechaRegistro)"), $this->filters["fechaDesde"]);
                })
                ->when(empty($this->filters["fechaDesde"]) && !empty($this->filters["fechaHasta"]), function ($query) {
                    $query->where(DB::raw("DATE(p.fechaRegistro)"), $this->filters["fechaHasta"]);
                })
                ->orderBy($column, $sort);
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
            ["label" => "Categpría", "width" => 25],
            ["label" => "Nombre", "width" => 35],
            ["label" => "Precio costo", "width" => 17],
            ["label" => "Precio venta", "width" => 10],
            ["label" => "Entrada", "width" => 15],
            ["label" => "Salida", "width" => 10],
            ["label" => "Stock", "width" => 10],
            ["label" => "Límite", "width" => 10],
            ["label" => "Estado", "width" => 10],
            ["label" => "F. registro", "width" => 20],
        );
        $path = UPLOAD_TMP_DIR . uniqid("EXCEL_") . ".xlsx";
        $excel = new \App\Helpers\Excel($path);
        $excel->title = "Reporte";
        $excel->setHead($head);
        foreach ($data as $i => $item) {
            $excel->setBody(
                $i,
                [
                    "row" => ($i + 1),
                    "cat" => $item->producto_categoria,
                    "nombre" => $item->nombre,
                    "costo" => $item->precio_costo,
                    "precio" => $item->precio,
                    "compra" => $item->compra,
                    "venta" => $item->venta,
                    "stock" => $item->stock,
                    "limite" => $item->n_limite,
                    "estado" => Estado::from($item->estado)->name,
                    "fechaRegistro" => $item->fechaRegistro,
                ]
            );
        }
        $excel->generateFile();
        smartReadFile($path, "REPORTE.xlsx", "application/octet-stream", "attachment");
        @unlink($path);
    }

    public function getById(int $idConcepto)
    {
        try {
            $producto = Concepto::find($idConcepto);
            if (empty($producto))
                throw new Exception("No se ha encontrado el producto");
            echo json_encode($producto);
        } catch (Exception $e) {
            header("HTTP/1.0 404 " . $e->getMessage());
        }
    }

    public function delete(int $idConcepto)
    {
        try {
            if (empty($idConcepto))
                throw new Exception("Falta enviar el ID", 500);
            $deleted = Alumno::destroy($idConcepto);
            if (!$deleted)
                throw new Exception(str_encode("Error, no se hizo la acción"), 500);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . ($e->getCode() == "500" ? $e->getMessage() : str_encode("No es posible eliminar Concepto porque fue generado")));
            DB::rollBack();
        }
    }

    public function generarDeuda()
    {
        $logger = Log::logMonolog();
        try {
            $concepto = $this->request;
            DB::beginTransaction();
            foreach (($concepto["deudas"] ?? []) as $row) {
                $deuda = new Deuda();
                $deuda->idAlumno = $row["idAlumno"];
                $deuda->idConcepto = $concepto["idConcepto"];
                $deuda->monto = $row["montoDeuda"] ?? 0;
                $deuda->save();
            }
            $concpto = Concepto::find($concepto["idConcepto"]);
            $concpto->fechaGenera = date("Y-m-d H:i:s");
            $concpto->save();
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function listTipoCombo()
    {
        $list = TipoConcepto::list();
        echo json_encode($list);
    }
}
