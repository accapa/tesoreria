<?php
namespace App\Http\Controllers;

class IndexController
{
    public function index()
    {
        header('Location: index.html');
        exit();
    }

    public function __noFound()
    {
        header("Content-type: text/html");
        http_response_code(404);
    }
}