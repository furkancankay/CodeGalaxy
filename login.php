<?php
require __DIR__ . '/config.php';
require __DIR__ . '/roadmap.php';

// Already logged in? Go straight to the journey.
if (current_user_row()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
$mode  = ($_GET['mode'] ?? 'login') === 'signup' ? 'signup' : 'login';
$avatars = array_keys(avatar_palette()); // colour tokens (no emoji)

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $mode = $_POST['mode'] ?? 'login';
    if (!check_csrf()) {
        $error = 'Your session expired. Please try again.';
    } elseif ($mode === 'signup') {
        $username = trim($_POST['username'] ?? '');
        $display  = trim($_POST['display_name'] ?? '');
        $pass     = $_POST['password'] ?? '';
        $avatar   = in_array($_POST['avatar'] ?? '', $avatars, true) ? $_POST['avatar'] : 'blue';
        $teacher  = trim($_POST['teacher_code'] ?? '');
        $birthday = trim($_POST['birthdate'] ?? '');
        $isTeacher = ($teacher !== '' && hash_equals(TEACHER_SIGNUP_CODE, $teacher)) ? 1 : 0;

        // Validate the birth date for students (teachers do not need one).
        $bdStore = null; $bdOk = false;
        if ($birthday !== '') {
            $dt = DateTime::createFromFormat('Y-m-d', $birthday);
            if ($dt && $dt->format('Y-m-d') === $birthday) {
                $age = age_from_birthdate($birthday);
                if ($age !== null && $age >= 3 && $age <= 100) { $bdOk = true; $bdStore = $birthday; }
            }
        }

        if (strlen($username) < 3 || !preg_match('/^[A-Za-z0-9_]+$/', $username)) {
            $error = 'Username must be 3+ letters/numbers (no spaces).';
        } elseif ($display === '') {
            $error = 'Please enter a display name.';
        } elseif (strlen($pass) < 4) {
            $error = 'Password must be at least 4 characters.';
        } elseif (!$isTeacher && !$bdOk) {
            $error = 'Please enter your birth date (so we start you on the right missions).';
        } else {
            $exists = db()->prepare('SELECT id FROM users WHERE username = ?');
            $exists->execute([$username]);
            if ($exists->fetch()) {
                $error = 'That username is taken — try another!';
            } else {
                $ins = db()->prepare('INSERT INTO users (username, password_hash, display_name, avatar, birthdate, is_teacher, created_at) VALUES (?,?,?,?,?,?,?)');
                $ins->execute([$username, password_hash($pass, PASSWORD_DEFAULT), $display, $avatar, $bdStore, $isTeacher, gmdate('c')]);
                session_regenerate_id(true);
                $_SESSION['uid'] = (int) db()->lastInsertId();
                header('Location: ' . ($isTeacher ? 'teacher.php' : 'dashboard.php'));
                exit;
            }
        }
    } else { // login
        $username = trim($_POST['username'] ?? '');
        $pass     = $_POST['password'] ?? '';
        $stmt = db()->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $u = $stmt->fetch();
        if ($u && password_verify($pass, $u['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['uid'] = (int) $u['id'];
            header('Location: ' . (!empty($u['is_teacher']) ? 'teacher.php' : 'dashboard.php'));
            exit;
        }
        $error = 'Wrong username or password. Try again, astronaut!';
    }
}

$palette = avatar_palette();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= $mode === 'signup' ? 'Sign Up' : 'Log In' ?> — <?= e(APP_NAME) ?></title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="auth-page">
<canvas id="stars"></canvas>

<div class="auth-wrap">
    <a class="logo logo-link" href="index.php" title="Back to home">
        <div class="logo-rocket"><?= icon('star') ?></div>
        <h1><?= e(APP_NAME) ?></h1>
    </a>
    <p class="tagline">Blast off on your journey from zero to coder!</p>

    <div class="card glass">
        <div class="tabs">
            <a href="?mode=login"  class="tab <?= $mode==='login'?'active':'' ?>">Log In</a>
            <a href="?mode=signup" class="tab <?= $mode==='signup'?'active':'' ?>">Sign Up</a>
        </div>

        <?php if ($error): ?>
            <div class="alert"><?= e($error) ?></div>
        <?php endif; ?>

        <?php if ($mode === 'signup'): ?>
        <form method="post" class="form" autocomplete="off">
            <?= csrf_field() ?>
            <input type="hidden" name="mode" value="signup">

            <label>Pick your colour</label>
            <div class="avatar-grid">
                <?php foreach ($avatars as $i => $tok): $c = $palette[$tok]; ?>
                    <input type="radio" name="avatar" id="av<?= $i ?>" value="<?= e($tok) ?>" <?= $i===0?'checked':'' ?>>
                    <label for="av<?= $i ?>" class="avatar-opt" style="background:linear-gradient(135deg,<?= e($c[0]) ?>,<?= e($c[1]) ?>)" title="<?= e(ucfirst($tok)) ?>"></label>
                <?php endforeach; ?>
            </div>

            <label for="display_name">Your name</label>
            <input type="text" id="display_name" name="display_name" placeholder="e.g. Captain Leo" maxlength="80" required>

            <label for="birthdate">Your birthday</label>
            <input type="date" id="birthdate" name="birthdate" min="1925-01-01" max="2025-12-31">
            <div class="field-hint">Under 8 explorers start in the Junior galaxy. You move up automatically when you turn 8!</div>

            <label for="username">Username</label>
            <input type="text" id="username" name="username" placeholder="letters &amp; numbers" maxlength="50" required>

            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="at least 4 characters" required>

            <details class="teacher-toggle">
                <summary>I'm a teacher</summary>
                <label for="teacher_code">Teacher code</label>
                <input type="text" id="teacher_code" name="teacher_code" placeholder="Enter your secret teacher code">
            </details>

            <button type="submit" class="btn-blast">Start the Adventure</button>
        </form>
        <?php else: ?>
        <form method="post" class="form">
            <?= csrf_field() ?>
            <input type="hidden" name="mode" value="login">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" maxlength="50" required autofocus>
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
            <button type="submit" class="btn-blast">Continue Mission</button>
        </form>
        <?php endif; ?>
    </div>
    <p class="foot-note"><a class="foot-link" href="index.php">Back to home</a> &middot; Made for young space explorers</p>
</div>

<?= site_footer() ?>
<script src="assets/js/stars.js"></script>
</body>
</html>
