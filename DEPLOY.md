# 🚀 Deploying Code Galaxy to a subdomain of mrfrkn.com

This guide puts the site live at something like **https://code.mrfrkn.com**.
You do these steps in your cPanel — I can't (and shouldn't) log into your panel,
but every step below is quick. Estimated time: ~10 minutes.

> ⚠️ Before you start: **do NOT upload `config.local.php` or the `data/` folder.**
> Those are only for testing on your own computer with SQLite.
> The live site uses MySQL.

---

## Step 1 — Create the subdomain

1. Log into cPanel for mrfrkn.com.
2. Find **Domains → Subdomains** (older panels) or **Domains** (newer jupiter theme).
3. Create a subdomain:
   - **Subdomain:** `code`  (or `learn`, `kids` — your choice)
   - **Domain:** `mrfrkn.com`
   - **Document Root:** cPanel fills this automatically, e.g.
     `public_html/code.mrfrkn.com`  — **note this path**, you'll upload there.
4. Click **Create**.

Your site will live at **https://code.mrfrkn.com**.

---

## Step 2 — Create the MySQL database

1. In cPanel open **Databases → MySQL Database Wizard**.
2. **Create a database**, e.g. name part `codegalaxy`
   → full name becomes something like `mrfrknxx_codegalaxy`.
3. **Create a database user**, e.g. `mrfrknxx_cguser`, with a strong password.
   **Write down the password.**
4. On the privileges screen, tick **ALL PRIVILEGES** and finish.

Now you have three values to copy into the next step:
- Database **name** (e.g. `mrfrknxx_codegalaxy`)
- Database **user** (e.g. `mrfrknxx_cguser`)
- Database **password**

You don't need to create any tables — the app builds them automatically on first visit.

---

## Step 3 — Edit `config.php`

Open `config.php` and set these lines (near the top):

```php
define('DB_DRIVER', 'mysql');
define('DB_HOST',   'localhost');              // correct on almost all cPanel hosts
define('DB_NAME',   'mrfrknxx_codegalaxy');    // your database name from Step 2
define('DB_USER',   'mrfrknxx_cguser');        // your database user from Step 2
define('DB_PASS',   'your-strong-password');   // your database password from Step 2
```

Also change the teacher code to your own secret:

```php
define('TEACHER_SIGNUP_CODE', 'pick-your-own-secret-code');
```

Keep this code private — anyone who signs up with it gets the teacher dashboard.

---

## Step 4 — Upload the files

Use cPanel **File Manager** (or FTP) and upload **into the subdomain's document root**
from Step 1 (e.g. `public_html/code.mrfrkn.com`).

Upload these:
```
config.php
index.php
login.php
dashboard.php
teacher.php
toggle.php
logout.php
roadmap.php
assets/        (the whole folder)
data/          (just the folder with its .htaccess — keep it, it stays empty on MySQL)
```

**Do NOT upload:** `config.local.php`, `DEPLOY.md`, `README.md`, or any test database file.

Tip: zip the folder, upload the zip, then "Extract" in File Manager — much faster than
uploading files one by one.

---

## Step 5 — Go live

1. Visit **https://code.mrfrkn.com** — you should see the login screen.
2. Click **Sign Up**, open the **"I'm a teacher 👩‍🏫"** section, and enter your
   secret teacher code → you land on **Mission Control**.
3. Tell students to visit the same link and **sign up normally** (no code) — they each
   get their own space journey, and you'll see them all in your dashboard.

That's it — you're live! 🎉

---

## Optional polish

- **Force HTTPS:** cPanel → after the free SSL cert is issued, turn on
  "Force HTTPS Redirect" for the subdomain (under Domains).
- **Reset everything:** to wipe all accounts/progress, drop and recreate the
  database in cPanel, then revisit the site (tables rebuild automatically).
- **Change the roadmap:** edit `roadmap.php` — titles, topics, even whole stages.
  Existing progress keys stay matched as long as you keep the `key` values.
