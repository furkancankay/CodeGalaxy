<?php
require __DIR__ . '/config.php';
require __DIR__ . '/roadmap.php';

$teacher = require_teacher();

$total = total_levels('main'); // shown on the stat card

// Pull all students (with birth date) and their progress rows.
$students = db()->query(
    "SELECT id, username, display_name, avatar, birthdate, created_at
     FROM users WHERE is_teacher = 0"
)->fetchAll();

$progressByUser = [];
foreach (db()->query("SELECT user_id, level_key FROM progress")->fetchAll() as $row) {
    $progressByUser[$row['user_id']][$row['level_key']] = true;
}

function stage_done(array $stage, array $userKeys): int {
    $c = 0;
    foreach ($stage['levels'] as $l) if (!empty($userKeys[$l['key']])) $c++;
    return $c;
}

// Each student is scored against their own track (junior vs main).
foreach ($students as &$s) {
    $s['track']  = track_for_user($s);
    $s['age']    = age_from_birthdate($s['birthdate'] ?? null);
    $keys        = $progressByUser[$s['id']] ?? [];
    $trackKeys   = array_flip(track_keys($s['track']));
    $s['total']  = count($trackKeys);
    $s['done']   = count(array_intersect_key($keys, $trackKeys));
}
unset($s);

usort($students, function ($a, $b) {
    $pa = $a['total'] ? $a['done'] / $a['total'] : 0;
    $pb = $b['total'] ? $b['done'] / $b['total'] : 0;
    if ($pa == $pb) return strcasecmp($a['display_name'], $b['display_name']);
    return $pb <=> $pa;
});

$classCount = count($students);
$avgPct = 0;
if ($classCount) {
    $sum = 0;
    foreach ($students as $s) $sum += $s['total'] ? $s['done'] / $s['total'] : 0;
    $avgPct = round($sum / $classCount * 100);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e(APP_NAME) ?> — Teacher Dashboard</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="app-page teacher">
<canvas id="stars"></canvas>

<header class="topbar glass">
    <div class="topbar-left">
        <?= avatar_markup($teacher, 'me-avatar') ?>
        <div>
            <div class="me-name"><?= e($teacher['display_name']) ?></div>
            <div class="me-rank">Mission Control</div>
        </div>
    </div>
    <div class="topbar-right">
        <a class="btn-ghost" href="curriculum.php">Edit curriculum</a>
        <a class="btn-ghost" href="projects.php">Projects</a>
        <a class="btn-ghost" href="logout.php">Log out</a>
    </div>
</header>

<main class="teacher-main">
    <h1>Mission Control</h1>

    <div class="stat-cards">
        <div class="stat-card glass"><div class="stat-num"><?= $classCount ?></div><div class="stat-lbl">Students</div></div>
        <div class="stat-card glass"><div class="stat-num"><?= $total ?></div><div class="stat-lbl">Total missions</div></div>
        <div class="stat-card glass"><div class="stat-num"><?= $avgPct ?>%</div><div class="stat-lbl">Class average</div></div>
    </div>

    <div class="teacher-code glass">
        <div class="tc-head">
            <h2>Teacher signup code</h2>
            <p>Share this code only with other teachers. Anyone who signs up with it gets a teacher control panel like this one. Students do <strong>not</strong> need it.</p>
        </div>
        <div class="tc-box">
            <code id="teacherCode"><?= e(TEACHER_SIGNUP_CODE) ?></code>
            <button type="button" class="btn-ghost" id="copyCode" data-code="<?= e(TEACHER_SIGNUP_CODE) ?>">Copy</button>
        </div>
    </div>

    <div class="teacher-hint glass">
        Students sign up at your site with a username &amp; password — no teacher code needed for them. Just share your site link:
        <strong>code.mrfrkn.com</strong>.
    </div>

    <?php if (!$classCount): ?>
        <div class="empty glass">No students yet. Once they sign up, you'll see everyone here.</div>
    <?php else: ?>
    <div class="student-list">
        <?php foreach ($students as $s):
            $pct = $s['total'] ? round($s['done'] / $s['total'] * 100) : 0;
            $rank = rank_for((int)$s['done'], (int)$s['total']);
            $keys = $progressByUser[$s['id']] ?? [];
        ?>
        <details class="student glass">
            <summary>
                <?= avatar_markup($s, 's-avatar') ?>
                <span class="s-name"><?= e($s['display_name']) ?> <span class="s-user">@<?= e($s['username']) ?></span>
                    <span class="s-track <?= $s['track'] === 'junior' ? 'jr' : '' ?>"><?= $s['track'] === 'junior' ? 'Junior' : '8+' ?><?= $s['age'] !== null ? ' · ' . (int)$s['age'] : '' ?></span>
                </span>
                <span class="s-rank"><?= e($rank['name']) ?></span>
                <span class="s-bar"><span class="s-fill" style="width: <?= $pct ?>%"></span></span>
                <span class="s-pct"><?= $pct ?>%</span>
            </summary>
            <div class="s-detail">
                <?php foreach (roadmap_for($s['track']) as $si => $stage):
                    $sd = stage_done($stage, $keys);
                    $st = count($stage['levels']);
                ?>
                <div class="s-stage">
                    <span class="s-stage-num"><?= $si + 1 ?></span>
                    <span class="s-stage-name"><?= e($stage['name']) ?></span>
                    <span class="s-stage-prog <?= $sd===$st?'full':'' ?>"><?= $sd ?>/<?= $st ?></span>
                </div>
                <?php endforeach; ?>
            </div>
        </details>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>
</main>

<?= site_footer() ?>
<script src="assets/js/stars.js"></script>
<script>
(function () {
    var btn = document.getElementById('copyCode');
    if (!btn) return;
    btn.addEventListener('click', function () {
        var code = btn.getAttribute('data-code') || '';
        var done = function () {
            var original = btn.textContent;
            btn.textContent = 'Copied';
            btn.classList.add('copied');
            setTimeout(function () { btn.textContent = original; btn.classList.remove('copied'); }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(done, done);
        } else {
            var t = document.createElement('textarea');
            t.value = code; document.body.appendChild(t); t.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(t); done();
        }
    });
})();
</script>
</body>
</html>
