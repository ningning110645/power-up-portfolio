<?php  //for read/write of portfolios.json file
header('Content-Type: application/json; charset=utf-8');
 
if (php_sapi_name() === 'cli-server') {
    define('DATA_DIR', __DIR__ . '/../local-data');
    if (!is_dir(DATA_DIR)) {    
        @mkdir(DATA_DIR);         //ถ้าโฟลเดอร์ local-data ยังไม่มี ให้สร้างขึ้นมา
    }
} else {
    define('DATA_DIR', '/var/www/data');
}

define('DATA_FILE', DATA_DIR . '/portfolios.json');

//read
function readPortfolios() {
    if (!file_exists(DATA_FILE)) { //check if file exists, if not return empty array
        return [];
    }
    $contents = @file_get_contents(DATA_FILE);
    if ($contents === false) { //if file cannot be read, return empty array
        return [];
    }
    $decoded = json_decode($contents, true);
    return is_array($decoded) ? $decoded : []; //always return empty array if file is empty
}

//write data to file
function writePortfolios($portfolios) {
    $json = json_encode($portfolios, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if (@file_put_contents(DATA_FILE, $json, LOCK_EX) === false) {
        cannotSave(DATA_FILE);
    }
}

//if file cannot be saved, send error message
function cannotSave($file) {
   if (php_sapi_name() === 'cli-server') {
    $message = "On your laptop: check that the local-data folder exists and is not read-only. ";
    }else{
    $message = "On the server: check that the /var/www/data folder exists and is not read-only. ";
    }
    sendJson([   //ส่ง status code 500 และข้อความ error กลับไป
        'status' => 'error',
        'error' => "Cannot save data to $file. $message"], 500);
}

// รับข้อมูลได้ทั้งจาก $_POST (FormData) และ RAW JSON (copy/paste จากบูธอื่น)
function getRequestInput():array { 
    if(!empty($_POST)) {
        return $_POST;
    }
    $input = file_get_contents('php://input');
    $json=json_decode($input, true);
    return is_array($json) ? $json : [];    
}

//ส่ง JSON response
function sendJson($data, $statusCode = 200){
    http_response_code($statusCode);
    echo json_encode($data,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}


?>