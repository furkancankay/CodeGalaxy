<div align="center">

# Code Galaxy

### A gamified coding roadmap that takes kids from zero to real programmer.

Follow a winding road from circle to circle, light up your path one mission at a time,
and blast off through five worlds of programming — from Scratch games to computer-science core.

[![PHP](https://img.shields.io/badge/PHP-7.3%2B-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL%20%2F%20MariaDB-supported-00758F?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![SQLite](https://img.shields.io/badge/SQLite-local%20dev-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![No build step](https://img.shields.io/badge/build-none-success)](#)
[![License](https://img.shields.io/badge/license-All%20rights%20reserved-lightgrey)](#license)

**Live:** [code.mrfrkn.com](https://code.mrfrkn.com)

</div>

---

## What is Code Galaxy

Code Galaxy is a self-hosted learning platform built for classrooms and young learners. Students sign up,
get their own galaxy map, and work through a curated roadmap of coding missions. Each mission opens a panel
with a clear goal, what they will learn, step-by-step instructions, and links to where they can learn more.
Completing a mission lights up the road, earns XP, raises their astronaut rank, and unlocks the next circle.

Teachers get a control panel to watch every student's progress and to shape the whole curriculum themselves —
no code required.

---

## Highlights

- **Game-map progression** — a smooth S-shaped road threads through every mission circle, just like a level
  map in a puzzle game. Done, current, and locked missions each have their own look, with celebratory
  confetti when a mission is completed.
- **Two age tracks** — under-8 explorers start in the **Junior Galaxy** (block-based puzzles and ScratchJr) and
  graduate automatically to the **Big Missions** track the year they turn eight.
- **Teacher curriculum editor** — add, edit, reorder, and remove stages and missions for each age group
  separately, including the learning goals, step-by-step instructions, suggested languages, and resource links.
- **Suggested Projects** — a teacher-editable gallery of build-it-yourself project ideas (prime numbers,
  sorting algorithms, a calculator, the Shikaku puzzle game, and more).
- **Progress that sticks** — missions keep their identity when edited, so a student's completed work is never
  lost when a teacher tweaks the curriculum.
- **Zero build step, zero framework** — plain PHP, one stylesheet, a little vanilla JavaScript. Drop it on any
  PHP host and it runs.
- **Kid-safe by design** — monogram avatars, no third-party trackers, prepared statements, CSRF protection,
  and password hashing throughout.

---

## The roadmap

| Track | Stages | Missions | Covers |
| --- | --- | --- | --- |
| **Big Missions** (ages 8+) | 5 | 35 | Scratch games, Python, real programs, computer-science core, going pro |
| **Junior Galaxy** (under 8) | 2 | 9 | Robot puzzles (Lightbot Jr) and creative play (ScratchJr) |

**Big Missions stages**

1. Make Games in Scratch
2. First Real Language (Python)
3. Real Programs
4. Computer Science Core
5. Become a Pro

Everything above is the built-in default. Teachers can reshape any of it from the in-app editor.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Backend | PHP 7.3+ (no framework) |
| Database | MySQL / MariaDB in production, SQLite for local development |
| Data access | PDO with prepared statements |
| Frontend | Server-rendered HTML, one CSS file, vanilla JavaScript |
| Graphics | Inline SVG (road geometry, icons, doodles) — no image assets, no emoji |
| Hosting | Any PHP host; tested on cPanel / LiteSpeed |

---

## Project structure

```
code-galaxy/
├── index.php           Sign-up and login (with avatar picker)
├── dashboard.php       The student galaxy map
├── teacher.php         Mission Control — class progress overview
├── curriculum.php      Teacher curriculum editor (per age group)
├── projects.php        Suggested Projects (view for all, edit for teachers)
├── toggle.php          AJAX endpoint to complete / un-complete a mission
├── logout.php          Ends the session
├── roadmap.php         Curriculum data, defaults, and content helpers
├── config.php          Database config, schema, and shared helpers (not committed)
├── config.example.php  Template — copy to config.php and fill in your details
└── assets/
    ├── css/style.css   The entire visual design
    └── js/
        ├── app.js      Lesson modal, progress updates, confetti
        └── stars.js    Background star canvas
```

Editable content (the curriculum for each track and the suggested projects) is stored as JSON in a `settings`
table, seeded from the defaults in `roadmap.php`. Until a teacher makes a change, the built-in defaults are used.

---

## Getting started locally

You can run the whole thing on your own computer with zero database setup — it falls back to SQLite.

```bash
# 1. Get the code
git clone https://github.com/furkancankay/CodeGalaxy.git
cd CodeGalaxy

# 2. Create your config from the template
cp config.example.php config.php

# 3. (Optional) force local SQLite mode — create config.local.php:
#    <?php
#    define('DB_DRIVER', 'sqlite');
#    define('DB_PATH', __DIR__ . '/data/codegalaxy.sqlite');
#    define('TEACHER_SIGNUP_CODE', 'TEACHER-2026');

# 4. Run the built-in PHP server
php -S 127.0.0.1:8000

# 5. Open http://127.0.0.1:8000 in your browser
```

The database tables are created automatically on first load. Sign up once with your teacher code to get the
teacher control panel; everyone else who signs up becomes a student.

---

## Deploying to production

This app is designed to drop into a cPanel-style host (it runs at **code.mrfrkn.com**). A full walkthrough lives
in [`DEPLOY.md`](DEPLOY.md). The short version:

1. Create a subdomain and point it at a new document root.
2. Create a MySQL database and user in cPanel.
3. Copy `config.example.php` to `config.php` and fill in the real `DB_NAME`, `DB_USER`, `DB_PASS`, and a secret
   `TEACHER_SIGNUP_CODE`.
4. Upload every file **except** `config.local.php` and the local database into the document root.
5. Visit the subdomain — the tables build themselves on first load.

> **Security note:** `config.php` and `config.local.php` are intentionally excluded from version control because
> they hold database passwords and your teacher code. Keep them out of any public repository.

---

## Configuration reference

| Constant | Where | Purpose |
| --- | --- | --- |
| `DB_DRIVER` | `config.php` | `mysql` in production, `sqlite` for local dev |
| `DB_NAME` / `DB_USER` / `DB_PASS` | `config.php` | MySQL connection details |
| `DB_PATH` | `config.php` | SQLite file location (local only) |
| `TEACHER_SIGNUP_CODE` | `config.php` | Anyone who signs up with this exact code becomes a teacher — keep it secret |
| `APP_NAME` | `config.php` | Display name used across the UI |

---

## License

© 2026 Furkan Cankaya. All rights reserved.

Built for young space explorers.
