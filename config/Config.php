<?php
/**
 * Variables de configuración del proyecto
 */

const APP_NAME = "Nirespa";
const APP_VERSION = "2.1";
define("UPLOAD_TMP_DIR", (ini_get('upload_tmp_dir') ? ini_get('upload_tmp_dir') : sys_get_temp_dir()) . (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' ? DIRECTORY_SEPARATOR : ""));
const LOGGER_LEVEL = "100"; //DEBUG=100, ERROR=400 para ver mas constantes en: vendor\monolog\monolog\src\Monolog\Logger.php
const BD_CONFIG = [
    'driver' => 'mysql',
    'host' => 'localhost',
    'database' => 'tesoreria',
    'username' => 'root',
    'password' => '****',
    'charset' => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix' => '',
];
const FILE_SERVER = ""; //all, DEBUG, ERROR
const KEY_SECREET = "B_*"; //Sirve para encriptar IDs usados en los metodos GET. 
const KEY_SECREET_FOR_CLIENT = ""; //Este valor debe ser igual al archivo environment de angular
const SHOW_ROWS_GRID = 10; //Cantidad de registros a mostrar por defecto en las grillas
const REPOSITORY_PAGO = "pagos";
const REPOSITORY_EGRESO = "egresos";
const API_RENIEC = "https://";
