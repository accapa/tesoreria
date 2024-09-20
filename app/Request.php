<?php

/**
 * Copyright (c) 2020. Alfredo Ccapa Chuctaya
 * Created by IntelliJ IDEA.
 * User: accapa
 * Date: 16/10/2023 11:26 AM
 */

namespace App;

class Request
{
    private $_group; // Ej.: http://localhost/miproyecto/grupoAdmin/ReportesController/Metodo/Argumento => siempre y cuando el grupo "grupoAdmin" tenga la primera letra en minuscula, si es Mayuscula, será considerado coontrlador 
    private $_controlador;
    private $_metodo;
    private $_argumentos;

    public function __construct()
    {
        if (isset($_GET['url'])) {
            $url = filter_input(INPUT_GET, 'url', FILTER_SANITIZE_URL);
            $url = explode('/', $url);
            $url = array_filter($url);  // elimina los elementos vacios

            $_tmp = array_shift($url);
            if (!ctype_upper(substr($_tmp, 0, 1))) { //si la primera letra es minuscula
                $this->_group = $_tmp;
                $this->_controlador = array_shift($url);
            } else {
                $this->_controlador = $_tmp;
            }
            $this->_metodo = array_shift($url);
            $this->_argumentos = $url;
        }

        if (!$this->_controlador) {
            $this->_controlador = "Index";
        }

        if (!$this->_metodo) {
            $this->_metodo = 'index';
        }

        if (!isset($this->_argumentos)) {
            $this->_argumentos = [];
        }
    }

    public function getGroup()
    {
        return $this->_group;
    }

    public function getControlador()
    {
        return $this->_controlador;
    }

    public function getMetodo()
    {
        return $this->_metodo;
    }

    public function getArgs()
    {
        return $this->_argumentos;
    }
}
