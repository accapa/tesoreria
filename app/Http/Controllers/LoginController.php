<?php

namespace App\Http\Controllers;

use App\Model\Usuario;
use App\Helpers\Log;
use App\Model\Enums\Estado;
use Exception;

class LoginController
{
    private $request = [];

    public function __construct()
    {
        $this->getParams();
    }

    private function getParams()
    {
        $this->request = (isset($_SERVER["CONTENT_TYPE"]) && $_SERVER["CONTENT_TYPE"] == "application/json") ? json_decode(file_get_contents("php://input"), true) : $_REQUEST;
    }

    public function getVersion()
    {
        echo APP_VERSION;
    }

    public function login()
    {
        ini_set("session.cache_expire", "604800");
        ini_set("session.cookie_lifetime", "604800");
        ini_set("session.gc_maxlifetime", "604800");
        session_cache_expire(604800);
        session_start();
        try {
            $logger = Log::logMonolog();
            $username = $this->request["username"] ?? null;
            $password = $this->request["password"] ?? null;
            if (empty($username))
                throw new Exception("Ingrese su usuario");
            if (empty($password))
                throw new Exception("Ingrese su clave");
            $usuario = Usuario::where('usuario', $username)->where("estado", Estado::ACTIVO->value)->first();
            if (!$usuario)
                throw new Exception("Usuario o clave Incorrectos.");
            if (!password_verify($password, $usuario->clave))
                throw new Exception(str_encode("Usuario y Contraseña Incorrectos."));
            if (empty($usuario->roles))
                throw new Exception("Usuario no tiene roles asignados");
            $_SESSION["app_username"] = $usuario->usuario;
            $_SESSION["app_roles"] = $usuario->roles;
            $usuario->roles = explode(",", $usuario->roles);
            unset($usuario->clave);
            echo json_encode($usuario);
        } catch (Exception $e) {
            header("HTTP/1.0 500 " . $e->getMessage());
        }
    }

    public function logout()
    {
        session_start();
        unset($_SESSION["app_username"]);
        unset($_SESSION["app_roles"]);
        session_destroy();
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }
    }

    public function __noFound()
    {
        header("Content-type: text/html");
        http_response_code(404);
        include "404.html";
    }
}
