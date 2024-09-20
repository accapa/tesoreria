<?php

function helpersFunction()
{
    return "mensaje";
}

/** Actual month last day **/
function monthLastDay()
{
    $month = date('m');
    $year = date('Y');
    $day = date("d", mktime(0, 0, 0, $month + 1, 0, $year));
    return date('Y-m-d', mktime(0, 0, 0, $month, $day, $year));
}

/**Actual month first day **/
function monthFirstDay()
{
    $month = date('m');
    $year = date('Y');
    return date('Y-m-d', mktime(0, 0, 0, $month, 1, $year));
}


function CallAPI($method, $url, $data = null, $header = ["Content-Type: application/json"], $getHeader = false)
{
    $curl = curl_init();
    switch ($method) {
        case "POST":
            curl_setopt($curl, CURLOPT_POST, 1);
            if ($data)
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
            break;
        case "PUT":
            curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PUT");
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
            break;
        default: //usa el GET
            if ($data)
                $url = sprintf("%s?%s", $url, http_build_query($data));
    }

    // Optional Authentication:
    /*curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($curl, CURLOPT_USERPWD, "username:password");*/

    if ($getHeader) {
        curl_setopt($curl, CURLOPT_HEADER, 1);
    }
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $header);

    curl_setopt($curl, CURLOPT_TIMEOUT, 25);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0); //todo: falta usar esta opcion en 1

    $result = curl_exec($curl);
    // Comprobar el código de estado HTTP
    $http_code = 500;
    $headers = [];
    $body = "";
    if (!curl_errno($curl)) {
        $http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        if ($getHeader) {
            $header_size = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
            $strHeaders = substr($result, 0, $header_size);
            $body = substr($result, $header_size);
            $headers = [];
            $tmp = explode(PHP_EOL, $strHeaders);
            foreach ($tmp as $row) {
                $parts = explode(':', $row);
                if (count($parts) === 2) {
                    $headers[trim($parts[0])] = trim($parts[1]);
                }
            }
        } else {
            $body = $result;
        }
        if ($http_code >= 300) {
            $result = null;
        }
    }
    $errorCurl = "";
    if ($result == false)
        $errorCurl = curl_error($curl);
    curl_close($curl);
    if ($result == null | false) {
        throw new Exception("$http_code El servicio API ha retornado el codigo: " . $http_code . " " . $errorCurl, $http_code);
    }

    $response = ["result" => $body, "headers" => $headers, "statusCode" => $http_code];

    if ($response["statusCode"] >= 300 && !empty($response["result"]))
        throw new Exception($response["result"]);
    if (empty($response["result"]))
        throw new Exception("Error en la url: [" . $url . "]");
    return $response;
}

function encryptID($data, $keySecret = KEY_SECREET)
{
    $iv = random_bytes(16); // Genera un vector de inicialización (IV) aleatorio
    $encrypted = openssl_encrypt($data, 'aes-256-cbc', $keySecret, 0, $iv);
    $encryptedData = base64_encode($iv . $encrypted);
    return str_replace(['+', '/', '='], ['-', '_', ''], $encryptedData);
}

function decryptID($data, $keySecret = KEY_SECREET)
{
    $data = str_replace(['-', '_'], ['+', '/'], $data);
    $data = base64_decode($data);
    $iv = substr($data, 0, 16);
    $encrypted = substr($data, 16);
    return openssl_decrypt($encrypted, 'aes-256-cbc', $keySecret, 0, $iv);
}

/**
 * Decripta el id de la url. "5" y "-5" es la cantidad de caracteres declarados en el frontend
 */
function decrypIDGet(string $str): string
{
    $codigo = strrev(base64_decode($str));
    $id = substr(substr($codigo, 5), 0, -5);
    if (empty($id)) {
        throw new Exception("Error, el código enviado no es válido", 400);
    }
    return $id;
}

function str_encode($string)
{
    if (empty($string))
        return $string;
    return mb_convert_encoding($string, "ISO-8859-1", "UTF-8");
}

function utf_8($string)
{
    if (empty($string))
        return $string;
    return mb_convert_encoding($string, "UTF-8", "ISO-8859-1");
}

function smartReadFile($location, $filename, $mimeType = "application/octet-stream", $view = "inline"): void
{
    if (!file_exists($location)) {
        http_response_code(404);
        return;
    }
    $size = filesize($location);
    $time = date("r", filemtime($location));
    $fm = @fopen($location, "rb");
    if (!$fm) {
        header("HTTP/1.0 505 Internal server error");
        return;
    }
    $begin = 0;
    $end = $size;
    if (isset($_SERVER['HTTP_RANGE'])) {
        if (preg_match('/bytes=\h*(\d+)-(\d*)[\D.*]?/i', $_SERVER["HTTP_RANGE"], $matches)) {
            $begin = intval($matches[0]);
            if (!empty($matches[1]))
                $end = intval($matches[1]);
        }
    }
    if ($begin > 0 || $end < $size)
        header("HTTP/1.0 206 Partial Content");
    else
        header('HTTP/1.0 200 OK');

    header("Content-Type: $mimeType");
    header("Cache-Control: public, must-revalidate, max-age=0");
    header("Pragma: no-cache");
    //header('Accept-Ranges: bytes');
    header("'Content-Length:' " . ($end - $begin));
    header("Content-Range: bytes");
    //header("Content-Disposition: $view; filename=$filename");
    header("Content-Disposition: $view; filename=\"" . basename($filename) . "\""); //Evita error de los archivos que tienen coma, Cuando se descarga el archivo anexo en word: esta agregando dos veces su extencion, corregir

    header("Content-Transfer-Encoding: binary\n");
    header("Last-Modified: $time");
    header("Connection: close");
    $cur = $begin;
    fseek($fm, $begin, 0);
    while (!feof($fm) && $cur < $end && (connection_status() == 0)) {
        print fread($fm, min(1024 * 16, $end - $cur));
        $cur += 1024 * 16;
    }
}

/**
 * Sirve para guardar archivos en la tabla y carpeta
 * @throws Exception
 */
function uploadSaveFiles(string $fileKey, string $targetDir, int $id, string $tipo, string $user)
{
    $errorDir = $targetDir;
    if (isset($_FILES[$fileKey])) {
        $targetDir = FILE_SERVER . "/" . $targetDir . "/";

        if (!is_dir($targetDir)) {
            throw new Exception("Error, no existe la carpeta [$errorDir] en el servidor de archivos");
        }

        $uploadedFiles = $_FILES[$fileKey]["name"];
        $numFiles = count($uploadedFiles);

        for ($i = 0; $i < $numFiles; $i++) {
            $fileExtension = pathinfo($uploadedFiles[$i], PATHINFO_EXTENSION);
            $nombre = time() . mt_rand() . "." . strtolower($fileExtension);
            $targetFile = $targetDir . $nombre;

            if (!@move_uploaded_file($_FILES[$fileKey]["tmp_name"][$i], $targetFile)) {
                throw new Exception("Error al subir el archivo " . htmlspecialchars($uploadedFiles[$i]));
            }

            $archivo = new App\Model\Archivo();
            $archivo->nombre_real = basename($uploadedFiles[$i]);
            $archivo->nombre = $nombre;
            $archivo->usuario_registra = $user;
            $archivo->id_table = $id;
            $archivo->table = $tipo;
            $archivo->save();
        }
    }
}