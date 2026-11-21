<?php // ตรวจข้อมูลที่ส่งมาจากฟอร์ม ก่อนที่ Server จะบันทึกลงไฟล์


// ดึงข้อความจากข้อมูลที่ส่งมา แล้วตัดช่องว่างหัวท้ายออก
// ถ้าไม่มีค่า หรือไม่ใช่ข้อความ จะได้ค่าว่าง ''
function getText($data, $key) {
    if (!isset($data[$key]) || !is_scalar($data[$key])) {
        return '';
    }
    return trim((string)$data[$key]);
}

// รับได้ทั้ง string จากฟอร์ม และ array จาก JSON ที่ paste มา
function toList($raw, $pattern) {
    if (is_array($raw)) {
        $result = [];
        foreach ($raw as $item) {
            if (is_scalar($item)) {
                $trimmed = trim((string)$item);
                if ($trimmed !== '') {
                    $result[] = $trimmed;
                }
            }
        }
        return $result;
    }

    if (!is_string($raw)) {
        return [];
    }

    $parts = preg_split($pattern, $raw); // แยกด้วย pattern ที่กำหนด
    $result = [];
    foreach ($parts as $part) {
        $part = trim($part);
        if ($part !== '') {
            $result[] = $part;
        }
    }
    return $result;
}

//เช็คว่าลิงก์ที่ส่งมาถูกต้องหรือไม่ 
function isValidLink($url) {
    if (!preg_match('#^https?://\S+\.\S+$#i', $url)) {
        return false;
    }
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

// คืนค่า ['links' => ลิงก์ที่ผ่าน, 'errors' => ข้อความ error]
function validateEvidence($raw) {
    $links = toList($raw, '/[\r\n,]+/'); // แยกด้วยคอมมา (,) หรือขึ้นบรรทัดใหม่
    $errors = [];

    if (count($links) === 0) {
        $errors[] = 'Please enter at least 1 evidence link.';
    }

    foreach ($links as $link) {
        if (!isValidLink($link)) {
            $errors[] = 'Invalid link: ' . $link . ' (it must start with http:// or https://)';
        }
    }

    if (count($errors) > 0) { 
        $links = [];
    }
    return ['links' => $links, 'errors' => $errors];
}


//check date format  
//วันที่ต้องเป็นรูปแบบ YYYY-MM-DD และเป็นวันที่ที่มีอยู่จริง 
function validateDate($date) {
    if ($date === '') {
        return 'Please enter a date.';
    }
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        return 'Date format is wrong. Use YYYY-MM-DD, for example 2026-10-18.';
    }
    $parts = explode('-', $date);
    if (!checkdate((int)$parts[1], (int)$parts[2], (int)$parts[0])) {
        return 'This date does not exist. Please check it again.';
    }
    return '';
}

//check portfolio input (เรียกใช้ใน portfolios.php)
function validatePortfolioInput($input) {
    if (!is_array($input)) {
        return ['valid' => false, 'errors' => ['Invalid input data'], 'portfolio' => null];
    }

    $errors = [];
    $portfolio = [];

    //field => ชื่อที่ใช้แสดงในข้อความ error
    $fields = [
        'displayName'        => 'Display name',
        'whatIEnjoy'         => 'What I Enjoy',
        'whatIveTried'       => "What I've Tried",
        'whatImCuriousAbout' => "What I'm Curious About",
    ];

    foreach ($fields as $key => $label) { // ตรวจแต่ละช่อง
        $value = getText($input, $key);
        if ($value === '') {
            $errors[] = 'Please fill in "' . $label . '".';
        }
        $portfolio[$key] = $value;
    }

    if (count($errors) > 0) {            // ถ้ามี error อย่างน้อย 1 ข้อ ให้ปฏิเสธ
        return ['valid' => false, 'errors' => $errors, 'portfolio' => null];
    }
    return ['valid' => true, 'errors' => [], 'portfolio' => $portfolio];
}

//check item input (เรียกใช้ใน items.php)
//reflection ส่งมาได้ 2 แบบ: แยกเป็นช่องๆ หรือซ้อนใน reflection { }
function getReflectionText($input, $ref, $key) {
    $value = getText($input, $key);
    if ($value === '') {
        $value = getText($ref, $key);
    }
    return $value;
}

function validateItemInput($input) {
    if (!is_array($input)) {
        return ['valid' => false, 'errors' => ['Invalid input format'], 'portfolioId' => null, 'item' => null];
    }

    $errors = [];

    $portfolioId = getText($input, 'portfolioId');
    $title       = getText($input, 'title');
    $type        = getText($input, 'type');
    $date        = getText($input, 'date');
    $role        = getText($input, 'role');
    $description = getText($input, 'description');
    $challengeId = getText($input, 'challengeId'); 

    $ref = [];
    if (isset($input['reflection']) && is_array($input['reflection'])) {  
        $ref = $input['reflection'];
    }
    $whatIDid     = getReflectionText($input, $ref, 'whatIDid');
    $whatILearned = getReflectionText($input, $ref, 'whatILearned');
    $challenge    = getReflectionText($input, $ref, 'challenge');
    $nextStep     = getReflectionText($input, $ref, 'nextStep');

    // check required fields 
    if ($portfolioId === '')  $errors[] = 'Please select a Portfolio.';
    if ($title === '')        $errors[] = 'Please enter a Title.';
    if ($type === '')         $errors[] = 'Please choose or enter a Type.';
    if ($role === '')         $errors[] = 'Please enter your Role.';
    if ($description === '')  $errors[] = 'Please enter a Description.';
    if ($whatIDid === '')     $errors[] = 'Please fill in "What I did".';
    if ($whatILearned === '') $errors[] = 'Please fill in "What I learned".';
    if ($challenge === '')    $errors[] = 'Please fill in "Challenge".';
    if ($nextStep === '')     $errors[] = 'Please fill in "Next step".';

    // วันที่
    $dateError = validateDate($date);
    if ($dateError !== '') {
        $errors[] = $dateError;
    }

    // skills: แยกด้วย comma หรือขึ้นบรรทัดใหม่
    $skills = toList($input['skills'] ?? '', '/[\r\n,]+/');
    if (count($skills) === 0) {
        $errors[] = 'Please enter at least 1 skill.' ;
    }

    //evidence
    $evidenceResult = validateEvidence($input['evidence'] ?? '');
    foreach ($evidenceResult['errors'] as $e) {
        $errors[] = $e;
    }

    if (count($errors) > 0) {
        return ['valid' => false, 'errors' => $errors, 'portfolioId' => null, 'item' => null];
    }

    // ข้อมูลผ่านหมดแล้ว สร้างก้อน item (ยังไม่มี id ให้ items.php ใส่)
    $item = [
        'title'       => $title,
        'type'        => $type,
        'date'        => $date,
        'role'        => $role,
        'description' => $description,
        'skills'      => $skills,
        'reflection'  => [
            'whatIDid'     => $whatIDid,
            'whatILearned' => $whatILearned,
            'challenge'    => $challenge,
            'nextStep'     => $nextStep,
        ],
        'evidence'    => $evidenceResult['links'],
        'challengeId' => $challengeId,
    ];

    return ['valid' => true, 'errors' => [], 'portfolioId' => $portfolioId, 'item' => $item];
}

//เรียกใช้ฟังก์ชัน validatePortfolioInput() และ validateItemInput() ใน api/portfolios.php และ api/items.php ตามลำดับ เพื่อเช็กข้อมูลก่อนบันทึกลงไฟล์ JSON
if (PHP_SAPI !== 'cli' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $currentScript = basename($_SERVER['SCRIPT_FILENAME'] ?? '');

    if ($currentScript === 'items.php' && function_exists('getRequestInput') && function_exists('sendJson')) {
        $result = validateItemInput(getRequestInput());
        if (!$result['valid']) {
            sendJson([
                'error'  => $result['errors'][0],
                'errors' => $result['errors']
            ], 400);
        }
    } elseif ($currentScript === 'portfolios.php' && function_exists('getRequestInput') && function_exists('sendJson')) {
        $result = validatePortfolioInput(getRequestInput());
        if (!$result['valid']) {
            sendJson([
                'error'  => $result['errors'][0],
                'errors' => $result['errors']
            ], 400);
        }
    }
}