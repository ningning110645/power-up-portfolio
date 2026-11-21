<?php
require_once __DIR__ . '/storage.php';
require_once __DIR__ . '/validation.php';

//รับ method ของ request
$method = $_SERVER['REQUEST_METHOD'];

//GET api/portfolios.php -> ดึงข้อมูล Portfolio ทั้งหมด 
if ($method === 'GET') {
    sendJson(readPortfolios(), 200);
}

if ($method === 'POST') {
    $input = getRequestInput();

    $displayName        = trim($input['displayName'] ?? '');
    $whatIEnjoy         = trim($input['whatIEnjoy'] ?? '');
    $whatIveTried       = trim($input['whatIveTried'] ?? '');
    $whatImCuriousAbout = trim($input['whatImCuriousAbout'] ?? '');

    // เช็กเบื้องต้นว่ากรอกข้อมูลครบทั้ง 4 ช่องไหม
    if ($displayName === '' || $whatIEnjoy === '' || $whatIveTried === '' || $whatImCuriousAbout === '') {
        sendJson(['error' => 'All portfolio fields are required'], 400);
    }

    // สร้างก้อนข้อมูลตาม Data Contract ของทีม
    $portfolio = [
        'id'                 => uniqid('p'),
        'displayName'        => $displayName,
        'whatIEnjoy'         => $whatIEnjoy,
        'whatIveTried'       => $whatIveTried,
        'whatImCuriousAbout' => $whatImCuriousAbout,
        'items'              => []
    ];

    $portfolios   = readPortfolios();
    $portfolios[] = $portfolio;
    writePortfolios($portfolios);

    sendJson($portfolio, 201);
}

sendJson(['error' => 'Method not allowed'], 405);
