<?php
/**
 * AJAX endpoint: mark a level complete / not-complete.
 * Keeps progress as a clean prefix (you can only complete the next mission,
 * and only un-complete the most recent one) so the journey stays consistent.
 */
require __DIR__ . '/config.php';
require __DIR__ . '/roadmap.php';

header('Content-Type: application/json');

$user = current_user_row();
if (!$user) { http_response_code(401); echo json_encode(['ok' => false, 'error' => 'not logged in']); exit; }
if (!check_csrf()) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'bad token']); exit; }

$body   = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$key    = $body['key'] ?? '';
$action = $body['action'] ?? '';

$track = track_for_user($user);
$flat = all_levels_flat($track);
if (!isset($flat[$key])) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'unknown level']); exit; }
$target = $flat[$key];

// Load current completed set.
$stmt = db()->prepare('SELECT level_key FROM progress WHERE user_id = ?');
$stmt->execute([$user['id']]);
$completedSet = array_flip(array_column($stmt->fetchAll(), 'level_key'));

// Frontier index = first incomplete level.
$frontier = count($flat);
foreach ($flat as $lvl) {
    if (!isset($completedSet[$lvl['key']])) { $frontier = $lvl['index']; break; }
}

if ($action === 'complete') {
    // Only the current frontier mission can be completed.
    if ($target['index'] !== $frontier) {
        echo json_encode(['ok' => false, 'error' => 'finish earlier missions first']); exit;
    }
    $ins = db()->prepare('INSERT INTO progress (user_id, level_key, completed_at) VALUES (?,?,?)');
    try { $ins->execute([$user['id'], $key, gmdate('c')]); } catch (Throwable $e) { /* already there */ }
} elseif ($action === 'uncomplete') {
    // Only the most recently completed mission can be undone (frontier - 1).
    if ($target['index'] !== $frontier - 1) {
        echo json_encode(['ok' => false, 'error' => 'only the latest mission can be undone']); exit;
    }
    $del = db()->prepare('DELETE FROM progress WHERE user_id = ? AND level_key = ?');
    $del->execute([$user['id'], $key]);
} else {
    http_response_code(400); echo json_encode(['ok' => false, 'error' => 'bad action']); exit;
}

// Recompute totals (only count levels that belong to this track).
$stmt->execute([$user['id']]);
$doneKeys = array_flip(array_column($stmt->fetchAll(), 'level_key'));
$done = count(array_intersect_key($doneKeys, $flat));
$total = count($flat);

echo json_encode([
    'ok'       => true,
    'done'     => $done,
    'total'    => $total,
    'xp'       => $done * XP_PER_LEVEL,
    'pct'      => $total ? round($done / $total * 100) : 0,
    'frontier' => min($done, $total),
]);
