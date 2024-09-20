<?php

namespace App\Http\Controllers;

use App\Model\Persona;
use Illuminate\Support\Facades\DB;
use App\Model\{Usuario};
use App\Model\Enums\Estado;
use App\Model\Enums\Rol;
use Exception;
use PDOException;

class UsuarioController extends Controller
{
    private $filters = [];

    /**
     * Usado por el sistema antiguo
     */
    public function listWithFilter()
    {
        $this->filters = $this->request;
        //todo: falta sanetizar $this->filters
        $page = $this->filters["page"] ?? 1;
        $perPage = $this->filters["size"] ?? SHOW_ROWS_GRID;
        try {
            $usuario = new Usuario();
            $query = $usuario->listWithFilter($this->filters);
            echo $query->paginate($perPage, ['*'], 'page', $page)->toJson();
        } catch (PDOException $e) {
            header("HTTP/1.0 500 Error de sintaxis SQL. " . (LOGGER_LEVEL == "100" ? $e->getMessage() : ""));
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function save()
    {
        $roles = $this->request["roles"];
        $user = trim($this->request["usuario"]);
        $idUsuario = $this->request["idUsuario"];
        try {
            if (empty($user))
                throw new Exception("Falta enviar usuario", 500);
                DB::beginTransaction();
            $usuario = empty($idUsuario) ? new Usuario() : Usuario::find($idUsuario);
            $usuario->usuario = trim($user);
            if ($this->request["changePass"]) {
                $usuario->clave = password_hash($this->request["clave"], PASSWORD_BCRYPT);
            }
            $usuario->estado = $this->request["estado"];
            $usuario->roles = strtolower(implode(",", $roles));
            $usuario->save();
            $persona = Persona::where("dni", "=", $usuario->usuario)->first(); // se está considerando al DNI como usuario
            if (!$persona) {
                $persona = new Persona();
                $persona->dni = $user;
                $persona->nombres = $this->request["nombres"];
                $persona->apellidos = $this->request["apellidos"];
                $persona->save();
            }
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function getById(int $idUsuario)
    {
        //Falta encriptar ID
        try {
            $usuario = Usuario::where("idUsuario", $idUsuario)->first();
            if (empty($usuario))
                throw new Exception("No se ha encontrado el producto stock");
            if (!empty($usuario->roles)) {
                $usuario->roles = explode(",", strtoupper($usuario->roles));
            }
            $persona = Persona::where("dni", $usuario->usuario)->first();
            if (!empty($persona)) {
                $usuario->dni = $persona->dni;
                $usuario->nombres = $persona->nombres;
                $usuario->apellidos = $persona->apellidos;
            }
            $usuario->clave = "*******";
            echo json_encode($usuario);
        } catch (Exception $e) {
            header("HTTP/1.0 404 " . $e->getMessage());
        }
    }

    public function delete(int $idUsuario)
    {
        try {
            $deleted = Usuario::destroy($idUsuario);
            if (!$deleted)
                throw new Exception(str_encode("Error, no se hizo la acción"), 500);

        } catch (PDOException $e) {
            $msg = ($e->errorInfo[1] == 1451) ? "No es posible eliminar el registro porque tiene relaciones." : "Error de sintaxis SQL. " . (LOGGER_LEVEL == "100" ? $e->getMessage() : "");
            header("HTTP/1.0 500 " . $msg);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function listUsuarioCombo(string $id_sucursal)
    {
        try {
            echo Usuario::select(
                "idUsuario",
                "usuario",
                DB::raw("concat(apellidos, ' ', nombres) as nombres")
            )->where('id_sucursal', $id_sucursal)->where('estado', Estado::ACTIVO->value)->get()->toJson();
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function listRoles()
    {
        echo json_encode(Rol::all());
    }

    public function getByUser(string $user) {
        $usuario = new Usuario();
        $rowUser = $usuario->listWithFilter(["usuario" => $user])->first();
        echo json_encode($rowUser);
    }
}
