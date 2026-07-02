<?php
require __DIR__ . '/config.php';
require __DIR__ . '/roadmap.php';

$user = require_login();
if (!empty($user['is_teacher'])) { header('Location: teacher.php'); exit; }

// Which galaxy is this explorer on right now? (recalculated from birth date)
$track   = track_for_user($user);
$age     = age_from_birthdate($user['birthdate'] ?? null);

// Grew up to 8+? Clear any leftover Junior progress and move to the main track.
if ($track === 'main') {
    $jr = track_keys('junior');
    if ($jr) {
        $place = implode(',', array_fill(0, count($jr), '?'));
        $del = db()->prepare("DELETE FROM progress WHERE user_id = ? AND level_key IN ($place)");
        $del->execute(array_merge([$user['id']], $jr));
    }
}

// Load this user's completed levels.
$stmt = db()->prepare('SELECT level_key FROM progress WHERE user_id = ?');
$stmt->execute([$user['id']]);
$completed = array_column($stmt->fetchAll(), 'level_key');
$completedSet = array_flip($completed);

$flat   = all_levels_flat($track);
$total  = count($flat);
$done   = count(array_intersect_key($completedSet, $flat)); // ignore stray keys
$pct    = $total ? round($done / $total * 100) : 0;
$xp     = $done * XP_PER_LEVEL;
$rank   = rank_for($done, $total);

// The "frontier" = index of the first not-yet-completed level (the next mission).
$frontier = $total;
foreach ($flat as $lvl) {
    if (!isset($completedSet[$lvl['key']])) { $frontier = $lvl['index']; break; }
}

// Build the learning content map shown inside the popup for each level.
$levelContent = [];
foreach (roadmap_for($track) as $stage) {
    foreach ($stage['levels'] as $lvl) {
        $levelContent[$lvl['key']] = [
            'title'   => $lvl['title'],
            'topic'   => $lvl['topic'],
            'tool'      => isset($lvl['tool']) ? $lvl['tool'] : '',
            'learn'     => isset($lvl['learn']) ? $lvl['learn'] : [],
            'mission'   => isset($lvl['mission']) ? $lvl['mission'] : '',
            'steps'     => isset($lvl['steps']) ? $lvl['steps'] : [],
            'platforms' => isset($lvl['platforms']) ? $lvl['platforms'] : [],
            'resources' => isset($lvl['resources']) ? $lvl['resources'] : [],
            'stage'   => $stage['name'],
            'color'   => $stage['color'],
        ];
    }
}

/* ---------------------------------------------------------------
   Build the winding map geometry: every level is a circle, and a
   single SVG road runs through all of the circle centres.
   --------------------------------------------------------------- */
// Wide layout. The road is a clean sine S-curve; mission circles are placed at
// EQUAL arc-length (equal distance measured along the road) so the spacing
// between circles is constant. A bit of extra road is added at each world break
// to give the stage banner room.
// Wide layout. The road is a clean sine S-curve; mission circles are placed at
// EQUAL arc-length (equal distance measured along the road) so the spacing
// between circles is constant. A bit of extra road is added at each world break
// to give the stage banner room.
$MAP_W = 800; $CX = 400; $AMP = 235; $WAVELEN = 540; $PAD_TOP = 120; $PAD_BOT = 96;
$SPACING = 150;     // distance along the road between two missions
$WORLD_GAP = 150;   // extra road before each new stage (for the banner)

// the S-curve: x as a function of vertical position y
$xfn = function ($yy) use ($CX, $AMP, $WAVELEN) { return $CX + $AMP * sin(2 * M_PI * $yy / $WAVELEN); };

// flat, ordered list of every mission with its stage info
$flat = [];
$gi = 0;
foreach (roadmap_for($track) as $si => $stage) {
    foreach ($stage['levels'] as $li => $lvl) {
        $flat[] = [
            'key' => $lvl['key'], 'index' => $gi, 'title' => $lvl['title'],
            'color' => $stage['color'], 'start' => ($li === 0),
            'stageName' => $stage['name'], 'stageNum' => $si + 1,
        ];
        $gi++;
    }
}
$n = count($flat);

// walk down the curve, dropping a circle every time we've travelled the target
// distance along the road (extra distance before a new stage's first circle).
$step = 1.0;
$pts = [];
$y = $PAD_TOP; $px = $xfn($y);
$pts[0] = [$px, $y];
$idx = 1; $accum = 0.0;
while ($idx < $n) {
    $target = $flat[$idx]['start'] ? ($SPACING + $WORLD_GAP) : $SPACING;
    $ny = $y + $step; $nx = $xfn($ny);
    $accum += hypot($nx - $px, $ny - $y);
    if ($accum >= $target) { $pts[$idx] = [$nx, $ny]; $accum = 0.0; $idx++; }
    $y = $ny; $px = $nx;
}
// one more step of road for the finish circle
$finishX = null; $finishY = null;
while ($finishX === null) {
    $ny = $y + $step; $nx = $xfn($ny);
    $accum += hypot($nx - $px, $ny - $y);
    if ($accum >= $SPACING) { $finishX = $nx; $finishY = $ny; }
    $y = $ny; $px = $nx;
}

// attach positions to the missions
$nodes = [];
for ($i = 0; $i < $n; $i++) {
    $nd = $flat[$i];
    $nd['x'] = $pts[$i][0];
    $nd['y'] = $pts[$i][1];
    $nodes[] = $nd;
}
// The last mission in each stage sits just above the next stage's banner, so
// flag it to render its label ABOVE the circle (below would clash with the banner).
for ($i = 0; $i < $n - 1; $i++) {
    $nodes[$i]['stageEnd'] = !empty($flat[$i + 1]['start']);
}
$mapH = $finishY + $PAD_BOT;

// stage banners sit in the extra road gap before each world
$banners = [];
foreach ($nodes as $i => $nd) {
    if (!$nd['start']) continue;
    $by = ($i === 0) ? ($nd['y'] - 74) : (($nodes[$i - 1]['y'] + $nd['y']) / 2);
    $banners[] = ['y' => $by, 'name' => $nd['stageName'], 'color' => $nd['color'], 'num' => $nd['stageNum']];
}

// The road is the TRUE sine curve sampled densely (not a curve through the
// sparse circle points) → one perfectly smooth, continuous S. The circles are
// sampled from the same sine, so they sit exactly on this road.
$P = [];
$startY = $nodes[0]['y'];
for ($yy = $startY; $yy < $finishY; $yy += 26) { $P[] = [$xfn($yy), $yy]; }
$P[] = [$finishX, $finishY];
$m = count($P);
$d = '';
if ($m > 1) {
    $d = 'M' . round($P[0][0], 1) . ' ' . round($P[0][1], 1);
    for ($i = 0; $i < $m - 1; $i++) {
        $p0 = $P[$i > 0 ? $i - 1 : 0];
        $p1 = $P[$i];
        $p2 = $P[$i + 1];
        $p3 = $P[$i + 2 < $m ? $i + 2 : $m - 1];
        $c1x = $p1[0] + ($p2[0] - $p0[0]) / 6; $c1y = $p1[1] + ($p2[1] - $p0[1]) / 6;
        $c2x = $p2[0] - ($p3[0] - $p1[0]) / 6; $c2y = $p2[1] - ($p3[1] - $p1[1]) / 6;
        $d .= ' C' . round($c1x, 1) . ' ' . round($c1y, 1) . ' ' . round($c2x, 1) . ' ' . round($c2y, 1) . ' ' . round($p2[0], 1) . ' ' . round($p2[1], 1);
    }
}

// helper: node x as a percentage of map width (so the map scales fluidly)
$xpct = function ($x) use ($MAP_W) { return round($x / $MAP_W * 100, 3); };

// Horizontal divider between worlds (one line where each new stage begins).
$dividerYs = [];
foreach ($banners as $b) { if ((int)$b['num'] > 1) $dividerYs[] = $b['y']; }

/* Self-drawn, copyright-free coding doodles dropped into the empty side space. */
$DECOS = [
    'robot' => '<svg viewBox="0 0 64 64"><rect x="16" y="20" width="32" height="26" rx="7" fill="#6a8bff"/><circle cx="26" cy="32" r="4.2" fill="#fff"/><circle cx="38" cy="32" r="4.2" fill="#fff"/><circle cx="26" cy="32" r="2" fill="#2a3252"/><circle cx="38" cy="32" r="2" fill="#2a3252"/><rect x="25" y="40" width="14" height="3" rx="1.5" fill="#cfe0ff"/><line x1="32" y1="12" x2="32" y2="20" stroke="#9a6bff" stroke-width="3"/><circle cx="32" cy="11" r="3" fill="#ff5fa2"/><rect x="10" y="27" width="4" height="11" rx="2" fill="#9a6bff"/><rect x="50" y="27" width="4" height="11" rx="2" fill="#9a6bff"/></svg>',
    'rocket' => '<svg viewBox="0 0 64 64"><path d="M32 6C42 16 42 32 36 44H28C22 32 22 16 32 6Z" fill="#6a8bff"/><circle cx="32" cy="24" r="5" fill="#cfe0ff"/><path d="M28 38L20 47l7-3Z" fill="#9a6bff"/><path d="M36 38l8 9-7-3Z" fill="#9a6bff"/><path d="M29 44h6l-3 11Z" fill="#ff8a3c"/></svg>',
    'laptop' => '<svg viewBox="0 0 64 64"><rect x="13" y="15" width="38" height="26" rx="3" fill="#2a3252"/><rect x="17" y="19" width="30" height="18" rx="1" fill="#cfe0ff"/><path d="M25 25l-4 4 4 4" fill="none" stroke="#4c6fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M39 25l4 4-4 4" fill="none" stroke="#9a6bff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><line x1="30" y1="35" x2="34" y2="23" stroke="#ff5fa2" stroke-width="2.6" stroke-linecap="round"/><path d="M8 44h48l-4 6H12Z" fill="#9aa9d6"/></svg>',
    'bug' => '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="37" rx="13" ry="16" fill="#ff5fa2"/><line x1="32" y1="23" x2="32" y2="53" stroke="#fff" stroke-width="2"/><circle cx="32" cy="20" r="7" fill="#2a3252"/><line x1="27" y1="14" x2="21" y2="9" stroke="#2a3252" stroke-width="2.6" stroke-linecap="round"/><line x1="37" y1="14" x2="43" y2="9" stroke="#2a3252" stroke-width="2.6" stroke-linecap="round"/><line x1="19" y1="31" x2="11" y2="27" stroke="#2a3252" stroke-width="2.6" stroke-linecap="round"/><line x1="45" y1="31" x2="53" y2="27" stroke="#2a3252" stroke-width="2.6" stroke-linecap="round"/><line x1="19" y1="43" x2="11" y2="47" stroke="#2a3252" stroke-width="2.6" stroke-linecap="round"/><line x1="45" y1="43" x2="53" y2="47" stroke="#2a3252" stroke-width="2.6" stroke-linecap="round"/><circle cx="28" cy="33" r="2" fill="#fff"/><circle cx="36" cy="41" r="2" fill="#fff"/></svg>',
    'bulb' => '<svg viewBox="0 0 64 64"><path d="M32 10a16 16 0 0 1 10 28c-2 2-3 4-3 7H25c0-3-1-5-3-7a16 16 0 0 1 10-28Z" fill="#ffd24a"/><rect x="26" y="46" width="12" height="4" rx="2" fill="#9aa9d6"/><rect x="27" y="51" width="10" height="3" rx="1.5" fill="#9aa9d6"/><path d="M30 30v8M34 30v8" stroke="#ff8a3c" stroke-width="2"/></svg>',
    'gear' => '<svg viewBox="0 0 64 64"><path fill="#34d399" d="M36 6l1.6 5.3 5.4-1.6 2.6 4.9-4.1 3.8 3.8 4.1-1.6 5.4 5.3 1.6v5.6l-5.3 1.6 1.6 5.4-3.8 4.1 4.1 3.8-2.6 4.9-5.4-1.6L36 58h-5.6l-1.6-5.3-5.4 1.6-2.6-4.9 4.1-3.8-3.8-4.1 1.6-5.4L17 34.4v-5.6l5.3-1.6-1.6-5.4 3.8-4.1-4.1-3.8 2.6-4.9 5.4 1.6L30.4 6z"/><circle cx="33" cy="32" r="8" fill="#fff"/></svg>',
    'brackets' => '<svg viewBox="0 0 64 64"><path d="M22 16L9 32l13 16" fill="none" stroke="#4c6fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 16l13 16-13 16" fill="none" stroke="#9a6bff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="37" y1="15" x2="27" y2="49" stroke="#ff5fa2" stroke-width="5" stroke-linecap="round"/></svg>',
    'terminal' => '<svg viewBox="0 0 64 64"><rect x="10" y="14" width="44" height="36" rx="5" fill="#2a3252"/><path d="M10 19a5 5 0 0 1 5-5h34a5 5 0 0 1 5 5v4H10z" fill="#46507a"/><circle cx="17" cy="18.5" r="1.8" fill="#ff5fa2"/><circle cx="23" cy="18.5" r="1.8" fill="#ffd24a"/><circle cx="29" cy="18.5" r="1.8" fill="#34d399"/><path d="M18 32l6 5-6 5" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><line x1="30" y1="42" x2="44" y2="42" stroke="#cfe0ff" stroke-width="3" stroke-linecap="round"/></svg>',
    'planet' => '<svg viewBox="0 0 64 64"><circle cx="30" cy="30" r="15" fill="#9a6bff"/><circle cx="24" cy="25" r="3.5" fill="#b98bff"/><circle cx="35" cy="33" r="2.5" fill="#b98bff"/><ellipse cx="32" cy="33" rx="25" ry="8" fill="none" stroke="#ffd24a" stroke-width="3" transform="rotate(-20 32 33)"/></svg>',
    'controller' => '<svg viewBox="0 0 64 64"><rect x="8" y="24" width="48" height="22" rx="11" fill="#4c6fff"/><circle cx="44" cy="31" r="3" fill="#fff"/><circle cx="50" cy="38" r="3" fill="#fff"/><rect x="15" y="33.5" width="11" height="3" rx="1.5" fill="#fff"/><rect x="19" y="29.5" width="3" height="11" rx="1.5" fill="#fff"/></svg>',
    'sparkles' => '<svg viewBox="0 0 64 64"><path d="M24 10l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#ffd24a"/><path d="M45 30l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#ff5fa2"/></svg>',
    'coffee' => '<svg viewBox="0 0 64 64"><path d="M14 24h30v12a12 12 0 0 1-12 12h-6a12 12 0 0 1-12-12z" fill="#46507a"/><path d="M44 27h5a6 6 0 0 1 0 12h-5" fill="none" stroke="#46507a" stroke-width="3"/><path d="M22 12c-2 3 2 4 0 7M30 12c-2 3 2 4 0 7" stroke="#b98bff" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="13" y="50" width="32" height="3" rx="1.5" fill="#9aa9d6"/></svg>',
];

// Place doodles in the empty space on the side opposite the road — spread
// from near the top (so Stage 1 gets pictures too) down to the finish.
$decoNames = array_keys($DECOS);
$decoCount = max(8, (int) floor($mapH / 320));
$decos = [];
$top = $PAD_TOP + 26; $bot = $mapH - 120;
$slotStep = ($bot - $top) / max(1, $decoCount - 1);
for ($s = 0; $s < $decoCount; $s++) {
    $dy = $top + $slotStep * $s;
    foreach ($dividerYs as $dvy) { if (abs($dvy - $dy) < 90) { $dy += 78; break; } }
    foreach ($banners as $b) { if (abs($b['y'] - $dy) < 90) { $dy += 78; break; } }
    $rx = $xfn($dy);
    $dx = ($rx >= $CX) ? 66 : ($MAP_W - 66);   // opposite side of the road
    $decos[] = [
        'x' => $dx, 'y' => $dy,
        'svg' => $DECOS[$decoNames[$s % count($decoNames)]],
        'rot' => (($s % 2) ? -9 : 8), 'i' => $s + 1,
    ];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e(APP_NAME) ?> — Your Journey</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="app-page">
<canvas id="stars"></canvas>

<header class="topbar glass">
    <div class="topbar-left">
        <?= avatar_markup($user, 'me-avatar') ?>
        <div>
            <div class="me-name"><?= e($user['display_name']) ?></div>
            <div class="me-rank"><?= e($rank['name']) ?></div>
        </div>
    </div>
    <div class="topbar-mid">
        <div class="xp-row">
            <span class="xp-label"><?= $xp ?> XP</span>
            <span class="xp-label"><?= $done ?>/<?= $total ?> missions</span>
        </div>
        <div class="xp-bar"><div class="xp-fill" id="globalFill" style="width: <?= $pct ?>%"></div></div>
    </div>
    <div class="topbar-right">
        <a class="btn-ghost" href="projects.php">Project ideas</a>
        <a class="btn-ghost" href="logout.php">Log out</a>
    </div>
</header>

<main class="journey">
    <div class="journey-intro">
        <h1>Your Galaxy Map</h1>
        <?php if ($track === 'junior'): ?>
            <div class="track-badge junior">Junior Galaxy<?= $age !== null ? ' — age ' . (int)$age : '' ?> · you fly up to the big missions when you turn 8!</div>
        <?php endif; ?>
        <p>Follow the road from circle to circle. Tap any mission to see what to do — then mark it done to light up your path!</p>
    </div>

    <div class="map" style="width:100%; max-width:<?= $MAP_W ?>px; height:<?= $mapH ?>px">
        <svg class="map-road" viewBox="0 0 <?= $MAP_W ?> <?= $mapH ?>" preserveAspectRatio="none" aria-hidden="true">
            <path class="road-base" d="<?= $d ?>"/>
            <path class="road-dash" d="<?= $d ?>"/>
        </svg>

        <?php foreach ($decos as $dc): ?>
            <div class="map-deco" style="left:<?= $xpct($dc['x']) ?>%; top:<?= round($dc['y'], 1) ?>px; --r:<?= (int)$dc['rot'] ?>deg; --i:<?= (int)$dc['i'] ?>"><?= $dc['svg'] ?></div>
        <?php endforeach; ?>

        <?php foreach ($dividerYs as $dvy): ?>
            <div class="stage-divider" style="top:<?= round($dvy, 1) ?>px"></div>
        <?php endforeach; ?>

        <?php foreach ($banners as $b): ?>
            <div class="map-banner" style="top:<?= round($b['y'], 1) ?>px; --c:<?= e($b['color']) ?>">
                <span class="banner-num"><?= (int)$b['num'] ?></span>
                <span class="banner-name"><?= e($b['name']) ?></span>
            </div>
        <?php endforeach; ?>

        <?php foreach ($nodes as $nd):
            $idx       = $nd['index'];
            $isDone    = isset($completedSet[$nd['key']]);
            $isCurrent = (!$isDone && $idx === $frontier);
            $state     = $isDone ? 'done' : ($isCurrent ? 'current' : 'locked');
            $icon      = $isDone ? icon('check') : ($isCurrent ? (string)($idx + 1) : icon('lock'));
        ?>
            <div class="level map-node node-<?= $state ?> <?= $nd['start'] ? 'is-start' : '' ?> <?= !empty($nd['stageEnd']) ? 'is-stage-end' : '' ?>"
                 style="left:<?= $xpct($nd['x']) ?>%; top:<?= round($nd['y'], 1) ?>px; --c:<?= e($nd['color']) ?>; --i:<?= $idx ?>"
                 data-key="<?= e($nd['key']) ?>" data-index="<?= $idx ?>" title="<?= e($nd['title']) ?>">
                <span class="node-circle"><span class="dot-icon"><?= $icon ?></span></span>
                <span class="node-label"><?= e($nd['title']) ?></span>
            </div>
        <?php endforeach; ?>

        <div class="map-node node-finish" style="left:<?= $xpct($finishX) ?>%; top:<?= round($finishY, 1) ?>px; --i:<?= $n ?>">
            <span class="node-circle"><span class="dot-icon"><?= icon('star') ?></span></span>
            <span class="node-label">Finish</span>
        </div>
    </div>

    <p class="map-foot">Reach the last circle to become a <strong>real programmer</strong> and earn the <strong>Galaxy Legend</strong> rank.</p>
</main>

<!-- Lesson modal: opens when a mission is tapped -->
<div id="levelModal" class="modal" hidden>
    <div class="modal-backdrop" data-close></div>
    <div class="modal-card glass">
        <button class="modal-x" data-close aria-label="Close">&times;</button>
        <div class="modal-head">
            <span class="modal-tool" id="mTool"></span>
            <span class="modal-stage" id="mStage"></span>
        </div>
        <h2 class="modal-title" id="mTitle"></h2>
        <p class="modal-topic" id="mTopic"></p>

        <div class="modal-section">
            <h3>What you'll learn</h3>
            <ul id="mLearn"></ul>
        </div>
        <div class="modal-section">
            <h3>Your mission</h3>
            <p id="mMission"></p>
        </div>

        <button type="button" class="modal-res-btn modal-teach-btn" id="mTeachBtn">What to do — step by step</button>
        <div class="modal-res modal-teach" id="mTeachPanel" hidden>
            <h4>Do these steps</h4>
            <ol class="teach-list" id="mTeach"></ol>
        </div>

        <button type="button" class="modal-res-btn" id="mResBtn">See where to learn this</button>
        <div class="modal-res" id="mResPanel" hidden>
            <h4>Languages &amp; platforms</h4>
            <div class="tag-row" id="mPlatforms"></div>
            <h4>Suggested sources</h4>
            <ul class="res-list" id="mResources"></ul>
        </div>

        <div class="modal-foot">
            <button class="btn-blast" id="mAction"></button>
            <div class="modal-note" id="mNote"></div>
        </div>
    </div>
</div>

<!-- Celebration overlay -->
<div id="celebrate" class="celebrate" hidden>
    <div class="celebrate-card glass">
        <div class="celebrate-emoji"><?= icon('star') ?></div>
        <div class="celebrate-title">Mission Complete!</div>
        <div class="celebrate-sub" id="celebrateSub">+100 XP</div>
    </div>
</div>

<script>
window.CG = {
    csrf: <?= json_encode(csrf_token()) ?>,
    xpPerLevel: <?= XP_PER_LEVEL ?>,
    total: <?= $total ?>,
    frontier: <?= $frontier ?>,
    levels: <?= json_encode($levelContent, JSON_UNESCAPED_UNICODE) ?>
};
</script>
<?= site_footer() ?>
<script src="assets/js/stars.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>
