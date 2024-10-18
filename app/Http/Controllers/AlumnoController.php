<?php

namespace App\Http\Controllers;

use App\Helpers\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use App\Model\{Alumno, Concepto, Grupo, Persona};
use App\Model\Enums\Estado;
use App\Model\Enums\Rol;
use Exception;
use PDOException;

class AlumnoController extends Controller
{
    private $filters = [];

    public function save()
    {
        $data = $this->request;
        $id = $data["idAlumno"] ?? null;
        try {
            DB::beginTransaction();
            $alumno = empty($id) ? new Alumno() : Alumno::find($id);
            $persona = new Persona();
            $find = $persona::where("dni", $data["dni"])->first();
            $persona = empty($find) ? $persona : $find;
            $persona->dni = $data["dni"];
            $persona->nombres = $data["nombres"];
            $persona->apellidos = $data["apellidos"];
            $persona->save();

            $alumno->idPersona = $persona->idPersona;
            $alumno->idGrupo = $data["idGrupo"];
            $alumno->estado = $data["estado"];
            $alumno->save();
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
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
            $mantenimiento = new Alumno();
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

    public function getById(int $idAlumno)
    {
        //Falta encriptar ID
        try {
            $alumno = Alumno::where("idAlumno", $idAlumno)->first();
            if (empty($alumno))
                throw new Exception("No se ha encontrado el registro con el id: " . $idAlumno);

            $persona = Persona::find($alumno["idPersona"]);
            $personaoArray = $persona ? $persona->toArray() : [];
            $alumnoArray = $alumno ? $alumno->toArray() : [];
            $mergedArray = array_merge($alumnoArray, $personaoArray);
            echo json_encode($mergedArray);
        } catch (Exception $e) {
            header("HTTP/1.0 404 " . $e->getMessage());
        }
    }

    public function delete(string $id_prodcat)
    {
        try {
            if (empty($id_prodcat))
                throw new Exception("Falta enviar el ID", 500);
            $deleted = Alumno::destroy($id_prodcat);
            if (!$deleted)
                throw new Exception(str_encode("Error, no se hizo la acción"), 500);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    /**
     * Listado para llenar combo 
     */
    public function listAlumnoByGrupo(string $idGrupo)
    {
        //$logger = Log::logMonolog();
        $filters = ["idGrupo" => $idGrupo, "sort" => "apellidos,asc"];
        if (!$this->existRol(Rol::ADMIN->value)) {
            $filters["dni"] = $this->getUserName();
        }
        $alumno = new Alumno();
        $alumnos = $alumno->listWithFilter($filters)->get()->toArray();
        $list = array_map(function ($persona) {
            return ["idAlumno" => $persona->idAlumno, "nombres" => $persona->apellidos . " " . $persona->nombres];
        }, $alumnos);
        echo json_encode($list);
    }

    /**
     * Sirve para llenar los datos del combo grupo
     */
    public function listGrupo()
    {
        try {
            $ser = new Grupo();
            $list = $ser->listGrupo();
            echo json_encode($list);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function listAlumnoByConcepto(int $idConcepto)
    {
        try {

            $concepto = Concepto::find($idConcepto);
            $alumno = new Alumno();
            $query = $alumno->listWithFilter(["idGrupo" => $concepto->idGrupo, "estado" => Estado::ACTIVO->value, "sort" => "s.apellidos,asc"]);
            $query->orderBy('s.nombres', 'asc');
            echo json_encode($query->get()->toArray());
        } catch (ModelNotFoundException $e) {
            header("HTTP/1.0 404 " . $e->getMessage());
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }
}
