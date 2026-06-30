<?php
require __DIR__ . '/config.php';
require __DIR__ . '/roadmap.php';

$user      = require_login();
$isTeacher = !empty($user['is_teacher']);

/** Build a project array from the posted form fields. */
function project_from_post(string $key): array {
    return [
        'key'       => $key,
        'title'     => trim($_POST['title'] ?? ''),
        'level'     => trim($_POST['level'] ?? ''),
        'blurb'     => trim($_POST['blurb'] ?? ''),
        'tools'     => lines_to_array($_POST['tools'] ?? ''),
        'steps'     => lines_to_array($_POST['steps'] ?? ''),
        'resources' => parse_resources($_POST['resources'] ?? ''),
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$isTeacher) { http_response_code(403); exit('Teachers only'); }
    if (!check_csrf()) { http_response_code(400); exit('Bad request'); }
    $action   = $_POST['action'] ?? '';
    $projects = projects_get();
    $pk       = $_POST['pk'] ?? '';

    if ($action === 'reset') {
        setting_delete('projects');

    } elseif ($action === 'add_project') {
        $projects[] = project_from_post(new_content_key('proj'));
        projects_save($projects);

    } elseif ($action === 'save_project') {
        foreach ($projects as $i => $p) {
            if (($p['key'] ?? '') === $pk) { $projects[$i] = project_from_post($pk); break; }
        }
        projects_save($projects);

    } elseif ($action === 'delete_project') {
        $projects = array_values(array_filter($projects, function ($p) use ($pk) { return ($p['key'] ?? '') !== $pk; }));
        projects_save($projects);

    } elseif ($action === 'move_project') {
        foreach ($projects as $i => $p) {
            if (($p['key'] ?? '') === $pk) {
                $ni = $i + ((($_POST['dir'] ?? '') === 'up') ? -1 : 1);
                if ($ni >= 0 && $ni < count($projects)) { $t = $projects[$i]; $projects[$i] = $projects[$ni]; $projects[$ni] = $t; }
                break;
            }
        }
        projects_save($projects);
    }

    header('Location: projects.php?saved=1');
    exit;
}

$projects = projects_get();
$saved    = isset($_GET['saved']);
$home     = $isTeacher ? 'teacher.php' : 'dashboard.php';

/** Render the editable fields shared by every project form. */
function project_fields(array $p = []): void {
    ?>
    <div class="f-grid">
        <label class="f">Title
            <input type="text" name="title" value="<?= e($p['title'] ?? '') ?>" placeholder="Prime Number Finder">
        </label>
        <label class="f">Level / age
            <input type="text" name="level" value="<?= e($p['level'] ?? '') ?>" placeholder="Intermediate · 10+">
        </label>
    </div>
    <label class="f">Short description
        <input type="text" name="blurb" value="<?= e($p['blurb'] ?? '') ?>" placeholder="What the project is about, in one sentence.">
    </label>
    <label class="f">Tools / languages — one per line
        <textarea name="tools" rows="2" placeholder="Python&#10;JavaScript"><?= e(array_to_lines($p['tools'] ?? [])) ?></textarea>
    </label>
    <label class="f">What to do — one step per line
        <textarea name="steps" rows="6" placeholder="Ask the user for a number.&#10;Check if it is prime."><?= e(array_to_lines($p['steps'] ?? [])) ?></textarea>
    </label>
    <label class="f">Resources — one per line, as <code>Name | https://link</code>
        <textarea name="resources" rows="3" placeholder="How to play Shikaku | https://en.wikipedia.org/wiki/Shikaku"><?= e(resources_to_lines($p['resources'] ?? [])) ?></textarea>
    </label>
    <?php
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e(APP_NAME) ?> — Suggested Projects</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="app-page projects-page">
<canvas id="stars"></canvas>

<header class="topbar glass">
    <div class="topbar-left">
        <?= avatar_markup($user, 'me-avatar') ?>
        <div>
            <div class="me-name"><?= e($user['display_name']) ?></div>
            <div class="me-rank">Suggested Projects</div>
        </div>
    </div>
    <div class="topbar-right">
        <a class="btn-ghost" href="<?= e($home) ?>"><?= $isTeacher ? 'Mission Control' : 'My Map' ?></a>
        <?php if ($isTeacher): ?><a class="btn-ghost" href="curriculum.php">Curriculum</a><?php endif; ?>
        <a class="btn-ghost" href="logout.php">Log out</a>
    </div>
</header>

<main class="projects-main">
    <div class="journey-intro">
        <h1>Suggested Projects</h1>
        <p>Finished the missions? Build something of your own. Pick a project, follow the steps, and make it yours.</p>
    </div>

    <?php if ($saved): ?><div class="flash glass">Saved.</div><?php endif; ?>

    <?php if ($isTeacher): ?>
    <div class="editor-bar glass">
        <span>You can edit, add and remove these projects. Students see them too.</span>
        <form method="post" onsubmit="return confirm('Reset projects back to the built-in list? Your changes will be lost.');">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="reset">
            <button class="btn-ghost danger" type="submit">Reset to default</button>
        </form>
    </div>
    <?php endif; ?>

    <?php if (!$projects): ?>
        <div class="empty glass">No projects yet.</div>
    <?php endif; ?>

    <div class="proj-grid">
        <?php foreach ($projects as $pi => $p): ?>
        <article class="proj-card glass">
            <div class="proj-head">
                <h2><?= e($p['title'] ?? 'Project') ?></h2>
                <?php if (!empty($p['level'])): ?><span class="proj-level"><?= e($p['level']) ?></span><?php endif; ?>
            </div>
            <?php if (!empty($p['blurb'])): ?><p class="proj-blurb"><?= e($p['blurb']) ?></p><?php endif; ?>

            <?php if (!empty($p['tools'])): ?>
            <div class="proj-tags">
                <?php foreach ($p['tools'] as $t): ?><span class="tag"><?= e($t) ?></span><?php endforeach; ?>
            </div>
            <?php endif; ?>

            <?php if (!empty($p['steps'])): ?>
            <h3>What to do</h3>
            <ol class="proj-steps">
                <?php foreach ($p['steps'] as $s): ?><li><?= e($s) ?></li><?php endforeach; ?>
            </ol>
            <?php endif; ?>

            <?php if (!empty($p['resources'])): ?>
            <h3>Where to learn</h3>
            <ul class="proj-res">
                <?php foreach ($p['resources'] as $r):
                    $name = $r['name'] ?? '';
                    $url  = $r['url'] ?? '';
                ?>
                    <li><?php if ($url !== ''): ?><a href="<?= e($url) ?>" target="_blank" rel="noopener noreferrer"><?= e($name) ?></a><?php else: ?><?= e($name) ?><?php endif; ?></li>
                <?php endforeach; ?>
            </ul>
            <?php endif; ?>

            <?php if ($isTeacher): ?>
            <details class="ed-level proj-edit">
                <summary>Edit this project</summary>
                <form method="post" class="ed-form">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="save_project">
                    <input type="hidden" name="pk" value="<?= e($p['key'] ?? '') ?>">
                    <?php project_fields($p); ?>
                    <div class="ed-actions">
                        <button class="btn-blast" type="submit">Save project</button>
                    </div>
                </form>
                <div class="ed-level-foot">
                    <form method="post" class="inline">
                        <?= csrf_field() ?>
                        <input type="hidden" name="action" value="move_project">
                        <input type="hidden" name="pk" value="<?= e($p['key'] ?? '') ?>">
                        <button class="btn-ghost sm" name="dir" value="up" type="submit" <?= $pi === 0 ? 'disabled' : '' ?>>Move up</button>
                    </form>
                    <form method="post" class="inline">
                        <?= csrf_field() ?>
                        <input type="hidden" name="action" value="move_project">
                        <input type="hidden" name="pk" value="<?= e($p['key'] ?? '') ?>">
                        <button class="btn-ghost sm" name="dir" value="down" type="submit" <?= $pi === count($projects) - 1 ? 'disabled' : '' ?>>Move down</button>
                    </form>
                    <form method="post" class="inline" onsubmit="return confirm('Delete this project?');">
                        <?= csrf_field() ?>
                        <input type="hidden" name="action" value="delete_project">
                        <input type="hidden" name="pk" value="<?= e($p['key'] ?? '') ?>">
                        <button class="btn-ghost danger sm" type="submit">Delete</button>
                    </form>
                </div>
            </details>
            <?php endif; ?>
        </article>
        <?php endforeach; ?>
    </div>

    <?php if ($isTeacher): ?>
    <section class="ed-stage glass ed-add-stage">
        <details class="ed-edit">
            <summary>+ Add a new project</summary>
            <form method="post" class="ed-form">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="add_project">
                <?php project_fields(); ?>
                <div class="ed-actions">
                    <button class="btn-blast" type="submit">Add project</button>
                </div>
            </form>
        </details>
    </section>
    <?php endif; ?>
</main>

<?= site_footer() ?>
<script src="assets/js/stars.js"></script>
</body>
</html>
