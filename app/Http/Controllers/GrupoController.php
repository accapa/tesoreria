<?php

namespace App\Http\Controllers;

use App\Model\{Grupo};
use App\Model\Alumno;
use App\Model\Enums\Estado;
use App\Model\Enums\Rol;
use Exception;
use PDOException;

class GrupoController extends Controller
{
   
    public function save()
    {
        $data = $this->request;
        $id = $data["idGrupo"] ?? null;
        try {
            $grupo = empty($id) ? new Grupo() : Grupo::find($id);
            $grupo->descripcion = $data["descripcion"];
            $grupo->estado = $data["estado"];
            $grupo->save();
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function getById(int $idGrupo)
    {
        try {
            $producto = Grupo::find($idGrupo);
            if (empty($producto))
                throw new Exception("No se ha encontrado el producto");
            echo json_encode($producto);
        } catch (Exception $e) {
            header("HTTP/1.0 404 " . $e->getMessage());
        }
    }

    public function listWithFilter()
    {
        $page = $this->filters["page"] ?? 1;
        $perPage = $this->filters["size"] ?? SHOW_ROWS_GRID;
        $isToExcel = $this->filters["isToExcel"] ?? null; // flag que indica exportar a excel
        try {
            $mantenimiento = new Grupo();
            $query = $mantenimiento->listWithFilter($this->request);
            if ($isToExcel) {
                $this->toExcel($query->get()->toArray());
                exit;
            }
            echo $query->paginate($perPage, ['*'], 'page', $page)->toJson();
        } catch (PDOException $e) {
            header("HTTP/1.0 500 Error de sintaxis SQL. " . (LOGGER_LEVEL == "100" ? $e->getMessage() : ""));
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    private function toExcel(array $data)
    {
        $head = array(
            ["label" => "Nro.", "width" => 5],
            ["label" => "Sucursal", "width" => 17],
            ["label" => "Categoría", "width" => 25],
            ["label" => "Descripción", "width" => 25],
            ["label" => "Estado", "width" => 10],
            ["label" => "F. registro", "width" => 25]
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
                    "sucursal" => $item->sucu_nombre,
                    "producto" => $item->producto_categoria,
                    "desc" => $item->descripcion,
                    "estado" => Estado::from($item->id_estado)->name,
                    "fechaRegistro" => $item->fechaRegistro,
                ]
            );
        }
        $excel->generateFile();
        smartReadFile($path, "REPORTE.xlsx", "application/octet-stream", "attachment");
        @unlink($path);
    }
    
    /**
     * Sirve para llenar los datos del combo grupo
     */
    public function listGrupo()
    {
        try {
            if (!$this->existRol(Rol::ADMIN->value)) {
                $alumno = new Alumno();
                $list = $alumno->listWithFilter(["dni" => $this->getUserName()])->get()->toArray();
                $ids = array_column($list, 'idGrupo');
                $list = Grupo::whereIn('idGrupo', $ids)->get();
            } else {
                $ser = new Grupo();
                $list = $ser->listGrupo();
            }
            echo json_encode($list);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }
}
