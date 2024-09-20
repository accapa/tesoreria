<?php
namespace App\Helpers;

use Monolog\Logger;

final class Log
{
    private static $logger;
    /**
     * Log4php constructor.
     */
    public function __construct()
    {
    }

    public static function logMonolog()
    {
        if (!isset(self::$logger)) {
            self::$logger = new Logger('Nirespa');
            self::$logger->pushHandler(new \Monolog\Handler\StreamHandler(UPLOAD_TMP_DIR . "logs/nirespa-log_" . date("Y-m-d") . ".log", LOGGER_LEVEL));
            if (LOGGER_LEVEL == Logger::DEBUG) {
                self::$logger->pushProcessor(new \Monolog\Processor\IntrospectionProcessor()); //Mostrar detalles solo cuando esta en modo DEBUG, por seguridad
            }
        }
        return self::$logger;
    }
}

