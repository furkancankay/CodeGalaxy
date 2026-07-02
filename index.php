<?php
require __DIR__ . '/config.php';
require __DIR__ . '/roadmap.php';

// Logged-in explorers skip the tour and jump straight to their map.
if (current_user_row()) {
    header('Location: dashboard.php');
    exit;
}

// Live curriculum numbers so the page never goes stale.
$mainStages   = roadmap_for('main');
$juniorStages = roadmap_for('junior');

$missionCount = 0;
foreach ($mainStages as $s)   { $missionCount += count($s['levels']); }
foreach ($juniorStages as $s) { $missionCount += count($s['levels']); }

$planetCount = count($mainStages) + count($juniorStages);

// Tools actually taught, in curriculum order (for the marquee).
$marquee = ['Scratch', 'Python', 'HTML & CSS', 'JavaScript', 'Loops', 'Variables',
            'Game Design', 'Functions', 'Algorithms', 'Web Pages', 'Debugging', 'Projects'];

/** Tiny local SVG helper for landing-only icons (inline SVG, never emoji). */
function licon($name, $cls = 'ic') {
    $paths = [
        'rocket'  => '<path d="M12 2.5c3.4 1.6 5.4 5 5.4 9l-2.1 5.2h-6.6L6.6 11.5c0-4 2-7.4 5.4-9z" fill="currentColor" opacity=".9"/><circle cx="12" cy="9.6" r="1.9" fill="#fff"/><path d="M8.7 16.7l-2.6 4 3.6-1.2M15.3 16.7l2.6 4-3.6-1.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
        'map'     => '<path d="M4 6.5l5-2 6 2 5-2v13l-5 2-6-2-5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 4.5v13M15 6.5v13" stroke="currentColor" stroke-width="2"/>',
        'trophy'  => '<path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor"/><path d="M7 5.5H4.5a3 3 0 0 0 3 3.5M17 5.5h2.5a3 3 0 0 1-3 3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 14v3M8.5 20h7l-1-3h-5z" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
        'users'   => '<circle cx="9" cy="8.6" r="3.4" fill="currentColor"/><path d="M3.4 19a5.6 5.6 0 0 1 11.2 0z" fill="currentColor"/><circle cx="16.8" cy="9.4" r="2.6" fill="currentColor" opacity=".55"/><path d="M15.5 14.6a4.8 4.8 0 0 1 5.1 4.4h-4.4" fill="currentColor" opacity=".55"/>',
        'code'    => '<path d="M8.5 7L4 12l4.5 5M15.5 7L20 12l-4.5 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.2 5.5l-2.4 13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
        'spark'   => '<path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z" fill="currentColor"/>',
        'planet'  => '<circle cx="12" cy="12" r="6" fill="currentColor"/><path d="M3.5 14.5c3-.4 7.5-1.6 11.5-3.6 3-1.5 5.3-3 6.5-4.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>',
        'shield'  => '<path d="M12 3l7 2.6v5.6c0 4.6-3 7.8-7 9.8-4-2-7-5.2-7-9.8V5.6z" fill="currentColor"/><path d="M9 12l2.2 2.2L15.4 10" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
        'play'    => '<circle cx="12" cy="12" r="9.4" fill="currentColor" opacity=".16"/><path d="M10 8.4l6 3.6-6 3.6z" fill="currentColor"/>',
        'blocks'  => '<rect x="4" y="4" width="7.2" height="7.2" rx="1.8" fill="currentColor"/><rect x="12.8" y="4" width="7.2" height="7.2" rx="1.8" fill="currentColor" opacity=".55"/><rect x="4" y="12.8" width="7.2" height="7.2" rx="1.8" fill="currentColor" opacity=".55"/><rect x="12.8" y="12.8" width="7.2" height="7.2" rx="1.8" fill="currentColor"/>',
    ];
    $inner = isset($paths[$name]) ? $paths[$name] : $paths['spark'];
    return '<svg class="' . e($cls) . '" viewBox="0 0 24 24" aria-hidden="true">' . $inner . '</svg>';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e(APP_NAME) ?> — Learn to code, one planet at a time</title>
<meta name="description" content="A free, gamified coding adventure for kids. Complete missions, light up your galaxy map, earn XP and rank up from Cadet to Commander.">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="landing">
<script>document.body.className += ' js';</script>

<div class="l-bg" aria-hidden="true">
    <span class="l-blob l-blob-1"></span>
    <span class="l-blob l-blob-2"></span>
    <span class="l-blob l-blob-3"></span>
</div>

<header class="l-nav" id="lnav">
    <a class="l-brand" href="index.php">
        <span class="l-brand-mark"><?= icon('star') ?></span>
        <span class="l-brand-name"><?= e(APP_NAME) ?></span>
    </a>
    <nav class="l-links">
        <a href="#how">How it works</a>
        <a href="#features">Features</a>
        <a href="#planets">Planets</a>
    </nav>
    <div class="l-nav-cta">
        <a class="btn-ghost" href="login.php">Log In</a>
        <a class="btn-blast btn-nav" href="login.php?mode=signup">Start Free</a>
    </div>
</header>

<!-- ============ HERO ============ -->
<main>
<section class="l-hero">
    <div class="l-hero-copy">
        <span class="l-chip"><?= licon('spark', 'ic ic-sm') ?> A galaxy of coding missions for kids</span>
        <h1>Learn to code,<br><span class="l-grad">one planet</span> at a time.</h1>
        <p class="l-sub">Every mission you finish lights up your galaxy map, earns XP and
           raises your astronaut rank — from your very first Scratch game all the way to
           real Python, HTML and JavaScript projects.</p>
        <div class="l-cta-row">
            <a class="btn-blast btn-big l-pulse" href="login.php?mode=signup"><?= licon('rocket', 'ic ic-btn') ?> Start the Adventure</a>
            <a class="btn-ghost btn-big" href="login.php">I already have a map</a>
        </div>
        <dl class="l-stats">
            <div class="l-stat"><dt data-count="<?= (int) $missionCount ?>">0</dt><dd>coding missions</dd></div>
            <div class="l-stat"><dt data-count="<?= (int) $planetCount ?>">0</dt><dd>planets to explore</dd></div>
            <div class="l-stat"><dt>100%</dt><dd>free for students</dd></div>
        </dl>
    </div>

    <!-- A living miniature of the real galaxy map, drawn in pure SVG/CSS -->
    <div class="l-hero-visual" aria-hidden="true">
        <div class="l-orbit l-orbit-a"></div>
        <div class="l-orbit l-orbit-b"></div>
        <div class="l-map-card glass">
            <div class="l-map-head">
                <span class="l-map-dot" style="--c:#ff5fa2"></span>
                <span class="l-map-dot" style="--c:#ffb020"></span>
                <span class="l-map-dot" style="--c:#22c55e"></span>
                <span class="l-map-title">Your galaxy map</span>
            </div>
            <div class="l-map-stage">
            <svg class="l-map" viewBox="0 0 340 300">
                <path class="l-road-base" d="M50 262 C 150 262, 210 232, 200 186 C 192 148, 96 148, 78 112 C 64 82, 140 52, 232 46"/>
                <path class="l-road-dash" d="M50 262 C 150 262, 210 232, 200 186 C 192 148, 96 148, 78 112 C 64 82, 140 52, 232 46"/>
            </svg>
            <span class="l-node l-done"  style="left:15%; top:87%">
                <svg class="ic" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span class="l-node l-done"  style="left:48%; top:84%">
                <svg class="ic" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span class="l-node l-now"   style="left:58%; top:61%">
                <svg class="ic" viewBox="0 0 24 24"><path d="M10 8.4l6 3.6-6 3.6z" fill="currentColor"/></svg>
                <i class="l-play-tag">Play!</i>
            </span>
            <span class="l-node l-lock"  style="left:24%; top:38%">
                <svg class="ic" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2.2" fill="currentColor"/><path d="M8.2 11V8a3.8 3.8 0 0 1 7.6 0v3" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>
            </span>
            <span class="l-node l-goal"  style="left:68%; top:16%">
                <svg class="ic" viewBox="0 0 24 24"><path d="M6 21V4M6 4h11l-2.2 3.5L17 11H6" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
            </span>
            </div>
            <div class="l-xp">
                <span class="l-xp-row"><b>Captain Maya</b><i>Level 4 &middot; 380 XP</i></span>
                <span class="l-xp-bar"><span class="l-xp-fill"></span></span>
            </div>
        </div>
        <span class="l-float l-float-1"><?= licon('blocks', 'ic') ?> Scratch</span>
        <span class="l-float l-float-2"><?= licon('code', 'ic') ?> Python</span>
        <span class="l-float l-float-3"><?= licon('trophy', 'ic') ?> +50 XP</span>
    </div>
</section>

<!-- ============ MARQUEE ============ -->
<section class="l-marquee" aria-hidden="true">
    <div class="l-marquee-track">
        <?php for ($rep = 0; $rep < 2; $rep++): ?>
            <?php foreach ($marquee as $m): ?>
                <span class="l-mq-item"><?= licon('spark', 'ic ic-sm') ?><?= e($m) ?></span>
            <?php endforeach; ?>
        <?php endfor; ?>
    </div>
</section>

<!-- ============ HOW IT WORKS ============ -->
<section class="l-section" id="how">
    <h2 class="l-h2 reveal">Blast off in <span class="l-grad">three steps</span></h2>
    <p class="l-lead reveal">No installs, no setup, no experience needed. Just a map, a mission and you.</p>
    <div class="l-steps">
        <article class="l-step glass reveal">
            <span class="l-step-num" style="--c:var(--blue)">1</span>
            <span class="l-step-ic" style="--c:var(--blue)"><?= licon('rocket') ?></span>
            <h3>Create your explorer</h3>
            <p>Pick a colour, tell us your age, and we place you on the right planet —
               under-8s launch in the Junior galaxy.</p>
        </article>
        <article class="l-step glass reveal">
            <span class="l-step-num" style="--c:var(--purple)">2</span>
            <span class="l-step-ic" style="--c:var(--purple)"><?= licon('map') ?></span>
            <h3>Follow the road</h3>
            <p>A winding road connects every mission. Open the next glowing node, read the
               briefing, and build something real.</p>
        </article>
        <article class="l-step glass reveal">
            <span class="l-step-num" style="--c:var(--pink)">3</span>
            <span class="l-step-ic" style="--c:var(--pink)"><?= licon('trophy') ?></span>
            <h3>Rank up</h3>
            <p>Finishing missions lights up your map, earns XP and raises your astronaut
               rank. Confetti included.</p>
        </article>
    </div>
</section>

<!-- ============ BENTO FEATURES ============ -->
<section class="l-section" id="features">
    <h2 class="l-h2 reveal">Built like a game.<br><span class="l-grad">Teaches like a mentor.</span></h2>
    <div class="l-bento">
        <article class="l-tile l-tile-wide glass reveal">
            <span class="l-tile-ic" style="--c:var(--blue)"><?= licon('map') ?></span>
            <h3>A living galaxy map</h3>
            <p>Your progress is a place, not a percentage. Completed missions shine green,
               the next one bounces and calls you, and locked worlds wait down the road.</p>
            <div class="l-minimap" aria-hidden="true">
                <span class="l-mini-node" style="--c:var(--green)"></span><i></i>
                <span class="l-mini-node" style="--c:var(--green)"></span><i></i>
                <span class="l-mini-node l-mini-now" style="--c:var(--gold)"></span><i></i>
                <span class="l-mini-node" style="--c:#dfe5f6"></span><i></i>
                <span class="l-mini-node" style="--c:#dfe5f6"></span>
            </div>
        </article>
        <article class="l-tile glass reveal">
            <span class="l-tile-ic" style="--c:var(--gold)"><?= licon('trophy') ?></span>
            <h3>XP &amp; astronaut ranks</h3>
            <p>Every mission pays XP. Climb from Cadet to Commander and watch your bar fill.</p>
        </article>
        <article class="l-tile glass reveal">
            <span class="l-tile-ic" style="--c:var(--mint)"><?= licon('shield') ?></span>
            <h3>Junior galaxy for under-8s</h3>
            <p>Little explorers get their own gentler track — and move up automatically on
               their 8th birthday.</p>
        </article>
        <article class="l-tile glass reveal">
            <span class="l-tile-ic" style="--c:var(--purple)"><?= licon('users') ?></span>
            <h3>Mission Control for teachers</h3>
            <p>Teachers see every student's road at a glance and can edit the whole
               curriculum — no code needed.</p>
        </article>
        <article class="l-tile glass reveal">
            <span class="l-tile-ic" style="--c:var(--pink)"><?= licon('code') ?></span>
            <h3>Real tools, real skills</h3>
            <p>Missions use the same tools real programmers learn with — from Scratch blocks
               to Python, HTML &amp; CSS and JavaScript.</p>
            <div class="tag-row">
                <span class="tag">Scratch</span><span class="tag">Python</span>
                <span class="tag">HTML &amp; CSS</span><span class="tag">JavaScript</span>
                <span class="tag">Git basics</span>
            </div>
        </article>
    </div>
</section>

<!-- ============ PLANETS (live curriculum) ============ -->
<section class="l-section" id="planets">
    <h2 class="l-h2 reveal">The <span class="l-grad">planets</span> you will visit</h2>
    <p class="l-lead reveal">The real curriculum, straight from the galaxy — five worlds for
       explorers 8 and up, plus a Junior galaxy for the youngest cadets.</p>
    <div class="l-planets">
        <?php foreach ($mainStages as $i => $s): ?>
        <article class="l-planet glass reveal" style="--c:<?= e($s['color']) ?>">
            <span class="l-planet-ball"><i></i></span>
            <div class="l-planet-body">
                <span class="l-planet-stage">Stage <?= $i + 1 ?> &middot; <?= count($s['levels']) ?> missions</span>
                <h3><?= e($s['planet']) ?></h3>
                <p><?= e($s['blurb']) ?></p>
            </div>
        </article>
        <?php endforeach; ?>
        <?php foreach ($juniorStages as $s): ?>
        <article class="l-planet l-planet-jr glass reveal" style="--c:<?= e($s['color']) ?>">
            <span class="l-planet-ball"><i></i></span>
            <div class="l-planet-body">
                <span class="l-planet-stage">Junior galaxy &middot; <?= count($s['levels']) ?> missions</span>
                <h3><?= e($s['planet']) ?></h3>
                <p><?= e($s['blurb']) ?></p>
            </div>
        </article>
        <?php endforeach; ?>
    </div>
</section>

<!-- ============ FINAL CTA ============ -->
<section class="l-section">
    <div class="l-banner reveal">
        <span class="l-banner-star l-bs-1"><?= licon('spark', 'ic') ?></span>
        <span class="l-banner-star l-bs-2"><?= licon('spark', 'ic') ?></span>
        <span class="l-banner-star l-bs-3"><?= licon('spark', 'ic') ?></span>
        <h2>Ready for liftoff?</h2>
        <p>Your galaxy map is waiting. The first mission takes about ten minutes.</p>
        <a class="btn-white btn-big" href="login.php?mode=signup"><?= licon('rocket', 'ic ic-btn') ?> Create my free map</a>
    </div>
</section>
</main>

<?= site_footer() ?>
<script src="assets/js/landing.js"></script>
</body>
</html>
