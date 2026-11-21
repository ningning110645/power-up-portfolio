<?php
require_once __DIR__ . '/storage.php';
require_once __DIR__ . '/validation.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$input       = getRequestInput();
$portfolioId = trim($input['portfolioId'] ?? '');
$title       = trim($input['title'] ?? '');

if ($portfolioId === '' || $title === '') {
    sendJson(['error' => 'portfolioId and title are required'], 400);
}

// เตรียมข้อมูล skills, evidence และ reflection (รองรับทั้งจากฟอร์มและ Paste JSON)
$rawSkills   = is_array($input['skills'] ?? '') ? $input['skills'] : explode(',', $input['skills'] ?? '');
$rawEvidence = is_array($input['evidence'] ?? '') ? 
$input['evidence'] : preg_split('/[\n,]+/', 
$input['evidence'] ?? '');
$ref         = is_array($input['reflection'] ?? null) ? $input['reflection'] : [];

$item = [
    'id'          => uniqid('item'),
    'title'       => $title,
    'type'        => trim($input['type'] ?? ''),
    'date'        => trim($input['date'] ?? ''),
    'role'        => trim($input['role'] ?? ''),
    'description' => trim($input['description'] ?? ''),
    'skills'      => array_values(array_filter(array_map('trim', $rawSkills))),
    'reflection'  => [
        'whatIDid'     => trim($input['whatIDid']     ?? $ref['whatIDid']     ?? ''),
        'whatILearned' => trim($input['whatILearned'] ?? $ref['whatILearned'] ?? ''),
        'challenge'    => trim($input['challenge']    ?? $ref['challenge']    ?? ''),
        'nextStep'     => trim($input['nextStep']     ?? $ref['nextStep']     ?? ''),
    ],
    'evidence'    => array_values(array_filter(array_map('trim', $rawEvidence))),
    'challengeId' => trim($input['challengeId'] ?? ''),
];

$portfolios = readPortfolios();
foreach ($portfolios as $i => $p) {
    if ($p['id'] === $portfolioId) {
        $portfolios[$i]['items'][] = $item;
        writePortfolios($portfolios);
        sendJson($item, 201);
    }
}

sendJson(['error' => 'Portfolio not found'], 404); 
