<?php
namespace App\Http\Controllers;

abstract class Controller{
    public $request = [];

    public function __construct()
    {
       $this->verifySesion();
       $this->getParams();
    }

    private function verifySesion()
    {
        session_start();
        if(!isset($_SESSION["app_username"])) {
            http_response_code(401);
            exit();
        }
    }

    public function existRol(string $rolName): bool {
        return str_contains(strtoupper($_SESSION["app_roles"] ?? ""), $rolName);
    }

    public function getUserName(): string {
        return $_SESSION["app_username"];
    }

    private function getParams(){
        $this->request = (isset($_SERVER["CONTENT_TYPE"]) && $_SERVER["CONTENT_TYPE"] == "application/json") ? json_decode(file_get_contents("php://input"), true) : $_REQUEST;
    }

    public function __noFound()
    {
        header("Content-type: text/html");
        http_response_code(404);
        include "404.html";
    }
}