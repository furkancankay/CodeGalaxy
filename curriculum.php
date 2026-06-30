<?php
require __DIR__ . '/config.php';
require __DIR__ . '/roadmap.php';

$teacher = require_teacher();

// Which age group are we editing? main = 8+, junior = under 8.
$track = (($_GET['track'] ?? 'main') === 'junior') ? 'junior' : 'main';

/** Build a level array from the posted form fields. */
function level_from_post(string $key): array {
    return [
        'key'       => $key,
        'title'     => trim($_POST['title'] ?? ''),
        'topic'     => trim($_POST['topic'] ?? ''),
        'tool'      => trim($_POST['tool'] ?? ''),
        'mission'   => trim($_POST['mission'] ?? ''),
        'learn'     => lines_to_array($_POST['learn'] ?? ''),
        'steps'     => lines_to_array($_POST['steps'] ?? ''),
        'platforms' => lines_to_array($_POST['platforms'] ?? ''),
        'resources' => parse_resources($_POST['resources'] ?? ''),
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!check_csrf()) { http_response_code(400); exit('Bad request'); }
    $action = $_POST['action'] ?? '';
    $stages = roadmap_for($track);
    $si = isset($_POST['si']) ? (int) $_POST['si'] : -1;
    $lk = $_POST['lk'] ?? '';

    if ($action === 'reset_track') {
        curriculum_reset($track);

    } elseif ($action === 'add_stage') {
        $stages[] = [
            'key'    => new_content_key('stage'),
            'planet' => '',
            'color'  => trim($_POST['color'] ?? '') ?: '#4c6fff',
            'name'   => trim($_POST['name'] ?? '') ?: 'New stage',
            'blurb'  => trim($_POST['blurb'] ?? ''),
            'levels' => [],
        ];
        curriculum_save($track, $stages);

    } elseif ($action === 'save_stage' && isset($stages[$si])) {
        $stages[$si]['name']  = trim($_POST['name'] ?? '');
        $stages[$si]['blurb'] = trim($_POST['blurb'] ?? '');
        $stages[$si]['color'] = trim($_POST['color'] ?? '') ?: '#4c6fff';
        curriculum_save($track, $stages);

    } elseif ($action === 'delete_stage' && isset($stages[$si])) {
        array_splice($stages, $si, 1);
        curriculum_save($track, $stages);

    } elseif ($action === 'move_stage' && isset($stages[$si])) {
        $ni = $si + ((($_POST['dir'] ?? '') === 'up') ? -1 : 1);
        if ($ni >= 0 && $ni < count($stages)) {
            $t = $stages[$si]; $stages[$si] = $stages[$ni]; $stages[$ni] = $t;
            curriculum_save($track, $stages);
        }

    } elseif ($action === 'add_level' && isset($stages[$si])) {
        $stages[$si]['levels'][] = level_from_post(new_content_key('lvl'));
        curriculum_save($track, $stages);

    } elseif ($action === 'save_level' && isset($stages[$si])) {
        foreach ($stages[$si]['levels'] as $i => $lvl) {
            if (($lvl['key'] ?? '') === $lk) { $stages[$si]['levels'][$i] = level_from_post($lk); break; }
        }
        curriculum_save($track, $stages);

    } elseif ($action === 'delete_level' && isset($stages[$si])) {
        $stages[$si]['levels'] = array_values(array_filter(
            $stages[$si]['levels'],
            function ($l) use ($lk) { return ($l['key'] ?? '') !== $lk; }
        ));
        curriculum_save($track, $stages);

    } elseif ($action === 'move_level' && isset($stages[$si])) {
        $levels = $stages[$si]['levels'];
        foreach ($levels as $i => $l) {
            if (($l['key'] ?? '') === $lk) {
                $ni = $i + ((($_POST['dir'] ?? '') === 'up') ? -1 : 1);
                if ($ni >= 0 && $ni < count($levels)) { $t = $levels[$i]; $levels[$i] = $levels[$ni]; $levels[$ni] = $t; }
                break;
            }
        }
        $stages[$si]['levels'] = $levels;
        curriculum_save($track, $stages);
    }

    header('Location: curriculum.php?track=' . urlencode($track) . '&saved=1');
    exit;
}

$stages   = roadmap_for($track);
$isCustom = curriculum_is_custom($track);
$saved    = isset($_GET['saved']);
$levelCount = 0;
foreach ($stages as $st) $levelCount += count($st['levels']);

/** Render the editable fields shared by every level form. */
function level_fields(array $lvl = []): void {
    ?>
    <div class="f-grid">
        <label class="f">Title
            <input type="text" name="title" value="<?= e($lvl['title'] ?? '') ?>" placeholder="Make It Move">
        </label>
        <label class="f">Main tool
            <input type="text" name="tool" value="<?= e($lvl['tool'] ?? '') ?>" placeholder="Scratch / Python">
        </label>
    </div>
    <label class="f">Topic (short subtitle)
        <input type="text" name="topic" value="<?= e($lvl['topic'] ?? '') ?>" placeholder="Coordinates & motion — x and y">
    </label>
    <label class="f">Mission (one friendly sentence)
        <input type="text" name="mission" value="<?= e($lvl['mission'] ?? '') ?>" placeholder="Make your sprite glide across the screen.">
    </label>
    <label class="f">What you'll learn — one per line
        <textarea name="learn" rows="3" placeholder="Move a sprite on the screen&#10;Use x and y"><?= e(array_to_lines($lvl['learn'] ?? [])) ?></textarea>
    </label>
    <label class="f">Step-by-step — one step per line
        <textarea name="steps" rows="5" placeholder="Open Scratch and start a new project.&#10;Drag a move block..."><?= e(array_to_lines($lvl['steps'] ?? [])) ?></textarea>
    </label>
    <label class="f">Suggested languages / platforms — one per line
        <textarea name="platforms" rows="2" placeholder="Scratch&#10;Python"><?= e(array_to_lines($lvl['platforms'] ?? [])) ?></textarea>
    </label>
    <label class="f">Learning resources — one per line, as <code>Name | https://link</code>
        <textarea name="resources" rows="3" placeholder="Scratch — tutorials | https://scratch.mit.edu/ideas"><?= e(resources_to_lines($lvl['resources'] ?? [])) ?></textarea>
    </label>
    <?php
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e(APP_NAME) ?> — Edit Curriculum</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="app-page editor-page">
<canvas id="stars"></canvas>

<header class="topbar glass">
    <div class="topbar-left">
        <?= avatar_markup($teacher, 'me-avatar') ?>
        <div>
            <div class="me-name"><?= e($teacher['display_name']) ?></div>
            <div class="me-rank">Curriculum Editor</div>
        </div>
    </div>
    <div class="topbar-right">
        <a class="btn-ghost" href="teacher.php">Mission Control</a>
        <a class="btn-ghost" href="projects.php">Projects</a>
        <a class="btn-ghost" href="logout.php">Log out</a>
    </div>
</header>

<main class="editor-main">
    <h1>Edit the Curriculum</h1>
    <p class="editor-lead">Add, change or remove missions for each age group. Every change updates the galaxy map your students see. Existing missions keep their progress when you edit them.</p>

    <?php if ($saved): ?><div class="flash glass">Saved.</div><?php endif; ?>

    <div class="track-tabs">
        <a class="track-tab <?= $track === 'main' ? 'on' : '' ?>" href="curriculum.php?track=main">Big Missions (8+)</a>
        <a class="track-tab <?= $track === 'junior' ? 'on' : '' ?>" href="curriculum.php?track=junior">Junior Galaxy (under 8)</a>
    </div>

    <div class="editor-bar glass">
        <span><strong><?= count($stages) ?></strong> stages · <strong><?= $levelCount ?></strong> missions
            <?php if ($isCustom): ?><span class="pill">Customised</span><?php else: ?><span class="pill ghost">Built-in default</span><?php endif; ?>
        </span>
        <form method="post" onsubmit="return confirm('Reset this age group back to the built-in missions? Your custom changes here will be lost.');">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="reset_track">
            <button class="btn-ghost danger" type="submit">Reset to default</button>
        </form>
    </div>

    <?php foreach ($stages as $si => $stage):
        $sc = $stage['color'] ?? '#4c6fff';
    ?>
    <section class="ed-stage glass" style="--sc:<?= e($sc) ?>">
        <div class="ed-stage-head">
            <span class="ed-stage-num"><?= $si + 1 ?></span>
            <h2><?= e($stage['name'] ?? 'Stage') ?></h2>
            <span class="ed-count"><?= count($stage['levels']) ?> missions</span>
            <span class="ed-stage-tools">
                <form method="post" class="inline">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="move_stage">
                    <input type="hidden" name="si" value="<?= $si ?>">
                    <button class="icon-btn" name="dir" value="up" type="submit" title="Move stage up" <?= $si === 0 ? 'disabled' : '' ?>>&uarr;</button>
                </form>
                <form method="post" class="inline">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="move_stage">
                    <input type="hidden" name="si" value="<?= $si ?>">
                    <button class="icon-btn" name="dir" value="down" type="submit" title="Move stage down" <?= $si === count($stages) - 1 ? 'disabled' : '' ?>>&darr;</button>
                </form>
            </span>
        </div>

        <details class="ed-edit">
            <summary>Stage settings</summary>
            <form method="post" class="ed-form">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="save_stage">
                <input type="hidden" name="si" value="<?= $si ?>">
                <label class="f">Stage name
                    <input type="text" name="name" value="<?= e($stage['name'] ?? '') ?>">
                </label>
                <label class="f">Blurb (one short line)
                    <input type="text" name="blurb" value="<?= e($stage['blurb'] ?? '') ?>">
                </label>
                <label class="f f-color">Colour
                    <input type="color" name="color" value="<?= e($sc) ?>">
                </label>
                <div class="ed-actions">
                    <button class="btn-blast" type="submit">Save stage</button>
                </div>
            </form>
            <form method="post" class="ed-danger" onsubmit="return confirm('Delete this whole stage and all its missions?');">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="delete_stage">
                <input type="hidden" name="si" value="<?= $si ?>">
                <button class="btn-ghost danger" type="submit">Delete this stage</button>
            </form>
        </details>

        <?php foreach ($stage['levels'] as $li => $lvl): ?>
        <details class="ed-level">
            <summary>
                <span class="ed-level-n"><?= $li + 1 ?></span>
                <span class="ed-level-t"><?= e($lvl['title'] ?? 'Untitled') ?></span>
                <span class="ed-level-tool"><?= e($lvl['tool'] ?? '') ?></span>
            </summary>
            <form method="post" class="ed-form">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="save_level">
                <input type="hidden" name="si" value="<?= $si ?>">
                <input type="hidden" name="lk" value="<?= e($lvl['key'] ?? '') ?>">
                <?php level_fields($lvl); ?>
                <div class="ed-actions">
                    <button class="btn-blast" type="submit">Save mission</button>
                </div>
            </form>
            <div class="ed-level-foot">
                <form method="post" class="inline">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="move_level">
                    <input type="hidden" name="si" value="<?= $si ?>">
                    <input type="hidden" name="lk" value="<?= e($lvl['key'] ?? '') ?>">
                    <button class="btn-ghost sm" name="dir" value="up" type="submit" <?= $li === 0 ? 'disabled' : '' ?>>Move up</button>
                </form>
                <form method="post" class="inline">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="move_level">
                    <input type="hidden" name="si" value="<?= $si ?>">
                    <input type="hidden" name="lk" value="<?= e($lvl['key'] ?? '') ?>">
                    <button class="btn-ghost sm" name="dir" value="down" type="submit" <?= $li === count($stage['levels']) - 1 ? 'disabled' : '' ?>>Move down</button>
                </form>
                <form method="post" class="inline" onsubmit="return confirm('Delete this mission?');">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="delete_level">
                    <input type="hidden" name="si" value="<?= $si ?>">
                    <input type="hidden" name="lk" value="<?= e($lvl['key'] ?? '') ?>">
                    <button class="btn-ghost danger sm" type="submit">Delete mission</button>
                </form>
            </div>
        </details>
        <?php endforeach; ?>

        <details class="ed-level ed-add">
            <summary><span class="ed-level-n">+</span><span class="ed-level-t">Add a mission to this stage</span></summary>
            <form method="post" class="ed-form">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="add_level">
                <input type="hidden" name="si" value="<?= $si ?>">
                <?php level_fields(); ?>
                <div class="ed-actions">
                    <button class="btn-blast" type="submit">Add mission</button>
                </div>
            </form>
        </details>
    </section>
    <?php endforeach; ?>

    <section class="ed-stage glass ed-add-stage">
        <details class="ed-edit">
            <summary>+ Add a new stage</summary>
            <form method="post" class="ed-form">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="add_stage">
                <label class="f">Stage name
                    <input type="text" name="name" placeholder="Stage 6 — Build a Website">
                </label>
                <label class="f">Blurb (one short line)
                    <input type="text" name="blurb" placeholder="Make your own page on the internet.">
                </label>
                <label class="f f-color">Colour
                    <input type="color" name="color" value="#4c6fff">
                </label>
                <div class="ed-actions">
                    <button class="btn-blast" type="submit">Add stage</button>
                </div>
            </form>
        </details>
    </section>
</main>

<?= site_footer() ?>
<script src="assets/js/stars.js"></script>
</body>
</html>
