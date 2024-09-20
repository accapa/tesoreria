<?php

/**
 * Created by IntelliJ IDEA.
 * User: accapa
 * Date: 11/06/2019
 * Time: 01:50 PM
 */

namespace App\Helpers;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\{Alignment, Border, Fill, NumberFormat};
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Exception;
use DateTime;

class Excel
{
    private $path; //ruta con nombre de archivo
    private $spreadsheet;
    public $title = "DOCUMENTOS";

    public $colum = 1; // Coordenada: X
    public $row = 1; // Coordenada: Y

    private $columEnd = 1; //Cantidad de columnas recibidas !no usar este variable
    private $rowEnd = 1; //Cantidad de filas recibidas !no usar este variable

    public $customCell = []; //["venta" => new RichText()]; Sirve para perzonaliar las celdas a imprimir. Si hay un valor => aplicará el objeto enviado como RichText
    function __construct($path = "")
    {
        $this->spreadsheet = new Spreadsheet();
        $this->setProperties();
        $this->path = $path;
    }

    /**
     * Genera el encabezado del reporte excel
     * Si se usa este metodo, es importante usar los metodos "setHead, setBody, generateFile" respectivamente
     * @param array $head, array de las columnas ej: ['label' => "COLUMN NAME", "width" => int]
     */
    function setHead($head = [])
    {
        $columOf = $this->colum > 1 ? $this->colum - 1 : 0;
        $rowOf = $this->row > 0 ? $this->row : 1;
        $sheet = $this->spreadsheet->getActiveSheet();
        $index = 0;
        foreach ($head as $index => $item) {
            $letter = $this->toAlpha($index + $columOf);
            $sheet->setCellValue($letter . $rowOf, $item["label"]);
            $sheet->getColumnDimension($letter)->setWidth($item["width"]);
        }
        $this->columEnd = $index;
        //Poniendo encabecado de color blanco y fondo oscuro
        $rango = $this->toAlpha($columOf) . ($rowOf) . ":" . $this->toAlpha($index + $columOf) . $rowOf;
        $sheet->getStyle($rango)->getFont()->applyFromArray(
            [
                'name' => 'Calibri Light', 'bold' => TRUE, 'italic' => FALSE,
                'color' => ['rgb' => 'FFFFFF']
            ]
        );
        $sheet->getStyle($rango)->getFill()->applyFromArray(
            [
                'fillType' => Fill::FILL_SOLID, 'rotation' => 0, 'color' => ['argb' => '737373']
            ]
        );
    }

    /**
     * Registro del cuerpo del reporte excel
     * Si se usa este metodo, es importante usar los metodos "setHead, setBody, generateFile" respectivamente
     * @param int $irow, numero de la coordena "Y" del excel
     * @param array $row, columnas a mostrar en el excel
     */
    function setBody($irow = 1, $row = [])
    {
        $columOf = $this->colum > 1 ? $this->colum - 1 : 0;
        $rowOf = $this->row > 0 ? $this->row : 1;
        $i = 0;
        foreach ($row as $strIndex => $item) {
            $letter = $this->toAlpha($i + $columOf) . ($irow + 1 + $rowOf);
            $this->insertRow($letter, $item, $irow . $strIndex);
            $i++;
        }
        $this->rowEnd = $irow + 2;
    }



    /**
     * Genera el archivo excel recibiendo los array $head y $datos
     * @param array $head , Ej: ['label' => "COLUMN NAME", "width" => int]
     * @param array $datos , Ej: ['item' => 'VALUE', ...]
     * @throws \PhpOffice\PhpSpreadsheet\Writer\Exception
     */
    function generateExcel($head = [], $datos = [])
    {
        $this->setHead($head);
        $columOf = $this->colum > 1 ? $this->colum - 1 : 0;
        $rowOf = $this->row > 0 ? $this->row : 1;
        $irow = 0;
        foreach ($datos as $irow => $row) {
            $i = 0;
            foreach ($row as $item) {
                $letter = $this->toAlpha($i + $columOf) . ($irow + 1 + $rowOf);
                $this->insertRow($letter, $item);
                $i++;
            }
        }
        unset($head, $datos);
        $this->rowEnd = $irow + 2;
        $this->generateFile();
    }

    /**
     * Genera el archivo excel en la ruta espedificada: path
     * @throws \PhpOffice\PhpSpreadsheet\Writer\Exception
     */
    function generateFile()
    {
        $this->setStyle();
        $sheet = $this->spreadsheet->getActiveSheet();
        $sheet->setTitle($this->title);
        $writer = new Xlsx($this->spreadsheet);
        $writer->save($this->path);
    }

    /**
     * Pone el formato al archivo excel
     */
    private function setStyle()
    {
        $columOf = $this->colum > 1 ? $this->colum - 1 : 0;
        $rowOf = $this->row > 0 ? $this->row : 1;
        $sheet = $this->spreadsheet->getActiveSheet();
        //Poniendo bordes
        $tempx = $this->toAlpha($columOf);
        $tempy = $this->toAlpha($this->columEnd + $columOf);
        $rango = $tempx . $rowOf . ":" . $tempy . ($this->rowEnd + ($rowOf - 1));
        $sheet->getStyle($rango)->getBorders()->applyFromArray(
            [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '464646']]
            ]
        );
        //Tipo de letra para el body
        $of = ($rowOf + 1);
        $to = ($this->rowEnd + ($rowOf - 1));
        $rango = $tempx . $of . ":" . $tempy . ($of > $to ? $of : $to);
        $sheet->getStyle($rango)->getFont()->applyFromArray(
            [
                'name' => 'Calibri Light', 'bold' => FALSE, 'italic' => FALSE,
                'color' => ['rgb' => '000000']
            ]
        );
    }

    private function setProperties()
    {
        $this->spreadsheet->getProperties()
            ->setCreator(APP_NAME)
            ->setLastModifiedBy(APP_NAME)
            ->setTitle("Reporte")
            ->setSubject("Documentos de INFORMACION")
            ->setDescription("Documentos de INFORMACION");
    }

    private function toAlpha($int)
    {
        $alphabet = array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
        if ($int <= 25) {
            return $alphabet[$int];
        } elseif ($int > 25) {
            $dividend = ($int + 1);
            $alpha = "";
            while ($dividend > 0) {
                $modulo = ($dividend - 1) % 26;
                $alpha = $alphabet[$modulo] . $alpha;
                $dividend = floor((($dividend - $modulo) / 26));
            }
            return $alpha;
        }
        return "";
    }

    /**
     * Elimina filas a partir del $pNumRows en adelante
     * @param int $pNumRows
     * @throws Exception
     */
    public function deleteRow($pNumRows = 1)
    {
        $this->spreadsheet->getActiveSheet()->removeRow(1, $pNumRows);
    }

    /**
     * Inserta una fila; Verificamos si es de tipo DateTime para formatear
     * @param string $letter
     * @param $item
     * @param string $strIndex; identificar de la fila
     */
    private function insertRow(string $letter, $item, string $strIndex = "")
    {
        $sheet = $this->spreadsheet->getActiveSheet();
        if (array_key_exists($strIndex, $this->customCell)) {
            $sheet->setCellValue($letter, $this->customCell[$strIndex]);
            $sheet->getStyle($letter)->getAlignment()->setWrapText(true);
        }  else if ($item instanceof DateTime) {
            $dateValue = Date::PHPToExcel($item);
            $sheet->getStyle($letter)->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_DATE_DATETIME);
            $sheet->setCellValue($letter, $dateValue);
        } else if (is_string($item)) {
            $sheet->setCellValueExplicit($letter, $item, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
        } else {
            $sheet->setCellValue($letter, $item);
        }
        $sheet->getStyle($letter)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
    }
}
