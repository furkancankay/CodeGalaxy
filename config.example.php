<?php
/**
 * Code Galaxy — central configuration & helpers
 * -------------------------------------------------
 * EDIT THE DATABASE SETTINGS BELOW before deploying to your server.
 * On most cPanel hosts you create a MySQL database + user, then paste
 * the names/password here. Tables are created automatically on first run.
 */

// Load a local override file if present (used for local testing with SQLite).
// You can ignore this on the live server.
if (file_exists(__DIR__ . '/config.local.php')) {
    require __DIR__ . '/config.local.php';
}

/* ============================================================
 *  DATABASE SETTINGS  — EDIT THESE FOR YOUR SERVER
 * ============================================================ */
defined('DB_DRIVER') || define('DB_DRIVER', 'mysql');   // 'mysql' on your server
defined('DB_HOST')   || define('DB_HOST',   'localhost'); // usually 'localhost' on cPanel
defined('DB_NAME')   || define('DB_NAME',   'yourcpanel_codegalaxy'); // your database name
defined('DB_USER')   || define('DB_USER',   'yourcpanel_cguser');    // your database user
defined('DB_PASS')   || define('DB_PASS',   'CHANGE-ME-database-password');   // your database password
defined('DB_PATH')   || define('DB_PATH',   __DIR__ . '/data/codegalaxy.sqlite'); // only for sqlite/local

/* ============================================================
 *  APP SETTINGS
 * ============================================================ */
// Anyone who signs up using this exact code becomes a TEACHER (admin).
// Change it to something only you know, then share it with no students.
defined('TEACHER_SIGNUP_CODE') || define('TEACHER_SIGNUP_CODE', 'CHANGE-ME-teacher-code');

defined('APP_NAME') || define('APP_NAME', 'Code Galaxy');

/* ============================================================
 *  Below this line you normally do not need to change anything.
 * ============================================================ */

session_start();
date_default_timezone_set('UTC');

/** Get a shared PDO connection (and make sure tables exist). */
function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        if (DB_DRIVER === 'sqlite') {
            $dir = dirname(DB_PATH);
            if (!is_dir($dir)) @mkdir($dir, 0775, true);
            $pdo = new PDO('sqlite:' . DB_PATH);
            $pdo->exec('PRAGMA foreign_keys = ON');
        } else {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS);
        }
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        http_response_code(500);
        die('<h1 style="font-family:sans-serif">Database connection failed</h1>'
          . '<p style="font-family:sans-serif">Open <code>config.php</code> and check your database settings.</p>');
    }

    ensure_schema($pdo);
    return $pdo;
}

/** Create tables if they do not exist (works for MySQL and SQLite). */
function ensure_schema(PDO $pdo): void {
    if (DB_DRIVER === 'sqlite') {
        $idCol = 'INTEGER PRIMARY KEY AUTOINCREMENT';
        $opts  = '';
    } else {
        $idCol = 'INT AUTO_INCREMENT PRIMARY KEY';
        // utf8mb4 so emoji avatars / names store correctly across MySQL & MariaDB.
        $opts  = ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';
    }

    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id            $idCol,
        username      VARCHAR(50)  NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        display_name  VARCHAR(80)  NOT NULL,
        avatar        VARCHAR(20)  NOT NULL DEFAULT '',
        birthdate     VARCHAR(10)  NULL,
        is_teacher    INTEGER      NOT NULL DEFAULT 0,
        created_at    VARCHAR(25)  NOT NULL
    )$opts");

    // Migration: add birthdate to an older users table if it is missing.
    try { $pdo->exec("ALTER TABLE users ADD COLUMN birthdate VARCHAR(10) NULL"); }
    catch (Throwable $e) { /* column already exists — ignore */ }

    $pdo->exec("CREATE TABLE IF NOT EXISTS progress (
        id           $idCol,
        user_id      INTEGER     NOT NULL,
        level_key    VARCHAR(40) NOT NULL,
        completed_at VARCHAR(25) NOT NULL,
        UNIQUE (user_id, level_key)
    )$opts");

    // Editable content (curriculum per track, suggested projects) lives here as JSON.
    $textType = (DB_DRIVER === 'sqlite') ? 'TEXT' : 'MEDIUMTEXT';
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        name  VARCHAR(40) NOT NULL PRIMARY KEY,
        value $textType   NULL
    )$opts");
}

/* ---------- small helpers ---------- */

/** Escape output for safe HTML. */
function e(?string $s): string {
    return htmlspecialchars($s ?? '', ENT_QUOTES, 'UTF-8');
}

/** Inline SVG icons (no emoji anywhere in the UI). */
function icon(string $name): string {
    $inner = '';
    switch ($name) {
        case 'check':
            $inner = '<path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
            break;
        case 'lock':
            $inner = '<rect x="5" y="11" width="14" height="9" rx="2.2" fill="currentColor"/><path d="M8.2 11V8a3.8 3.8 0 0 1 7.6 0v3" fill="none" stroke="currentColor" stroke-width="2.2"/>';
            break;
        case 'star':
            $inner = '<path d="M12 3.2l2.55 5.4 5.95.72-4.4 4.06 1.16 5.86L12 16.9 6.74 19.24l1.16-5.86-4.4-4.06 5.95-.72z" fill="currentColor"/>';
            break;
        case 'flag':
            $inner = '<path d="M6 21V4M6 4h11l-2.2 3.5L17 11H6" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>';
            break;
    }
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' . $inner . '</svg>';
}

/** Colour palette for monogram avatars (no emoji). Keyed by token stored in DB. */
function avatar_palette(): array {
    return [
        'blue'   => ['#4c6fff', '#6a8bff'],
        'violet' => ['#9a6bff', '#b98bff'],
        'pink'   => ['#ff5fa2', '#ff9ec7'],
        'green'  => ['#22c55e', '#4ade80'],
        'teal'   => ['#14b8a6', '#2dd4bf'],
        'orange' => ['#ff8a3c', '#ffb020'],
        'red'    => ['#f5536b', '#ff7a90'],
        'cyan'   => ['#22b8d6', '#67e8f9'],
        'indigo' => ['#6366f1', '#818cf8'],
        'lime'   => ['#65a30d', '#a3e635'],
        'amber'  => ['#f59e0b', '#fbbf24'],
        'slate'  => ['#64748b', '#94a3b8'],
    ];
}

/** Two-stop gradient for an avatar token; falls back to a stable colour from a seed. */
function avatar_colors(?string $token, string $seed = ''): array {
    $pal = avatar_palette();
    if ($token !== null && isset($pal[$token])) return $pal[$token];
    $keys = array_keys($pal);
    $h = crc32($seed !== '' ? $seed : (string) $token);
    return $pal[$keys[$h % count($keys)]];
}

/** First letter of a name, upper-cased, for the monogram. */
function avatar_initial(string $name): string {
    $name = trim($name);
    if ($name === '') return '?';
    return mb_strtoupper(mb_substr($name, 0, 1, 'UTF-8'), 'UTF-8');
}

/** Render a user's avatar as a coloured monogram circle. */
function avatar_markup(array $user, string $cls = ''): string {
    $name = $user['display_name'] ?? ($user['username'] ?? '?');
    $cols = avatar_colors($user['avatar'] ?? null, (string) ($user['username'] ?? $name));
    $style = 'background:linear-gradient(135deg,' . $cols[0] . ',' . $cols[1] . ')';
    $c = 'avatar' . ($cls !== '' ? ' ' . $cls : '');
    return '<span class="' . e($c) . '" style="' . $style . '">' . e(avatar_initial($name)) . '</span>';
}

/** Currently logged-in user row, or null. */
function current_user_row(): ?array {
    if (empty($_SESSION['uid'])) return null;
    static $cache = null;
    if ($cache !== null) return $cache;
    $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['uid']]);
    $cache = $stmt->fetch() ?: null;
    return $cache;
}

function require_login(): array {
    $u = current_user_row();
    if (!$u) { header('Location: index.php'); exit; }
    return $u;
}

function require_teacher(): array {
    $u = require_login();
    if (empty($u['is_teacher'])) { header('Location: dashboard.php'); exit; }
    return $u;
}

/* ---------- CSRF protection ---------- */
function csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
    }
    return $_SESSION['csrf'];
}
function csrf_field(): string {
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}
function check_csrf(): bool {
    $sent = $_POST['csrf'] ?? ($_SERVER['HTTP_X_CSRF'] ?? '');
    return is_string($sent) && hash_equals($_SESSION['csrf'] ?? '', $sent);
}

/** Site-wide copyright footer. */
function site_footer(): string {
    $year = date('Y');
    return '<footer class="site-footer">&copy; ' . $year
         . ' Furkan Cankaya &middot; ' . e(APP_NAME) . '. All rights reserved.</footer>';
}

/* ---------- editable content (settings) ---------- */
/** Read a stored setting value, or null if it has never been saved. */
function setting_get(string $name): ?string {
    $stmt = db()->prepare('SELECT value FROM settings WHERE name = ?');
    $stmt->execute([$name]);
    $row = $stmt->fetch();
    return $row ? $row['value'] : null;
}
/** Insert or update a setting value (works on MySQL and SQLite). */
function setting_set(string $name, string $value): void {
    if (DB_DRIVER === 'sqlite') {
        $stmt = db()->prepare('INSERT OR REPLACE INTO settings (name, value) VALUES (?, ?)');
    } else {
        $stmt = db()->prepare('INSERT INTO settings (name, value) VALUES (?, ?)
                               ON DUPLICATE KEY UPDATE value = VALUES(value)');
    }
    $stmt->execute([$name, $value]);
}
/** Remove a stored setting (used to revert content to the built-in default). */
function setting_delete(string $name): void {
    $stmt = db()->prepare('DELETE FROM settings WHERE name = ?');
    $stmt->execute([$name]);
}
