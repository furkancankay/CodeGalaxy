/* Code Galaxy — Arcade v2: a story-driven adventure game for every world.
   Each game = a story + chapters with rising difficulty + saved progress
   (localStorage). Vanilla JS, no build step, no emoji — icons are inline SVG.

   Engines:
     gridQuest    — command-queue robot with collectible stars + REPEAT blocks
     quizQuest    — predict output / fill the blank / order the lines
     debugQuest   — find the broken line, then choose the right fix
     algoQuest    — swap-sorting, binary-search scanner, stack/queue cargo
     webQuest     — build a real page in a fake browser (HTML/CSS/JS)
     gitQuest     — terminal commands, branch graphs, merge conflicts
     dataQuest    — a REAL mini SQL engine: build queries, see live results
     apiQuest     — a mock API server: build requests, read status codes    */
(function () {
  'use strict';

  var modal = document.getElementById('arcadeModal');
  if (!modal) return;

  var elWorld = document.getElementById('aWorld');
  var elTitle = document.getElementById('aTitle');
  var elTag   = document.getElementById('aTag');
  var elHud   = document.getElementById('aHud');
  var elStage = document.getElementById('aStage');
  var card    = modal.querySelector('.arcade-card');
  var current = null;   // {info, gameKey}

  /* ================= helpers ================= */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function txt(tag, cls, s) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    n.textContent = s;
    return n;
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  var SVG = {
    star:  '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.55 5.4 5.95.72-4.4 4.06 1.16 5.86L12 16.9 6.74 19.24l1.16-5.86-4.4-4.06 5.95-.72z" fill="currentColor"/></svg>',
    heart: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.4C7 16.6 3.6 13.5 3.6 9.9 3.6 7.2 5.7 5.2 8.2 5.2c1.5 0 2.9.7 3.8 1.9.9-1.2 2.3-1.9 3.8-1.9 2.5 0 4.6 2 4.6 4.7 0 3.6-3.4 6.7-8.4 10.5z" fill="currentColor"/></svg>',
    lock:  '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2.2" fill="currentColor"/><path d="M8.2 11V8a3.8 3.8 0 0 1 7.6 0v3" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
    robot: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="16" y="20" width="32" height="26" rx="7" fill="#6a8bff"/><circle cx="26" cy="32" r="4.2" fill="#fff"/><circle cx="38" cy="32" r="4.2" fill="#fff"/><circle cx="26" cy="32" r="2" fill="#2a3252"/><circle cx="38" cy="32" r="2" fill="#2a3252"/><rect x="25" y="40" width="14" height="3" rx="1.5" fill="#cfe0ff"/><line x1="32" y1="12" x2="32" y2="20" stroke="#9a6bff" stroke-width="3"/><circle cx="32" cy="11" r="3" fill="#ff5fa2"/><rect x="10" y="27" width="4" height="11" rx="2" fill="#9a6bff"/><rect x="50" y="27" width="4" height="11" rx="2" fill="#9a6bff"/></svg>',
    rock:  '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 46l-6-14 10-12 18-4 12 14-4 16z" fill="#b9c3e6"/><path d="M22 24l14-6 8 10-6 14-16 2z" fill="#cfd8f2"/></svg>',
    flag:  '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4M6 4h11l-2.2 3.5L17 11H6" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    arrows: {
      up:    '<svg class="ic" viewBox="0 0 24 24"><path d="M12 5l7 8h-4v6h-6v-6H5z" fill="currentColor"/></svg>',
      down:  '<svg class="ic" viewBox="0 0 24 24"><path d="M12 19l-7-8h4V5h6v6h4z" fill="currentColor"/></svg>',
      left:  '<svg class="ic" viewBox="0 0 24 24"><path d="M5 12l8-7v4h6v6h-6v4z" fill="currentColor"/></svg>',
      right: '<svg class="ic" viewBox="0 0 24 24"><path d="M19 12l-8 7v-4H5v-6h6V5z" fill="currentColor"/></svg>'
    }
  };

  function hudChips(items) {
    elHud.innerHTML = '';
    items.forEach(function (it) {
      var c = el('span', 'hud-chip');
      c.appendChild(el('i', '', it.label));
      var v = el('b', '', it.value);
      if (it.id) v.id = it.id;
      c.appendChild(v);
      elHud.appendChild(c);
    });
  }
  function hudSet(id, val) {
    var n = document.getElementById(id);
    if (n) n.innerHTML = val;
  }
  function hearts(nLeft, nTotal) {
    var s = '';
    for (var i = 0; i < nTotal; i++) {
      s += '<span class="hud-heart' + (i < nLeft ? '' : ' out') + '">' + SVG.heart + '</span>';
    }
    return s;
  }
  function starRow(n, cls) {
    var s = '';
    for (var i = 0; i < 3; i++) s += '<span class="as-star' + (i < n ? ' on' : '') + '">' + SVG.star + '</span>';
    return '<span class="' + (cls || '') + '">' + s + '</span>';
  }
  function burst(big) {
    var colors = ['#ffd24a', '#4c6fff', '#9a6bff', '#34d399', '#ff5fa2', '#ff8a3c'];
    var count = big ? 120 : 46;
    for (var i = 0; i < count; i++) {
      var c = el('div', 'confetti');
      var size = 7 + Math.round(Math.random() * 8);
      c.style.left = (Math.random() * 100) + 'vw';
      c.style.width = size + 'px';
      c.style.height = (size + Math.round(Math.random() * 6)) + 'px';
      c.style.background = colors[i % colors.length];
      if (Math.random() < 0.4) c.style.borderRadius = '50%';
      c.style.animationDuration = (1 + Math.random() * 1.4) + 's';
      c.style.animationDelay = (Math.random() * (big ? 0.8 : 0.2)) + 's';
      document.body.appendChild(c);
      (function (n) { setTimeout(function () { n.remove(); }, 3400); })(c);
    }
  }

  /* ================= saved progress ================= */
  var LS_KEY = 'cgArcadeV2';
  function loadAll() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function starsFor(gameKey, nCh) {
    var all = loadAll();
    var arr = (all[gameKey] && all[gameKey].stars) || [];
    var out = [];
    for (var i = 0; i < nCh; i++) out.push(arr[i] || 0);
    return out;
  }
  function saveStars(gameKey, chIdx, stars) {
    var all = loadAll();
    if (!all[gameKey]) all[gameKey] = { stars: [] };
    if ((all[gameKey].stars[chIdx] || 0) < stars) all[gameKey].stars[chIdx] = stars;
    try { localStorage.setItem(LS_KEY, JSON.stringify(all)); } catch (e) { /* private mode */ }
  }

  /* ================= framework screens ================= */
  function showChapters(g, info) {
    elHud.innerHTML = '';
    elStage.innerHTML = '';
    var stars = starsFor(g.key, g.chapters.length);
    var total = 0, all3 = true;
    stars.forEach(function (s) { total += s; if (s < 1) all3 = false; });

    var wrap = el('div', 'ch-select');
    var hero = el('div', 'ch-hero');
    hero.style.background = 'radial-gradient(240px 120px at 80% -20%, rgba(255,255,255,.35), transparent), linear-gradient(115deg, ' + (info.color || '#4c6fff') + ', #9a6bff)';
    hero.innerHTML = '<span class="ch-hero-art">' + (g.hero || SVG.robot) + '</span>';
    wrap.appendChild(hero);
    var list = el('div', 'ch-list');
    g.chapters.forEach(function (ch, i) {
      var unlocked = (i === 0) || (stars[i - 1] > 0);
      var b = el('button', 'ch-card' + (unlocked ? '' : ' is-locked'));
      b.type = 'button';
      var head = el('div', 'ch-head');
      head.appendChild(el('span', 'ch-num', unlocked ? String(i + 1) : SVG.lock));
      head.appendChild(txt('h3', '', ch.name));
      b.appendChild(head);
      b.appendChild(txt('p', '', ch.blurb));
      b.appendChild(el('div', 'ch-stars', starRow(stars[i])));
      if (unlocked) {
        b.addEventListener('click', function () { runChapter(g, info, i); });
      }
      list.appendChild(b);
    });
    wrap.appendChild(list);

    if (all3) {
      var done = el('p', 'ch-done', 'World complete! ' + total + ' / ' + (g.chapters.length * 3) + ' stars collected.');
      wrap.insertBefore(done, list);
    }
    elStage.appendChild(wrap);
  }

  function runChapter(g, info, ci) {
    var ch = g.chapters[ci];
    var ctx = {
      stage: elStage,
      hud: hudChips, set: hudSet, hearts: hearts,
      done: function (stars, summary) {
        saveStars(g.key, ci, stars);
        chapterEnd(g, info, ci, stars, summary, true);
      },
      fail: function (summary) { chapterEnd(g, info, ci, 0, summary, false); },
      retry: function () { runChapter(g, info, ci); }
    };
    elHud.innerHTML = '';
    elStage.innerHTML = '';
    ch.run(ctx);
  }

  function chapterEnd(g, info, ci, stars, summary, won) {
    elHud.innerHTML = '';
    elStage.innerHTML = '';
    var allStars = starsFor(g.key, g.chapters.length);
    var isLast = (ci === g.chapters.length - 1);
    var finale = won && isLast && allStars.every(function (s) { return s > 0; });

    var p = el('div', 'arcade-end' + (won ? ' is-win' : ''));
    p.appendChild(el('div', 'arcade-end-ic', won ? SVG.star : SVG.heart));
    p.appendChild(txt('h3', '', finale ? 'WORLD ' + info.num + ' COMPLETE!' : (won ? g.chapters[ci].name + ' — complete!' : 'So close!')));
    if (won) p.appendChild(el('div', 'end-stars', starRow(stars)));
    if (summary) p.appendChild(txt('p', '', summary));
    if (finale) p.appendChild(txt('p', 'end-finale', g.finale || 'You mastered this world. On to the next planet, engineer!'));

    var row = el('div', 'end-btns');
    if (won && !isLast) {
      var next = el('button', 'btn-blast arcade-again', 'Next chapter');
      next.type = 'button';
      next.addEventListener('click', function () { runChapter(g, info, ci + 1); });
      row.appendChild(next);
    }
    if (!won) {
      var again = el('button', 'btn-blast arcade-again', 'Try again');
      again.type = 'button';
      again.addEventListener('click', function () { runChapter(g, info, ci); });
      row.appendChild(again);
    }
    var map = el('button', 'btn-ghost-wide arcade-map-btn', 'Chapter map');
    map.type = 'button';
    map.addEventListener('click', function () { showChapters(g, info); });
    row.appendChild(map);
    p.appendChild(row);
    elStage.appendChild(p);
    if (won) burst(finale);
  }

  /* small reusable pieces */
  function askMsg(s) { return txt('p', 'oh-ask', s); }
  function whyBox(s) { return txt('p', 'oh-why', s); }

  /* choice list: options[], onPick(index, buttonNode) */
  function choiceRow(options, cls, onPick) {
    var row = el('div', 'oh-choices ' + (cls || ''));
    options.forEach(function (o, i) {
      var b = el('button', 'oh-chip');
      b.type = 'button';
      b.textContent = o;
      b.addEventListener('click', function () { onPick(i, b, row); });
      row.appendChild(b);
    });
    return row;
  }

  /* Scratch-style block stack: items {c: category, t: text, in: indent} */
  function blockStack(items) {
    var stack = el('div', 'scb-stack');
    items.forEach(function (b) {
      var n = el('div', 'scb scb-' + b.c + (b.c === 'event' ? ' scb-hat' : ''));
      n.textContent = b.t;
      n.style.marginLeft = ((b.in || 0) * 20) + 'px';
      stack.appendChild(n);
    });
    return stack;
  }

  /* click-in-order puzzle: steps[] in correct order; renders shuffled */
  function orderPuzzle(mount, steps, onEnd) {
    var order = steps.map(function (s, i) { return { s: s, i: i }; });
    shuffle(order);
    var expect = 0, mistakes = 0;
    var list = el('div', 'chain-list');
    order.forEach(function (o) {
      var b = el('button', 'chain-card');
      b.type = 'button';
      b.appendChild(el('span', 'chain-slot', ''));
      b.appendChild(txt('span', 'chain-text', o.s));
      b.addEventListener('click', function () {
        if (b.classList.contains('is-set')) return;
        if (o.i === expect) {
          b.classList.add('is-set');
          b.querySelector('.chain-slot').textContent = String(expect + 1);
          expect++;
          if (expect >= steps.length) setTimeout(function () { onEnd(mistakes); }, 450);
        } else {
          mistakes++;
          b.classList.add('is-no');
          setTimeout(function () { b.classList.remove('is-no'); }, 420);
        }
      });
      list.appendChild(b);
    });
    mount.appendChild(list);
  }

  /* =================================================================
     ENGINE: gridQuest — Robo with stars to collect and REPEAT blocks
     ================================================================= */
  function gridQuest(levels, useRepeat) {
    return function (ctx) {
      var li = 0, earned = 0;

      function loadLevel() {
        var L = levels[li];
        var stars = (L.stars || []).slice();
        var got = [];
        ctx.hud([
          { label: 'Level', value: (li + 1) + ' / ' + levels.length },
          { label: useRepeat ? 'Blocks' : 'Commands', value: '0', id: 'rrCnt' },
          { label: 'Best plan', value: String(L.par) + (L.limit ? ' (max ' + L.limit + ')' : '') },
          { label: 'Stars', value: '0 / ' + stars.length, id: 'rrStars' }
        ]);
        ctx.stage.innerHTML = '';

        var wrap = el('div', 'rr-wrap');
        var board = el('div', 'rr-board');
        var grid = el('div', 'rr-grid');
        board.appendChild(grid);
        grid.style.gridTemplateColumns = 'repeat(' + L.w + ', 1fr)';
        var cells = [];
        for (var y = 0; y < L.h; y++) for (var x = 0; x < L.w; x++) {
          var c = el('div', 'rr-cell');
          cells.push(c);
          grid.appendChild(c);
        }
        function cellAt(x, y) { return cells[y * L.w + x]; }
        (L.rocks || []).forEach(function (r) { var c2 = cellAt(r[0], r[1]); c2.classList.add('rr-rock'); c2.innerHTML = SVG.rock; });
        stars.forEach(function (s) { var c3 = cellAt(s[0], s[1]); c3.classList.add('rr-starcell'); c3.innerHTML = SVG.star; });
        var flagCell = cellAt(L.flag[0], L.flag[1]);
        flagCell.classList.add('rr-flag');
        flagCell.innerHTML = SVG.flag;

        var bot = el('div', 'rr-bot', SVG.robot);
        grid.appendChild(bot);
        var pos = [L.bot[0], L.bot[1]];
        function place(anim) {
          bot.style.transition = anim ? '' : 'none';
          bot.style.left = (pos[0] / L.w * 100) + '%';
          bot.style.top = (pos[1] / L.h * 100) + '%';
          bot.style.width = (100 / L.w) + '%';
          bot.style.height = (100 / L.h) + '%';
        }
        place(false);

        var queue = []; // {d, n}
        var mult = 1;
        var qRow = el('div', 'rr-queue');
        var qHint = el('span', 'rr-hint', useRepeat
          ? 'Pick x2 / x3 to repeat the next arrow. Fewer blocks = more stars!'
          : 'Tap arrows to plan the route, then press Go');
        function chipCount() { return queue.length; }
        function redrawQueue() {
          qRow.innerHTML = '';
          if (!queue.length) qRow.appendChild(qHint);
          queue.forEach(function (q, qi) {
            var chip = el('button', 'rr-q', (q.n > 1 ? '<i>' + q.n + '&times;</i>' : '') + SVG.arrows[q.d]);
            chip.type = 'button';
            chip.title = 'Remove this block';
            chip.addEventListener('click', function () {
              if (running) return;
              queue.splice(qi, 1);
              redrawQueue();
            });
            qRow.appendChild(chip);
          });
          ctx.set('rrCnt', String(chipCount()));
        }

        var pad = el('div', 'rr-pad' + (useRepeat ? ' rr-pad-wide' : ''));
        var multBtns = [];
        if (useRepeat) {
          [1, 2, 3].forEach(function (m) {
            var mb = el('button', 'rr-mult' + (m === 1 ? ' on' : ''), 'x' + m);
            mb.type = 'button';
            mb.addEventListener('click', function () {
              mult = m;
              multBtns.forEach(function (o) { o.classList.remove('on'); });
              mb.classList.add('on');
            });
            multBtns.push(mb);
            pad.appendChild(mb);
          });
        }
        ['up', 'left', 'down', 'right'].forEach(function (d) {
          var b = el('button', 'rr-key', SVG.arrows[d]);
          b.type = 'button';
          b.addEventListener('click', function () {
            if (running) return;
            if (L.limit && chipCount() >= L.limit) { msg.textContent = 'Block limit reached — use repeats to shorten the plan!'; return; }
            queue.push({ d: d, n: mult });
            redrawQueue();
          });
          pad.appendChild(b);
        });

        var actions = el('div', 'rr-actions');
        var goBtn = el('button', 'btn-blast rr-go', 'Go!');
        goBtn.type = 'button';
        var clrBtn = el('button', 'btn-ghost-wide rr-clear', 'Clear');
        clrBtn.type = 'button';
        actions.appendChild(goBtn);
        actions.appendChild(clrBtn);
        var msg = el('p', 'rr-msg', '');

        var running = false, timer = null;
        function resetBot() {
          pos = [L.bot[0], L.bot[1]];
          got = [];
          ctx.set('rrStars', '0 / ' + stars.length);
          stars.forEach(function (s) { var c4 = cellAt(s[0], s[1]); c4.classList.remove('rr-got'); c4.innerHTML = SVG.star; });
          place(false);
        }
        clrBtn.addEventListener('click', function () {
          if (timer) clearTimeout(timer);
          running = false;
          queue = [];
          redrawQueue();
          resetBot();
          msg.textContent = '';
        });

        goBtn.addEventListener('click', function () {
          if (running || !queue.length) return;
          running = true;
          msg.textContent = '';
          resetBot();
          var steps = [];
          queue.forEach(function (q) { for (var k = 0; k < q.n; k++) steps.push(q.d); });
          var si = 0;
          var D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

          function tick() {
            if (si >= steps.length) {
              running = false;
              msg.textContent = (got.length < stars.length)
                ? 'Robo stopped — but ' + (stars.length - got.length) + ' star(s) are still out there!'
                : 'Robo stopped before the flag. Add more blocks!';
              return;
            }
            var d = D[steps[si]];
            var nx = pos[0] + d[0], ny = pos[1] + d[1];
            var hitWall = nx < 0 || ny < 0 || nx >= L.w || ny >= L.h;
            var hitRock = !hitWall && (L.rocks || []).some(function (r) { return r[0] === nx && r[1] === ny; });
            if (hitWall || hitRock) {
              running = false;
              bot.classList.add('rr-crash');
              msg.textContent = hitWall ? 'Bonk! Robo hit the edge at step ' + (si + 1) + '.' : 'Crash! A rock blocks step ' + (si + 1) + '.';
              setTimeout(function () { bot.classList.remove('rr-crash'); resetBot(); }, 750);
              return;
            }
            pos = [nx, ny];
            place(true);
            stars.forEach(function (s, sidx) {
              if (s[0] === nx && s[1] === ny && got.indexOf(sidx) === -1) {
                got.push(sidx);
                var c5 = cellAt(s[0], s[1]);
                c5.classList.add('rr-got');
                ctx.set('rrStars', got.length + ' / ' + stars.length);
              }
            });
            if (nx === L.flag[0] && ny === L.flag[1]) {
              if (got.length >= stars.length) {
                running = false;
                var used = chipCount();
                var lvlStars = used <= L.par ? 3 : (used <= L.par + 2 ? 2 : 1);
                earned += lvlStars;
                setTimeout(function () {
                  li++;
                  if (li >= levels.length) {
                    var avg = Math.max(1, Math.round(earned / levels.length));
                    ctx.done(avg, 'You planned ' + levels.length + ' routes and earned ' + earned + ' route stars.');
                  } else { burst(); loadLevel(); }
                }, 420);
                return;
              }
              msg.textContent = 'The flag is locked! Collect every star first.';
            }
            si++;
            timer = setTimeout(tick, 340);
          }
          timer = setTimeout(tick, 280);
        });

        wrap.appendChild(board);
        wrap.appendChild(qRow);
        wrap.appendChild(pad);
        wrap.appendChild(actions);
        wrap.appendChild(msg);
        ctx.stage.appendChild(wrap);
        redrawQueue();
      }
      loadLevel();
    };
  }

  /* =================================================================
     ENGINE: quizQuest — one chapter of mixed puzzle rounds
     round kinds: predict {code, answers, correct, why}
                  blank   {goal, code (with ___), answers, correct, why}
                  order   {goal, lines[] in correct order}
     ================================================================= */
  function quizQuest(rounds, lives) {
    return function (ctx) {
      var i = 0, score = 0, left = lives, TOT = lives;

      function draw() {
        ctx.hud([
          { label: 'Puzzle', value: (i + 1) + ' / ' + rounds.length },
          { label: 'Solved', value: String(score), id: 'qS' },
          { label: 'Lives', value: hearts(left, TOT), id: 'qL' }
        ]);
        var R = rounds[i];
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'oh-wrap');

        function next(afterMs) {
          setTimeout(function () {
            i++;
            if (i >= rounds.length) {
              var st = score >= rounds.length ? 3 : (score >= rounds.length - 2 ? 2 : 1);
              ctx.done(st, 'You solved ' + score + ' of ' + rounds.length + ' puzzles.');
            } else draw();
          }, afterMs || 0);
        }
        function lose() {
          left--;
          ctx.set('qL', hearts(left, TOT));
          if (left <= 0) {
            setTimeout(function () { ctx.fail('You solved ' + score + ' puzzles before running out of lives.'); }, 1200);
            return true;
          }
          return false;
        }
        function addNextBtn() {
          var b = el('button', 'btn-blast oh-next', (i + 1 < rounds.length) ? 'Next puzzle' : 'Finish');
          b.type = 'button';
          b.addEventListener('click', function () { next(0); });
          wrap.appendChild(b);
        }

        if (R.kind === 'order') {
          wrap.appendChild(askMsg(R.goal + ' — tap the lines in the right order!'));
          var box = el('div', 'bz-code');
          orderPuzzle(box, R.lines, function (mistakes) {
            if (mistakes === 0) score++;
            ctx.set('qS', String(score));
            if (mistakes > 0 && lose()) return;
            wrap.appendChild(whyBox(mistakes === 0 ? 'Perfect order — the program runs top to bottom!' : 'Order matters: a variable must exist before you use it.'));
            addNextBtn();
          });
          wrap.appendChild(box);
        } else {
          wrap.appendChild(askMsg(R.q ? R.q : (R.kind === 'blank' ? R.goal + ' — pick the missing piece!' : 'What will this code print?')));
          if (R.blocks) wrap.appendChild(blockStack(R.blocks));
          else wrap.appendChild(el('pre', 'code-block', R.code));
          var done = false;
          wrap.appendChild(choiceRow(R.answers, '', function (ai, b, row) {
            if (done) return;
            done = true;
            var right = (ai === R.correct);
            b.classList.add(right ? 'is-right' : 'is-wrong');
            if (right) { score++; ctx.set('qS', String(score)); }
            else {
              row.children[R.correct].classList.add('is-right');
              if (lose()) { wrap.appendChild(whyBox(R.why)); return; }
            }
            wrap.appendChild(whyBox(R.why));
            addNextBtn();
          }));
        }
        ctx.stage.appendChild(wrap);
      }
      draw();
    };
  }

  /* =================================================================
     ENGINE: debugQuest — find the bug, then choose the correct fix
     round: {goal, lines[], bug, fixes[], fix, why}
     ================================================================= */
  function debugQuest(rounds, lives) {
    return function (ctx) {
      var i = 0, score = 0, left = lives, TOT = lives;

      function draw() {
        ctx.hud([
          { label: 'System', value: (i + 1) + ' / ' + rounds.length },
          { label: 'Repaired', value: String(score), id: 'dS' },
          { label: 'Lives', value: hearts(left, TOT), id: 'dL' }
        ]);
        var R = rounds[i];
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'bz-wrap');
        wrap.appendChild(askMsg('This program should ' + R.goal + ' — find the broken line!'));
        var box = el('div', 'bz-code');
        var phase = 1;

        function lose() {
          left--;
          ctx.set('dL', hearts(left, TOT));
          if (left <= 0) {
            setTimeout(function () { ctx.fail('You repaired ' + score + ' of ' + rounds.length + ' systems.'); }, 1100);
            return true;
          }
          return false;
        }
        function nextBtn() {
          var b = el('button', 'btn-blast oh-next', (i + 1 < rounds.length) ? 'Next system' : 'Finish');
          b.type = 'button';
          b.addEventListener('click', function () {
            i++;
            if (i >= rounds.length) {
              var st = score >= rounds.length ? 3 : (score >= rounds.length - 1 ? 2 : 1);
              ctx.done(st, 'You repaired ' + score + ' of ' + rounds.length + ' station systems.');
            } else draw();
          });
          wrap.appendChild(b);
        }

        R.lines.forEach(function (ln, liIdx) {
          var row = el('button', 'bz-line');
          row.type = 'button';
          row.appendChild(el('span', 'bz-n', String(liIdx + 1)));
          var codeEl = el('code');
          codeEl.textContent = ln;
          row.appendChild(codeEl);
          row.addEventListener('click', function () {
            if (phase !== 1) return;
            if (liIdx !== R.bug) {
              row.classList.add('is-wrong');
              if (lose()) { phase = 0; box.children[R.bug].classList.add('is-bug'); wrap.appendChild(whyBox(R.why)); }
              return;
            }
            phase = 2;
            row.classList.add('is-bug');
            wrap.appendChild(askMsg('Found it! Now pick the repair:'));
            var doneFix = false;
            wrap.appendChild(choiceRow(R.fixes, 'bz-fixes', function (fi, fb, frow) {
              if (doneFix) return;
              doneFix = true;
              var right = (fi === R.fix);
              fb.classList.add(right ? 'is-right' : 'is-wrong');
              if (right) { score++; ctx.set('dS', String(score)); }
              else {
                frow.children[R.fix].classList.add('is-right');
                if (lose()) { wrap.appendChild(whyBox(R.why)); return; }
              }
              wrap.appendChild(whyBox(R.why));
              nextBtn();
            }));
          });
          box.appendChild(row);
        });
        wrap.appendChild(box);
        ctx.stage.appendChild(wrap);
      }
      draw();
    };
  }

  /* =================================================================
     ENGINE: algoQuest pieces — sortRounds, searchRounds, cargo MCQ
     ================================================================= */
  function minSwaps(arr) {
    var n = arr.length;
    var sorted = arr.slice().sort(function (a, b) { return a - b; });
    var used = sorted.map(function () { return false; });
    var seen = arr.map(function () { return false; });
    // map each value occurrence to target index (handles duplicates)
    var target = [];
    arr.forEach(function (v) {
      for (var k = 0; k < n; k++) if (!used[k] && sorted[k] === v) { used[k] = true; target.push(k); break; }
    });
    var swaps = 0;
    for (var i = 0; i < n; i++) {
      if (seen[i]) continue;
      var len = 0, j = i;
      while (!seen[j]) { seen[j] = true; j = target[j]; len++; }
      if (len > 1) swaps += len - 1;
    }
    return swaps;
  }

  function sortChapter(rounds) {
    return function (ctx) {
      var ri = 0, totalStars = 0;
      function draw() {
        var arr = rounds[ri].slice();
        var par = minSwaps(arr);
        var swaps = 0, selected = -1;
        ctx.hud([
          { label: 'Round', value: (ri + 1) + ' / ' + rounds.length },
          { label: 'Swaps', value: '0', id: 'asS' },
          { label: 'Best possible', value: String(par) }
        ]);
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'as-wrap');
        wrap.appendChild(askMsg('Sort the asteroids, smallest to biggest. Tap two to swap!'));
        var row = el('div', 'as-row');
        var msg = el('p', 'rr-msg', '');
        function redraw() {
          row.innerHTML = '';
          arr.forEach(function (v, ix) {
            var b = el('button', 'as-rock' + (ix === selected ? ' is-sel' : ''), '<span>' + v + '</span>');
            b.type = 'button';
            b.addEventListener('click', function () {
              if (selected === -1) { selected = ix; redraw(); return; }
              if (selected === ix) { selected = -1; redraw(); return; }
              var t = arr[selected]; arr[selected] = arr[ix]; arr[ix] = t;
              selected = -1; swaps++;
              ctx.set('asS', String(swaps));
              redraw();
              var ok = arr.every(function (vv, k) { return k === 0 || arr[k - 1] <= vv; });
              if (ok) {
                var st = swaps <= par ? 3 : (swaps <= par + 2 ? 2 : 1);
                totalStars += st;
                msg.innerHTML = 'Sorted in ' + swaps + ' swaps! ' + starRow(st);
                setTimeout(function () {
                  ri++;
                  if (ri >= rounds.length) {
                    ctx.done(Math.max(1, Math.round(totalStars / rounds.length)),
                      'Belt cleared: ' + totalStars + ' of ' + rounds.length * 3 + ' sorting stars.');
                  } else { burst(); draw(); }
                }, 1300);
              }
            });
            row.appendChild(b);
          });
        }
        redraw();
        wrap.appendChild(row);
        wrap.appendChild(msg);
        ctx.stage.appendChild(wrap);
      }
      draw();
    };
  }

  function searchChapter(rounds) {
    return function (ctx) {
      var ri = 0, totalStars = 0;
      function draw() {
        var R = rounds[ri];
        var secret = 1 + Math.floor(Math.random() * R.max);
        var lo = 1, hi = R.max, scans = 0;
        ctx.hud([
          { label: 'Round', value: (ri + 1) + ' / ' + rounds.length },
          { label: 'Scans', value: '0 / ' + R.budget, id: 'bsS' },
          { label: 'Range', value: '1 - ' + R.max, id: 'bsR' }
        ]);
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'bs-wrap');
        wrap.appendChild(askMsg('A pirate ship hides at a number between 1 and ' + R.max + '. Scan smart — each scan tells you higher or lower. Tip: always scan the MIDDLE!'));
        var bar = el('div', 'bs-bar');
        var fill = el('div', 'bs-fill');
        bar.appendChild(fill);
        function drawBar() {
          fill.style.left = ((lo - 1) / R.max * 100) + '%';
          fill.style.width = ((hi - lo + 1) / R.max * 100) + '%';
          ctx.set('bsR', lo + ' - ' + hi);
        }
        drawBar();
        var disp = el('div', 'bs-disp', '<i>Type a number to scan</i>');
        var val = '';
        var padWrap = el('div', 'bs-pad');
        var msg = el('p', 'rr-msg', '');
        for (var d = 1; d <= 9; d++) (function (dd) {
          var b = el('button', 'bs-key', String(dd));
          b.type = 'button';
          b.addEventListener('click', function () { if (val.length < 3) { val += dd; disp.textContent = val; } });
          padWrap.appendChild(b);
        })(d);
        var zero = el('button', 'bs-key', '0');
        zero.type = 'button';
        zero.addEventListener('click', function () { if (val && val.length < 3) { val += '0'; disp.textContent = val; } });
        padWrap.appendChild(zero);
        var back = el('button', 'bs-key bs-back', 'DEL');
        back.type = 'button';
        back.addEventListener('click', function () { val = val.slice(0, -1); disp.textContent = val || ''; if (!val) disp.innerHTML = '<i>Type a number to scan</i>'; });
        padWrap.appendChild(back);
        var scan = el('button', 'bs-key bs-scan', 'SCAN');
        scan.type = 'button';
        scan.addEventListener('click', function () {
          var g = parseInt(val, 10);
          val = ''; disp.innerHTML = '<i>Type a number to scan</i>';
          if (!g || g < lo || g > hi) { msg.textContent = 'Scan inside the glowing range!'; return; }
          scans++;
          ctx.set('bsS', scans + ' / ' + R.budget);
          if (g === secret) {
            var perfect = Math.ceil(Math.log(R.max + 1) / Math.log(2));
            var st = scans <= perfect ? 3 : (scans <= perfect + 1 ? 2 : 1);
            totalStars += st;
            msg.innerHTML = 'Found at ' + secret + ' in ' + scans + ' scans! ' + starRow(st);
            setTimeout(function () {
              ri++;
              if (ri >= rounds.length) {
                ctx.done(Math.max(1, Math.round(totalStars / rounds.length)), 'Every pirate found. Binary search mastered!');
              } else { burst(); draw(); }
            }, 1300);
            return;
          }
          if (g < secret) { lo = Math.max(lo, g + 1); msg.textContent = g + ' is too LOW — the ship hides higher.'; }
          else { hi = Math.min(hi, g - 1); msg.textContent = g + ' is too HIGH — the ship hides lower.'; }
          drawBar();
          if (scans >= R.budget) {
            msg.textContent = 'Out of scanner fuel! The ship was at ' + secret + '.';
            setTimeout(function () { ctx.fail('The pirates escaped. Remember: scan the middle to cut the range in half!'); }, 1400);
          }
        });
        padWrap.appendChild(scan);
        wrap.appendChild(bar);
        wrap.appendChild(disp);
        wrap.appendChild(padWrap);
        wrap.appendChild(msg);
        ctx.stage.appendChild(wrap);
      }
      draw();
    };
  }

  /* =================================================================
     ENGINE: webQuest — build a page in a fake browser
     step: {need, options[], correct, html?, css?, js?}
     ================================================================= */
  function webQuest(steps, pageTitle) {
    return function (ctx) {
      var i = 0, score = 0;
      ctx.stage.innerHTML = '';
      var wrap = el('div', 'wb-wrap');
      var browser = el('div', 'wb-browser');
      var barEl = el('div', 'wb-bar',
        '<span class="l-map-dot" style="--c:#ff5fa2"></span><span class="l-map-dot" style="--c:#ffb020"></span><span class="l-map-dot" style="--c:#22c55e"></span><span class="wb-url">space-cafe.galaxy</span>');
      var page = el('div', 'wb-page');
      browser.appendChild(barEl);
      browser.appendChild(page);
      var quiz = el('div', 'wb-quiz');
      wrap.appendChild(browser);
      wrap.appendChild(quiz);
      ctx.stage.appendChild(wrap);

      function drawHud() {
        ctx.hud([
          { label: 'Build step', value: Math.min(i + 1, steps.length) + ' / ' + steps.length },
          { label: 'First-try builds', value: String(score), id: 'wbS' }
        ]);
      }

      function step() {
        drawHud();
        quiz.innerHTML = '';
        if (i >= steps.length) {
          var st = score >= steps.length ? 3 : (score >= steps.length - 2 ? 2 : 1);
          ctx.done(st, 'The page is built! ' + score + ' of ' + steps.length + ' pieces landed first try.');
          return;
        }
        var S = steps[i];
        quiz.appendChild(askMsg(S.need));
        var tried = false;
        quiz.appendChild(choiceRow(S.options, 'wb-choices', function (ai, b, row) {
          if (b.classList.contains('is-wrong') || b.classList.contains('is-right')) return;
          if (ai === S.correct) {
            b.classList.add('is-right');
            if (!tried) score++;
            ctx.set('wbS', String(score));
            if (S.html) page.insertAdjacentHTML('beforeend', S.html);
            if (S.css) {
              var parts = S.css; // [selector, prop, value] triplets list
              parts.forEach(function (p) {
                var nodes = page.querySelectorAll(p[0]);
                for (var k = 0; k < nodes.length; k++) nodes[k].style[p[1]] = p[2];
              });
            }
            if (S.js) S.js(page);
            var w = whyBox(S.why || 'Exactly right!');
            quiz.appendChild(w);
            var nb = el('button', 'btn-blast oh-next', (i + 1 < steps.length) ? 'Next piece' : 'Open the café!');
            nb.type = 'button';
            nb.addEventListener('click', function () { i++; step(); });
            quiz.appendChild(nb);
          } else {
            tried = true;
            b.classList.add('is-wrong');
          }
        }));
      }
      step();
    };
  }

  /* =================================================================
     ENGINE: gitQuest command rounds — terminal styled MCQ
     round: {scenario, options[], correct, output, why}
     ================================================================= */
  function termChapter(rounds, lives) {
    return function (ctx) {
      var i = 0, score = 0, left = lives, TOT = lives;
      function draw() {
        ctx.hud([
          { label: 'Task', value: (i + 1) + ' / ' + rounds.length },
          { label: 'Done', value: String(score), id: 'gS' },
          { label: 'Lives', value: hearts(left, TOT), id: 'gL' }
        ]);
        var R = rounds[i];
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'oh-wrap');
        wrap.appendChild(askMsg(R.scenario));
        var term = el('div', 'gt-term', '<span class="gt-prompt">student@galaxy:~/project$</span> <span class="gt-cursor"></span>');
        wrap.appendChild(term);
        var done = false;
        wrap.appendChild(choiceRow(R.options, 'gt-choices', function (ai, b, row) {
          if (done) return;
          done = true;
          var right = ai === R.correct;
          b.classList.add(right ? 'is-right' : 'is-wrong');
          term.innerHTML = '<span class="gt-prompt">student@galaxy:~/project$</span> ' + R.options[ai] +
            '\n<span class="' + (right ? 'gt-ok' : 'gt-err') + '">' + (right ? R.output : 'error: that is not the right tool for this job') + '</span>';
          if (right) { score++; ctx.set('gS', String(score)); }
          else {
            row.children[R.correct].classList.add('is-right');
            left--;
            ctx.set('gL', hearts(left, TOT));
            if (left <= 0) { setTimeout(function () { ctx.fail('You finished ' + score + ' of ' + rounds.length + ' terminal tasks.'); }, 1300); return; }
          }
          wrap.appendChild(whyBox(R.why));
          var nb = el('button', 'btn-blast oh-next', (i + 1 < rounds.length) ? 'Next task' : 'Finish');
          nb.type = 'button';
          nb.addEventListener('click', function () {
            i++;
            if (i >= rounds.length) {
              var st = score >= rounds.length ? 3 : (score >= rounds.length - 2 ? 2 : 1);
              ctx.done(st, score + ' of ' + rounds.length + ' commands mastered.');
            } else draw();
          });
          wrap.appendChild(nb);
        }));
        ctx.stage.appendChild(wrap);
      }
      draw();
    };
  }

  /* conflict resolution rounds: {goal, file, options[], correct, why} */
  function conflictChapter(rounds) {
    return function (ctx) {
      var i = 0, score = 0;
      function draw() {
        ctx.hud([
          { label: 'Conflict', value: (i + 1) + ' / ' + rounds.length },
          { label: 'Resolved', value: String(score), id: 'cS' }
        ]);
        var R = rounds[i];
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'oh-wrap');
        wrap.appendChild(askMsg('MERGE CONFLICT! ' + R.goal));
        var file = el('pre', 'code-block gt-conflict');
        file.textContent = R.file;
        wrap.appendChild(file);
        wrap.appendChild(askMsg('Pick the correctly resolved file:'));
        var done = false;
        var row = el('div', 'gt-res');
        R.options.forEach(function (opt, ai) {
          var b = el('button', 'gt-res-opt');
          b.type = 'button';
          var pre = el('pre');
          pre.textContent = opt;
          b.appendChild(pre);
          b.addEventListener('click', function () {
            if (done) return;
            done = true;
            var right = ai === R.correct;
            b.classList.add(right ? 'is-right' : 'is-wrong');
            if (right) score++;
            else row.children[R.correct].classList.add('is-right');
            ctx.set('cS', String(score));
            wrap.appendChild(whyBox(R.why));
            var nb = el('button', 'btn-blast oh-next', (i + 1 < rounds.length) ? 'Next conflict' : 'Finish');
            nb.type = 'button';
            nb.addEventListener('click', function () {
              i++;
              if (i >= rounds.length) {
                var st = score >= rounds.length ? 3 : (score >= rounds.length - 1 ? 2 : 1);
                ctx.done(st, score + ' of ' + rounds.length + ' conflicts resolved like a pro.');
              } else draw();
            });
            wrap.appendChild(nb);
          });
          row.appendChild(b);
        });
        wrap.appendChild(row);
        ctx.stage.appendChild(wrap);
      }
      draw();
    };
  }

  /* =================================================================
     ENGINE: dataQuest — a real mini SQL playground
     ================================================================= */
  var DB = {
    planets: [
      { name: 'Vulcania', rings: 'no',  moons: 2, size: 'small'  },
      { name: 'Ringara',  rings: 'yes', moons: 5, size: 'big'    },
      { name: 'Bluemar',  rings: 'no',  moons: 1, size: 'medium' },
      { name: 'Gasperon', rings: 'yes', moons: 8, size: 'big'    },
      { name: 'Tinyx',    rings: 'no',  moons: 0, size: 'small'  }
    ],
    ships: [
      { id: 1, name: 'Comet Cruiser', speed: 400 },
      { id: 2, name: 'Star Skipper',  speed: 520 },
      { id: 3, name: 'Nebula Nomad',  speed: 310 }
    ],
    pilots: [
      { id: 1, name: 'Maya', ship_id: 2 },
      { id: 2, name: 'Leo',  ship_id: 1 },
      { id: 3, name: 'Zed',  ship_id: 3 }
    ],
    missions: [
      { name: 'Ring Survey', pilot_id: 3 },
      { name: 'Moon Count',  pilot_id: 1 },
      { name: 'Speed Run',   pilot_id: 2 }
    ]
  };
  function renderTable(rows, cols) {
    if (!rows.length) return el('p', 'sql-empty', 'No rows matched.');
    var t = el('table', 'sql-table');
    var tr = el('tr');
    cols.forEach(function (c) { tr.appendChild(txt('th', '', c)); });
    t.appendChild(tr);
    rows.forEach(function (r) {
      var tr2 = el('tr');
      cols.forEach(function (c) { tr2.appendChild(txt('td', '', String(r[c]))); });
      t.appendChild(tr2);
    });
    return t;
  }
  /* chipPick: label + options; returns holder with .value */
  function chipPick(labelText, options, holder) {
    var box = el('div', 'sql-slot');
    box.appendChild(txt('span', 'sql-kw', labelText));
    var row = el('div', 'sql-opts');
    options.forEach(function (o) {
      var b = el('button', 'sql-opt');
      b.type = 'button';
      b.textContent = o;
      b.addEventListener('click', function () {
        holder.value = o;
        var sib = row.children;
        for (var k = 0; k < sib.length; k++) sib[k].classList.remove('on');
        b.classList.add('on');
      });
      row.appendChild(b);
    });
    box.appendChild(row);
    return box;
  }

  /* tableChapter — learn to READ a table: rows, columns, records */
  function tableChapter(rounds) {
    return function (ctx) {
      var i = 0, score = 0;
      function draw() {
        ctx.hud([
          { label: 'Question', value: (i + 1) + ' / ' + rounds.length },
          { label: 'First-try', value: String(score), id: 'tS' }
        ]);
        var R = rounds[i];
        var rows = DB.planets;
        var cols = Object.keys(rows[0]);
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'sql-wrap');
        wrap.appendChild(askMsg(R.q));
        var tried = false, solved = false;

        function finishRound() {
          wrap.appendChild(whyBox(R.why));
          var nb = el('button', 'btn-blast oh-next', (i + 1 < rounds.length) ? 'Next question' : 'Finish');
          nb.type = 'button';
          nb.addEventListener('click', function () {
            i++;
            if (i >= rounds.length) {
              var st = score >= rounds.length ? 3 : (score >= rounds.length - 1 ? 2 : 1);
              ctx.done(st, 'You can read a database table like a librarian!');
            } else draw();
          });
          wrap.appendChild(nb);
        }

        if (R.kind === 'mcq') {
          wrap.appendChild(renderTable(rows, cols));
          var done = false;
          wrap.appendChild(choiceRow(R.answers, '', function (ai, b, row) {
            if (done) return;
            done = true;
            var right = ai === R.correct;
            b.classList.add(right ? 'is-right' : 'is-wrong');
            if (right) { score++; ctx.set('tS', String(score)); }
            else row.children[R.correct].classList.add('is-right');
            finishRound();
          }));
        } else {
          var t = el('table', 'sql-table is-clicky');
          var tr = el('tr');
          cols.forEach(function (c) {
            var th = txt('th', R.kind === 'col' ? 'sql-th-btn' : '', c);
            if (R.kind === 'col') {
              th.addEventListener('click', function () {
                if (solved) return;
                if (c === R.match) {
                  solved = true;
                  th.classList.add('is-right-cell');
                  if (!tried) score++;
                  ctx.set('tS', String(score));
                  finishRound();
                } else { tried = true; th.classList.add('is-wrong-cell'); setTimeout(function () { th.classList.remove('is-wrong-cell'); }, 500); }
              });
            }
            tr.appendChild(th);
          });
          t.appendChild(tr);
          rows.forEach(function (r) {
            var tr2 = el('tr');
            if (R.kind === 'row') tr2.className = 'sql-tr-btn';
            cols.forEach(function (c) { tr2.appendChild(txt('td', '', String(r[c]))); });
            if (R.kind === 'row') {
              tr2.addEventListener('click', function () {
                if (solved) return;
                if (r.name === R.match) {
                  solved = true;
                  tr2.classList.add('is-right-row');
                  if (!tried) score++;
                  ctx.set('tS', String(score));
                  finishRound();
                } else { tried = true; tr2.classList.add('is-wrong-row'); setTimeout(function () { tr2.classList.remove('is-wrong-row'); }, 500); }
              });
            }
            t.appendChild(tr2);
          });
          wrap.appendChild(t);
        }
        ctx.stage.appendChild(wrap);
      }
      draw();
    };
  }

  /* filterChapter — the idea behind filtering: pick exactly the right rows */
  function filterChapter(tasks) {
    return function (ctx) {
      var i = 0, score = 0;
      function draw() {
        ctx.hud([
          { label: 'Search', value: (i + 1) + ' / ' + tasks.length },
          { label: 'First-try', value: String(score), id: 'fS' }
        ]);
        var T = tasks[i];
        var rows = DB.planets;
        var cols = Object.keys(rows[0]);
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'sql-wrap');
        wrap.appendChild(askMsg(T.goal));
        var picked = {};
        var t = el('table', 'sql-table is-clicky');
        var tr = el('tr');
        cols.forEach(function (c) { tr.appendChild(txt('th', '', c)); });
        t.appendChild(tr);
        rows.forEach(function (r) {
          var tr2 = el('tr', 'sql-tr-btn');
          cols.forEach(function (c) { tr2.appendChild(txt('td', '', String(r[c]))); });
          tr2.addEventListener('click', function () {
            if (picked[r.name]) { delete picked[r.name]; tr2.classList.remove('is-pick'); }
            else { picked[r.name] = true; tr2.classList.add('is-pick'); }
          });
          t.appendChild(tr2);
        });
        wrap.appendChild(t);
        var check = el('button', 'btn-blast oh-next', 'Check my selection');
        check.type = 'button';
        var out = el('div', 'sql-out');
        var tried = false;
        check.addEventListener('click', function () {
          out.innerHTML = '';
          var names = Object.keys(picked).sort().join(',');
          var want = T.expect.slice().sort().join(',');
          if (names === want) {
            if (!tried) score++;
            ctx.set('fS', String(score));
            check.style.display = 'none';
            out.appendChild(whyBox(T.why));
            var nb = el('button', 'btn-blast oh-next', (i + 1 < tasks.length) ? 'Next search' : 'Finish');
            nb.type = 'button';
            nb.addEventListener('click', function () {
              i++;
              if (i >= tasks.length) {
                var st = score >= tasks.length ? 3 : (score >= tasks.length - 1 ? 2 : 1);
                ctx.done(st, 'You filtered data like a search engine — that is what databases do all day.');
              } else draw();
            });
            out.appendChild(nb);
          } else {
            tried = true;
            var got = Object.keys(picked).length;
            out.appendChild(whyBox('Not quite — you selected ' + got + ' row(s), but the search needs exactly ' + T.expect.length + '. Read the goal again and adjust!'));
          }
        });
        wrap.appendChild(check);
        wrap.appendChild(out);
        ctx.stage.appendChild(wrap);
      }
      draw();
    };
  }

  /* keysChapter — follow ids between tables: two matching rounds */
  function keysChapter() {
    return function (ctx) {
      var mistakes = 0;

      function matchRound(intro, leftTitle, rightTitle, leftItems, rightItems, onRoundDone) {
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'sql-wrap');
        wrap.appendChild(askMsg(intro));
        var cols = el('div', 'jn-cols');
        var leftCol = el('div', 'jn-col');
        var rightCol = el('div', 'jn-col');
        leftCol.appendChild(txt('h4', '', leftTitle));
        rightCol.appendChild(txt('h4', '', rightTitle));
        var sel = null, matched = 0;
        leftItems.forEach(function (p) {
          var b = el('button', 'jn-card', '<b>' + p.label + '</b><span>' + p.sub + '</span>');
          b.type = 'button';
          b.addEventListener('click', function () {
            if (b.classList.contains('is-done')) return;
            if (sel) sel.classList.remove('is-sel');
            sel = b;
            b.classList.add('is-sel');
            b.dataset.key = String(p.key);
          });
          leftCol.appendChild(b);
        });
        rightItems.forEach(function (s) {
          var b = el('button', 'jn-card', '<b>' + s.label + '</b><span>' + s.sub + '</span>');
          b.type = 'button';
          b.addEventListener('click', function () {
            if (!sel || b.classList.contains('is-done')) return;
            if (String(s.id) === sel.dataset.key) {
              sel.classList.remove('is-sel');
              sel.classList.add('is-done');
              b.classList.add('is-done');
              sel = null;
              matched++;
              ctx.set('kP', matched + ' / ' + leftItems.length);
              if (matched === leftItems.length) setTimeout(onRoundDone, 500);
            } else {
              mistakes++;
              ctx.set('kM', String(mistakes));
              b.classList.add('is-no');
              setTimeout(function () { b.classList.remove('is-no'); }, 420);
            }
          });
          rightCol.appendChild(b);
        });
        cols.appendChild(leftCol);
        cols.appendChild(rightCol);
        wrap.appendChild(cols);
        ctx.stage.appendChild(wrap);
      }

      function hud(round) {
        ctx.hud([
          { label: 'Round', value: round + ' / 2' },
          { label: 'Pairs', value: '0 / 3', id: 'kP' },
          { label: 'Mistakes', value: String(mistakes), id: 'kM' }
        ]);
      }

      hud(1);
      matchRound(
        'Tables connect through KEYS. Each pilot has a ship_id that points at a ship\'s id. Match every pilot to their ship!',
        'pilots', 'ships',
        DB.pilots.map(function (p) { return { label: p.name, sub: 'ship_id: ' + p.ship_id, key: p.ship_id }; }),
        DB.ships.map(function (s) { return { label: s.name, sub: 'id: ' + s.id, id: s.id }; }),
        function () {
          hud(2);
          matchRound(
            'Round 2 — the missions table points at pilots the same way. Follow the pilot_id keys!',
            'missions', 'pilots',
            DB.missions.map(function (m) { return { label: m.name, sub: 'pilot_id: ' + m.pilot_id, key: m.pilot_id }; }),
            DB.pilots.map(function (p) { return { label: p.name, sub: 'id: ' + p.id, id: p.id }; }),
            function () {
              var st = mistakes === 0 ? 3 : (mistakes <= 2 ? 2 : 1);
              ctx.done(st, 'You followed keys across three different tables — that is exactly how databases connect data.');
            }
          );
        }
      );
    };
  }

  /* =================================================================
     ENGINE: apiQuest — mock server, request builder, status codes
     ================================================================= */
  function mockServer(method, path, body) {
    var astronauts = '[ {"id":1,"name":"Maya Star"},\n  {"id":2,"name":"Leo Comet"},\n  {"id":3,"name":"Zed Nova"} ]';
    var routes = {
      'GET /astronauts':    { code: 200, body: astronauts },
      'GET /astronauts/2':  { code: 200, body: '{"id":2,"name":"Leo Comet"}' },
      'GET /planets':       { code: 200, body: '["Vulcania","Ringara","Bluemar","Gasperon","Tinyx"]' },
      'DELETE /astronauts/3': { code: 200, body: '{"deleted":3,"message":"Zed Nova removed"}' }
    };
    if (method === 'POST' && path === '/astronauts') {
      if (body && body.indexOf('name') !== -1) return { code: 201, body: '{"id":4,"name":"Nova Kid","created":true}' };
      return { code: 400, body: '{"error":"Bad Request: body with a name is required"}' };
    }
    if (method === 'POST' && path === '/login') {
      if (body && body.indexOf('pass') !== -1) return { code: 200, body: '{"token":"gx-7f3a-crew","welcome":"Maya"}' };
      return { code: 400, body: '{"error":"Bad Request: user and pass required"}' };
    }
    var hit = routes[method + ' ' + path];
    if (hit) return hit;
    var known = ['/astronauts', '/astronauts/2', '/astronauts/3', '/planets', '/login'];
    if (known.indexOf(path) !== -1) return { code: 405, body: '{"error":"Method Not Allowed: ' + method + ' cannot be used on ' + path + '"}' };
    return { code: 404, body: '{"error":"Not Found: ' + path + ' does not exist"}' };
  }

  function requestChapter(missions) {
    return function (ctx) {
      var i = 0, score = 0;
      var METHODS = ['GET', 'POST', 'DELETE'];
      var PATHS = ['/astronauts', '/astronauts/2', '/astronauts/3', '/planets', '/login'];
      var BODIES = ['(no body)', '{"name":"Nova Kid"}', '{"user":"maya","pass":"****"}'];
      function draw() {
        ctx.hud([
          { label: 'Mission', value: (i + 1) + ' / ' + missions.length },
          { label: 'First-try', value: String(score), id: 'aS' }
        ]);
        var M = missions[i];
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'api-wrap');
        wrap.appendChild(askMsg('Mission Control: ' + M.brief));
        var mH = { value: null }, pH = { value: null }, bH = { value: null };
        wrap.appendChild(chipPick('METHOD', METHODS, mH));
        wrap.appendChild(chipPick('ENDPOINT', PATHS, pH));
        wrap.appendChild(chipPick('BODY', BODIES, bH));
        var send = el('button', 'btn-blast oh-next', 'SEND REQUEST');
        send.type = 'button';
        var out = el('div', 'api-out');
        var tried = false;
        send.addEventListener('click', function () {
          if (mH.value === null || pH.value === null || bH.value === null) { out.innerHTML = ''; out.appendChild(whyBox('Pick a method, an endpoint and a body first!')); return; }
          out.innerHTML = '';
          var flight = el('div', 'api-flight', '<span class="api-pkt">' + mH.value + ' ' + pH.value + '</span>');
          out.appendChild(flight);
          setTimeout(function () {
            var res = mockServer(mH.value, pH.value, bH.value === '(no body)' ? '' : bH.value);
            var ok = (mH.value === M.method && pH.value === M.path && (M.body ? bH.value === M.body : bH.value === '(no body)'));
            var panel = el('div', 'api-res ' + (res.code < 300 ? 'is-ok' : 'is-err'));
            panel.appendChild(el('div', 'api-status', '<b>' + res.code + '</b> ' + statusName(res.code)));
            var pre = el('pre');
            pre.textContent = res.body;
            panel.appendChild(pre);
            out.appendChild(panel);
            if (ok) {
              if (!tried) score++;
              ctx.set('aS', String(score));
              out.appendChild(whyBox(M.why));
              var nb = el('button', 'btn-blast oh-next', (i + 1 < missions.length) ? 'Next mission' : 'Finish');
              nb.type = 'button';
              nb.addEventListener('click', function () {
                i++;
                if (i >= missions.length) {
                  var st = score >= missions.length ? 3 : (score >= missions.length - 1 ? 2 : 1);
                  ctx.done(st, 'You spoke to a server ' + missions.length + ' times, like a real engineer.');
                } else draw();
              });
              out.appendChild(nb);
            } else {
              tried = true;
              out.appendChild(whyBox(res.code >= 400
                ? 'The server rejected it — read the error, adjust the request and SEND again.'
                : 'The server answered, but that is not what Mission Control asked for. Read the mission again!'));
            }
          }, 650);
        });
        wrap.appendChild(send);
        wrap.appendChild(out);
        ctx.stage.appendChild(wrap);
      }
      draw();
    };
  }
  function statusName(c) {
    return { 200: 'OK', 201: 'Created', 400: 'Bad Request', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 500: 'Server Error' }[c] || '';
  }

  function statusChapter(rounds) {
    return function (ctx) {
      var i = 0, score = 0, left = 3;
      function draw() {
        ctx.hud([
          { label: 'Signal', value: (i + 1) + ' / ' + rounds.length },
          { label: 'Decoded', value: String(score), id: 'stS' },
          { label: 'Lives', value: hearts(left, 3), id: 'stL' }
        ]);
        var R = rounds[i];
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'oh-wrap');
        wrap.appendChild(askMsg('Incoming signal: "' + R.story + '" — which status code is this?'));
        var codes = [200, 201, 400, 403, 404, 500];
        var done = false;
        wrap.appendChild(choiceRow(codes.map(function (c) { return c + ' ' + statusName(c); }), 'st-choices', function (ai, b, row) {
          if (done) return;
          done = true;
          var right = codes[ai] === R.code;
          b.classList.add(right ? 'is-right' : 'is-wrong');
          if (right) { score++; ctx.set('stS', String(score)); }
          else {
            row.children[codes.indexOf(R.code)].classList.add('is-right');
            left--;
            ctx.set('stL', hearts(left, 3));
            if (left <= 0) { setTimeout(function () { ctx.fail('You decoded ' + score + ' of ' + rounds.length + ' signals.'); }, 1200); return; }
          }
          wrap.appendChild(whyBox(R.why));
          var nb = el('button', 'btn-blast oh-next', (i + 1 < rounds.length) ? 'Next signal' : 'Finish');
          nb.type = 'button';
          nb.addEventListener('click', function () {
            i++;
            if (i >= rounds.length) {
              var st = score >= rounds.length ? 3 : (score >= rounds.length - 2 ? 2 : 1);
              ctx.done(st, score + ' of ' + rounds.length + ' status codes decoded.');
            } else draw();
          });
          wrap.appendChild(nb);
        }));
        ctx.stage.appendChild(wrap);
      }
      draw();
    };
  }

  function chainChapter(scenarios) {
    return function (ctx) {
      var i = 0, totalMistakes = 0;
      function draw() {
        ctx.hud([
          { label: 'Flow', value: (i + 1) + ' / ' + scenarios.length },
          { label: 'Wrong taps', value: String(totalMistakes), id: 'chM' }
        ]);
        var S = scenarios[i];
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'oh-wrap');
        wrap.appendChild(askMsg(S.story + ' — tap the steps in the order they really happen:'));
        orderPuzzle(wrap, S.steps, function (mistakes) {
          totalMistakes += mistakes;
          ctx.set('chM', String(totalMistakes));
          wrap.appendChild(whyBox(S.why));
          var nb = el('button', 'btn-blast oh-next', (i + 1 < scenarios.length) ? 'Next flow' : 'Finish');
          nb.type = 'button';
          nb.addEventListener('click', function () {
            i++;
            if (i >= scenarios.length) {
              var st = totalMistakes === 0 ? 3 : (totalMistakes <= 3 ? 2 : 1);
              ctx.done(st, 'You traced ' + scenarios.length + ' request journeys through the whole system.');
            } else draw();
          });
          wrap.appendChild(nb);
        });
        ctx.stage.appendChild(wrap);
      }
      draw();
    };
  }

  /* =================================================================
     ENGINE: echoQuest — Simon-style pattern memory with a target
     ================================================================= */
  function echoQuest(target3, target2, target1) {
    return function (ctx) {
      var COLORS = [
        ['#4c6fff', '#6a8bff'], ['#ff5fa2', '#ff9ec7'], ['#22c55e', '#4ade80'], ['#ffb020', '#ffd24a']
      ];
      var seq = [], at = 0, best = 0, playing = false;
      ctx.hud([
        { label: 'Round', value: '1', id: 'peR' },
        { label: 'Goal', value: String(target1) + '+' },
        { label: 'Best', value: '0', id: 'peB' }
      ]);
      ctx.stage.innerHTML = '';
      var wrap = el('div', 'pe-wrap');
      var status = askMsg('Watch the pattern, then tap it back!');
      wrap.appendChild(status);
      var ring = el('div', 'pe-ring');
      var btns = [];
      COLORS.forEach(function (col, ci) {
        var b = el('button', 'pe-planet');
        b.type = 'button';
        b.style.background = 'radial-gradient(circle at 32% 28%, rgba(255,255,255,.55), transparent 55%), linear-gradient(135deg,' + col[0] + ',' + col[1] + ')';
        b.addEventListener('click', function () { tap(ci); });
        btns.push(b);
        ring.appendChild(b);
      });
      wrap.appendChild(ring);
      var startBtn = el('button', 'btn-blast oh-next', 'Start');
      startBtn.type = 'button';
      startBtn.addEventListener('click', function () { startBtn.style.display = 'none'; nextRound(); });
      wrap.appendChild(startBtn);
      ctx.stage.appendChild(wrap);

      function flash(ci, dur) {
        btns[ci].classList.add('is-lit');
        setTimeout(function () { btns[ci].classList.remove('is-lit'); }, dur || 330);
      }
      function playback() {
        playing = true;
        status.textContent = 'Watch closely...';
        var k = 0;
        var iv = setInterval(function () {
          flash(seq[k]);
          k++;
          if (k >= seq.length) {
            clearInterval(iv);
            setTimeout(function () { playing = false; at = 0; status.textContent = 'Your turn!'; }, 380);
          }
        }, 500);
      }
      function nextRound() {
        seq.push(Math.floor(Math.random() * 4));
        hudSet('peR', String(seq.length));
        setTimeout(playback, 450);
      }
      function finish() {
        var st = best >= target3 ? 3 : (best >= target2 ? 2 : (best >= target1 ? 1 : 0));
        if (st > 0) ctx.done(st, 'You remembered a pattern of ' + best + ' steps!');
        else ctx.fail('You reached ' + best + ' steps — reach ' + target1 + ' to pass. You can do it!');
      }
      function tap(ci) {
        if (playing || !seq.length) return;
        flash(ci, 210);
        if (ci !== seq[at]) {
          playing = true;
          status.textContent = 'The pattern broke at step ' + (at + 1) + '!';
          setTimeout(finish, 900);
          return;
        }
        at++;
        if (at >= seq.length) {
          best = seq.length;
          hudSet('peB', String(best));
          status.textContent = 'Correct! A longer one is coming...';
          setTimeout(nextRound, 650);
        }
      }
    };
  }

  /* =================================================================
     GAME CONTENT — stories + chapters for every world
     ================================================================= */

  var PREDICT = [
    { kind: 'predict', code: 'print(3 + 4)', answers: ['7', '34', '3 + 4'], correct: 0, why: 'Python does the maths first, then prints the result: 7.' },
    { kind: 'predict', code: 'name = "Ada"\nprint("Hi " + name)', answers: ['Hi name', 'Hi Ada', 'HiAda'], correct: 1, why: 'The variable name holds "Ada", and + glues the texts together.' },
    { kind: 'predict', code: 'print("ha" * 3)', answers: ['ha3', 'hahaha', 'ha ha ha'], correct: 1, why: 'Multiplying text repeats it: "ha" three times.' },
    { kind: 'predict', code: 'x = 5\nif x > 3:\n    print("big")\nelse:\n    print("small")', answers: ['big', 'small', 'x'], correct: 0, why: '5 is bigger than 3, so Python takes the first path.' },
    { kind: 'predict', code: 'for i in range(3):\n    print(i)', answers: ['1 2 3', '0 1 2', '3'], correct: 1, why: 'range(3) counts 0, 1, 2 — computers start at zero!' },
    { kind: 'predict', code: 'fruits = ["apple", "plum"]\nprint(len(fruits))', answers: ['2', 'apple plum', 'len'], correct: 0, why: 'len() counts the items in the list.' },
    { kind: 'predict', code: 'x = 10\nx = x + 2\nprint(x)', answers: ['10', '102', '12'], correct: 2, why: 'x becomes 10 + 2 = 12 — the box gets a new value.' },
    { kind: 'predict', code: 'print(10 // 3)', answers: ['3.33', '3', '1'], correct: 1, why: '// is whole-number division: 3 fits into 10 three times.' }
  ];
  var PREDICT_HARD = [
    { kind: 'predict', code: 'x = [10, 20, 30]\nprint(x[1])', answers: ['10', '20', '1'], correct: 1, why: 'Indexes start at 0 — so x[1] is the SECOND item.' },
    { kind: 'predict', code: 's = "galaxy"\nprint(s[0:3])', answers: ['gal', 'gala', 'axy'], correct: 0, why: 'Slicing [0:3] takes letters 0, 1, 2 — the end is not included.' },
    { kind: 'predict', code: 'n = 5\nwhile n > 2:\n    n = n - 1\nprint(n)', answers: ['5', '2', '3'], correct: 1, why: 'The loop keeps subtracting until n is 2 — then n > 2 is false.' },
    { kind: 'predict', code: 'a, b = 1, 2\na, b = b, a\nprint(a)', answers: ['1', '2', 'b'], correct: 1, why: 'Python can swap two boxes in one line — a became 2.' }
  ];
  var BLANKS = [
    { kind: 'blank', goal: 'Print the numbers 0, 1 and 2', code: 'for i in ___(3):\n    print(i)', answers: ['range', 'len', 'list', 'loop'], correct: 0, why: 'range(3) makes the sequence 0, 1, 2 for the loop.' },
    { kind: 'blank', goal: 'Check if the answer equals 42', code: 'if answer ___ 42:\n    print("Correct!")', answers: ['==', '=', '!=', '>'], correct: 0, why: 'One = stores a value. Two == ASK if values are equal.' },
    { kind: 'blank', goal: 'Add a score to the list', code: 'scores = []\nscores.___(100)', answers: ['append', 'add', 'push', 'insert'], correct: 0, why: 'Python lists grow with .append().' },
    { kind: 'blank', goal: 'Create a function', code: '___ greet():\n    print("Hi!")', answers: ['def', 'func', 'function', 'make'], correct: 0, why: 'def is how Python defines a function.' },
    { kind: 'blank', goal: 'Send the doubled value back', code: 'def double(n):\n    ___ n * 2', answers: ['return', 'print', 'give', 'back'], correct: 0, why: 'return hands the value back to whoever called the function.' },
    { kind: 'blank', goal: 'Count the letters in the name', code: 'name = "Robo"\nprint(___(name))', answers: ['len', 'count', 'size', 'length'], correct: 0, why: 'len() works on text too — it counts the letters.' },
    { kind: 'blank', goal: 'Loop over every fruit in the list', code: 'for fruit ___ fruits:\n    print(fruit)', answers: ['in', 'of', 'from', 'at'], correct: 0, why: 'for ... in ... walks through each item of a list.' }
  ];
  var ORDERS = [
    { kind: 'order', goal: 'Build the greeting program', lines: ['name = "Ada"', 'greeting = "Hi " + name', 'print(greeting)'] },
    { kind: 'order', goal: 'Make the program print 10', lines: ['total = 0', 'total = total + 5', 'total = total * 2', 'print(total)'] },
    { kind: 'order', goal: 'Define the cheer, then use it', lines: ['def cheer(name):', '    print("Go " + name + "!")', 'cheer("Mia")'] },
    { kind: 'order', goal: 'Build a list, then read from it', lines: ['fruits = []', 'fruits.append("apple")', 'print(fruits[0])'] },
    { kind: 'order', goal: 'Compare the guess with the secret', lines: ['guess = 7', 'secret = guess + 1', 'if guess < secret:', '    print("So close!")'] }
  ];

  var DEBUG_C1 = [
    { goal: 'say hello to the robot', lines: ['robot_name = "Zip"', 'print(robot_nam)'], bug: 1,
      fixes: ['print(robot_name)', 'print("robot_nam")', 'robot_name = robot_nam'], fix: 0,
      why: 'Computers need the EXACT spelling: robot_name.' },
    { goal: 'celebrate a perfect score', lines: ['score = 10', 'if score = 10:', '    print("You win!")'], bug: 1,
      fixes: ['if score == 10:', 'if score === 10:', 'score == 10'], fix: 0,
      why: 'One = stores a value; two == compare values.' },
    { goal: 'count to three', lines: ['for i in range(3):', 'print(i)'], bug: 1,
      fixes: ['    print(i)', 'print(  i )', 'print(i):'], fix: 0,
      why: 'Indentation (the spaces) tells Python what is inside the loop.' },
    { goal: 'print the LAST fruit', lines: ['fruits = ["apple", "plum", "kiwi"]', 'print(fruits[3])'], bug: 1,
      fixes: ['print(fruits[2])', 'print(fruits[4])', 'print(fruits.last)'], fix: 0,
      why: 'Lists count from 0 — three items means indexes 0, 1 and 2.' }
  ];
  var DEBUG_C2 = [
    { goal: 'print 1 to 5', lines: ['for i in range(1, 5):', '    print(i)'], bug: 0,
      fixes: ['for i in range(1, 6):', 'for i in range(0, 5):', 'for i in range(1, 4):'], fix: 0,
      why: 'range stops one BEFORE the end number, so you need 6 to reach 5.' },
    { goal: 'count 1, 2, 3, 4 and stop', lines: ['x = 1', 'while x < 5:', '    print(x)', 'x = x + 1'], bug: 3,
      fixes: ['    x = x + 1', 'x = x - 1', 'while x > 5:'], fix: 0,
      why: 'Without the indent, x never grows inside the loop — it runs forever!' },
    { goal: 'double the age the user types', lines: ['age = input("Age? ")', 'print(age * 2)'], bug: 0,
      fixes: ['age = int(input("Age? "))', 'age = input(int("Age? "))', 'age = "int" + input()'], fix: 0,
      why: 'input() gives TEXT: "12" * 2 is "1212". int() turns it into a number.' },
    { goal: 'warn when fuel is LOW (under 10)', lines: ['fuel = 5', 'if fuel > 10:', '    print("Low fuel!")'], bug: 1,
      fixes: ['if fuel < 10:', 'if fuel == 10:', 'if fuel >= 10:'], fix: 0,
      why: 'Low fuel means LESS than 10 — the comparison pointed the wrong way.' }
  ];
  var DEBUG_C3 = [
    { goal: 'add up all the numbers (2+4+6 = 12)', lines: ['numbers = [2, 4, 6]', 'total = 0', 'for n in numbers:', '    total = n', 'print(total)'], bug: 3,
      fixes: ['    total = total + n', '    total = n + 1', '    n = total'], fix: 0,
      why: 'total = n REPLACES the total each time. You must ADD to it.' },
    { goal: 'use the doubled value in maths', lines: ['def double(n):', '    print(n * 2)', 'result = double(5)', 'print(result + 1)'], bug: 1,
      fixes: ['    return n * 2', '    return print(n)', '    n = n * 2'], fix: 0,
      why: 'print shows a value but returns nothing — result was None and crashed.' },
    { goal: 'compute the average of 3 and 4 (3.5)', lines: ['a = 3', 'b = 4', 'avg = (a + b) // 2', 'print(avg)'], bug: 2,
      fixes: ['avg = (a + b) / 2', 'avg = a + b / 2', 'avg = (a + b) % 2'], fix: 0,
      why: '// throws away the decimal part. Plain / keeps the .5.' },
    { goal: 'greet all three crew members', lines: ['for name in crew:', '    print("Hi " + name)', 'crew = ["Maya", "Leo", "Zed"]'], bug: 2,
      fixes: ['Move the crew = [...] line to the TOP', 'Delete the crew line', 'Indent the crew line'], fix: 0,
      why: 'Python reads top to bottom — crew must exist BEFORE the loop uses it.' }
  ];

  var CARGO = [
    { kind: 'predict', code: 'STACK (last in, first out)\npush A\npush B\npush C\npop  -> ?', answers: ['A', 'B', 'C'], correct: 2, why: 'A stack is a pile: the LAST crate on top comes off first.' },
    { kind: 'predict', code: 'STACK\npush A\npush B\npop  -> ?\npush C\npop  -> ?', answers: ['B then C', 'A then B', 'B then A'], correct: 0, why: 'Pop takes the top: first B, then C sits on A so C comes next.' },
    { kind: 'predict', code: 'QUEUE (first in, first out)\nenqueue A\nenqueue B\nenqueue C\ndequeue -> ?', answers: ['C', 'B', 'A'], correct: 2, why: 'A queue is a line: whoever arrived FIRST leaves first.' },
    { kind: 'predict', code: 'QUEUE\nenqueue A\ndequeue -> ?\nenqueue B\nenqueue C\ndequeue -> ?', answers: ['A then B', 'A then C', 'C then B'], correct: 0, why: 'First out is A. Then B is at the front of the line.' },
    { kind: 'predict', code: 'STACK of plates\npush red\npush blue\npush gold\npop\npop -> ?', answers: ['red', 'blue', 'gold'], correct: 1, why: 'gold comes off first, then blue is on top.' },
    { kind: 'predict', code: 'Undo button = which one?', answers: ['a STACK', 'a QUEUE', 'a LIST'], correct: 0, why: 'Undo takes back the LAST thing you did — last in, first out = stack!' }
  ];

  var WEB_HTML = [
    { need: 'The café needs a big page title at the top.', options: ['<h1>Space Café</h1>', '<p>Space Café</p>', '<button>Space Café</button>'], correct: 0,
      html: '<h1 class="wq-h1">Space Café</h1>', why: 'h1 is THE heading tag — one big title per page.' },
    { need: 'Show a photo of today\'s special: nebula soup.', options: ['<img src="nebula-soup.png" alt="Nebula soup">', '<a>nebula-soup.png</a>', '<photo>nebula-soup.png</photo>'], correct: 0,
      html: '<span class="wq-img">[ nebula soup photo ]</span>', why: 'img shows pictures — and alt describes them for everyone.' },
    { need: 'A menu list with three dishes.', options: ['<ul><li>Star soup</li><li>Moon pie</li><li>Comet cola</li></ul>', '<p>Star soup, Moon pie, Comet cola</p>', '<menu-list>Star soup...</menu-list>'], correct: 0,
      html: '<ul class="wq-ul"><li>Star soup</li><li>Moon pie</li><li>Comet cola</li></ul>', why: 'ul + li make a real list the browser understands.' },
    { need: 'A link to the recipes page.', options: ['<a href="recipes.html">Our recipes</a>', '<link>Our recipes</link>', '<url to="recipes">Our recipes</url>'], correct: 0,
      html: '<span class="wq-a">Our recipes</span>', why: 'a with href is the tag that takes you places.' },
    { need: 'A button so visitors can order.', options: ['<button>Order now</button>', '<click>Order now</click>', '<input type="order">'], correct: 0,
      html: '<button class="wq-btn" type="button">Order now</button>', why: 'button is a real, clickable control.' },
    { need: 'A footer with the opening hours.', options: ['<footer>Open 09:00 - 22:00</footer>', '<bottom>Open 09:00 - 22:00</bottom>', '<end>Open 09:00 - 22:00</end>'], correct: 0,
      html: '<div class="wq-footer">Open 09:00 - 22:00</div>', why: 'footer is the semantic tag for the bottom of a page.' }
  ];
  var WEB_CSS = [
    { need: 'Make the title cosmic purple.', options: ['h1 { color: purple; }', 'h1 { background: purple; }', 'title { color: purple; }'], correct: 0,
      css: [['.wq-h1', 'color', '#9a6bff']], why: 'color paints the TEXT. background paints behind it.' },
    { need: 'Center the title.', options: ['h1 { text-align: center; }', 'h1 { align: middle; }', 'h1 { position: center; }'], correct: 0,
      css: [['.wq-h1', 'textAlign', 'center']], why: 'text-align: center is the real CSS property.' },
    { need: 'Round the photo\'s corners.', options: ['.photo { border-radius: 14px; }', '.photo { corner: round; }', '.photo { radius: 14px; }'], correct: 0,
      css: [['.wq-img', 'borderRadius', '14px']], why: 'border-radius rounds corners — the bigger the value, the rounder.' },
    { need: 'Give every menu dish some breathing room.', options: ['li { padding: 8px; }', 'li { spacing: 8px; }', 'li { room: 8px; }'], correct: 0,
      css: [['.wq-ul li', 'padding', '6px 10px']], why: 'padding is space INSIDE an element\'s box.' },
    { need: 'Make the order button green with white text.', options: ['button { background: green; color: white; }', 'button { color: green-white; }', 'button { paint: green; }'], correct: 0,
      css: [['.wq-btn', 'background', '#22c55e'], ['.wq-btn', 'color', '#fff']], why: 'background + color together restyle the whole button.' },
    { need: 'Lay the menu out with flexbox.', options: ['ul { display: flex; gap: 10px; }', 'ul { display: row; }', 'ul { flex: on; }'], correct: 0,
      css: [['.wq-ul', 'display', 'flex'], ['.wq-ul', 'gap', '10px'], ['.wq-ul', 'listStyle', 'none'], ['.wq-ul', 'padding', '0']], why: 'display: flex lines children up in a row — the pro layout tool.' }
  ];
  function webJsSteps() {
    return [
      { need: 'When "Order now" is clicked, the order counter should go up.',
        options: ['button.addEventListener("click", addOrder)', 'button.whenClicked = addOrder', 'onclick(button): addOrder'], correct: 0,
        js: function (page) {
          var btn = page.querySelector('.wq-btn');
          if (!btn) return;
          var badge = el('div', 'wq-count', 'Orders: <b>0</b>');
          page.appendChild(badge);
          var n = 0;
          btn.addEventListener('click', function () { n++; badge.innerHTML = 'Orders: <b>' + n + '</b>'; });
        },
        why: 'addEventListener connects an event (click) to a function. Try clicking the button in the preview!' },
      { need: 'Greet the visitor by name under the title.',
        options: ['greet.textContent = "Welcome, " + name', 'greet.write("Welcome")', 'text(greet) = name'], correct: 0,
        js: function (page) { page.insertAdjacentHTML('beforeend', '<div class="wq-greet">Welcome, Captain Maya!</div>'); },
        why: 'textContent changes what an element says — safely.' },
      { need: 'Add a night-mode switch for late-night snackers.',
        options: ['body.classList.toggle("night")', 'body.mode = "night"', 'night(body) = true'], correct: 0,
        js: function (page) {
          var sw = el('button', 'wq-night', 'Night mode');
          sw.type = 'button';
          sw.addEventListener('click', function () { page.classList.toggle('wq-dark'); });
          page.appendChild(sw);
        },
        why: 'classList.toggle flips a CSS class on and off — the classic dark-mode trick. Flip the switch in the preview!' },
      { need: 'Only allow rocket-fuel orders for kids 8 and up.',
        options: ['if (age >= 8) { allowOrder(); }', 'if age is 8+ then allow', 'when (age > "8") allow()'], correct: 0,
        js: function (page) { page.insertAdjacentHTML('beforeend', '<div class="wq-note">Rocket fuel: crew 8+ only</div>'); },
        why: 'An if with a comparison guards the action — logic in the browser!' },
      { need: 'Remember the order count even after a refresh.',
        options: ['localStorage.setItem("orders", count)', 'browser.remember(count)', 'save count forever'], correct: 0,
        js: function (page) { page.insertAdjacentHTML('beforeend', '<div class="wq-note">Orders now saved to localStorage</div>'); },
        why: 'localStorage keeps small data in the browser between visits — just like this arcade saves your stars!' }
    ];
  }

  var GIT_C1 = [
    { scenario: 'You created menu.txt and want Git to start tracking it.', options: ['git add menu.txt', 'git commit', 'git push', 'git branch menu'], correct: 0,
      output: 'menu.txt staged for the next snapshot', why: 'git add puts changes in the staging area — the launch pad for a commit.' },
    { scenario: 'Save a snapshot of the staged changes with a message.', options: ['git commit -m "Add menu"', 'git snapshot', 'git add -m "menu"', 'git save menu.txt'], correct: 0,
      output: '[main a1b2c3] Add menu — 1 file changed', why: 'git commit -m saves a named snapshot in history.' },
    { scenario: 'Check which files you changed since the last snapshot.', options: ['git status', 'git look', 'git files', 'git changed'], correct: 0,
      output: 'modified: menu.txt', why: 'git status is your dashboard — use it all the time.' },
    { scenario: 'Send your commits up to GitHub.', options: ['git push', 'git send', 'git upload', 'git commit --github'], correct: 0,
      output: 'To github.com/you/space-cafe: main -> main', why: 'git push uploads your local commits to the shared repo.' },
    { scenario: 'Get the commits your teammate pushed while you slept.', options: ['git pull', 'git push', 'git grab', 'git refresh'], correct: 0,
      output: 'Updating a1b2c3..d4e5f6 — 2 files changed', why: 'git pull downloads and merges the newest work.' },
    { scenario: 'Copy a GitHub project to your computer for the first time.', options: ['git clone https://github.com/nasa/app', 'git copy', 'git pull https://...', 'git download'], correct: 0,
      output: 'Cloning into app... done.', why: 'git clone makes your own full copy, history included.' },
    { scenario: 'Look through the history of snapshots.', options: ['git log', 'git history', 'git list', 'git timeline'], correct: 0,
      output: 'a1b2c3 Add menu\n9f8e7d First commit', why: 'git log shows every commit — who, when and why.' }
  ];
  var GIT_C2 = [
    { kind: 'predict', code: 'main:     A --- B --- C\n                \\\nrocket:           D --- E\n\nWhich commits does the rocket branch contain?', answers: ['A, B, D, E', 'D, E only', 'A, B, C, D, E'], correct: 0, why: 'A branch carries its history: everything up to B, plus its own D and E.' },
    { kind: 'predict', code: 'main:     A --- B --- C\nrocket:         \\ D --- E\n\nYou run: git merge rocket (while on main).\nWhat does main contain now?', answers: ['A B C D E (+ merge)', 'only D and E', 'A B C only'], correct: 0, why: 'Merging brings the branch commits INTO main — nothing is lost.' },
    { kind: 'order', goal: 'Create a rocket branch and save work on it', lines: ['git branch rocket', 'git switch rocket', 'git add rocket.txt', 'git commit -m "Add rocket"'] },
    { kind: 'order', goal: 'Share your finished work with the team', lines: ['git add .', 'git commit -m "Finish feature"', 'git push'] },
    { kind: 'predict', code: 'You and Maya both changed LINE 3 of ship.txt\non different branches, and you merge.\nWhat happens?', answers: ['A merge conflict — you decide', 'Git picks randomly', 'The computer explodes'], correct: 0, why: 'When both sides change the same line, Git asks a human to choose. That is a conflict — and you can fix it!' }
  ];
  var GIT_C3 = [
    { goal: 'The crew wants BOTH upgrades: keep the shields line AND the lasers line.',
      file: 'engines: ion\n<<<<<<< HEAD\nshields: maximum\n=======\nlasers: double\n>>>>>>> laser-upgrade',
      options: ['engines: ion\nshields: maximum\nlasers: double', 'engines: ion\n<<<<<<< HEAD\nshields: maximum\nlasers: double', 'engines: ion\nlasers: double'], correct: 0,
      why: 'Keep both lines and DELETE every conflict marker — the file must end up clean.' },
    { goal: 'The team agreed this morning: the café opens at 09:00 (not 08:00).',
      file: 'name: Space Café\n<<<<<<< HEAD\nopens: 08:00\n=======\nopens: 09:00\n>>>>>>> new-hours',
      options: ['name: Space Café\nopens: 09:00', 'name: Space Café\nopens: 08:00\nopens: 09:00', 'name: Space Café\n=======\nopens: 09:00'], correct: 0,
      why: 'Pick the version the team agreed on, keep ONE opens line, and remove the markers.' },
    { goal: 'Keep the English greeting FIRST, then the space greeting under it.',
      file: '<<<<<<< HEAD\nhello: Welcome!\n=======\nhello: Zorp-zorp, traveller!\n>>>>>>> space-talk\nbye: Safe travels',
      options: ['hello: Welcome!\nhello: Zorp-zorp, traveller!\nbye: Safe travels', 'hello: Zorp-zorp, traveller!\nhello: Welcome!\nbye: Safe travels', 'hello: Welcome!\nbye: Safe travels'], correct: 0,
      why: 'Resolving a conflict can mean COMBINING both sides in the order the team wants.' }
  ];

  var TBL_ROUNDS = [
    { kind: 'row', q: 'Every ROW is one planet\'s record. Click the row of the planet with 8 moons!', match: 'Gasperon',
      why: 'One row = one thing. Gasperon\'s whole record lives in that single row.' },
    { kind: 'col', q: 'Every COLUMN is one kind of fact. Click the column header that stores SIZE!', match: 'size',
      why: 'A column holds the same fact for every row — that is what keeps tables tidy.' },
    { kind: 'mcq', q: 'How many planets does this table remember?', answers: ['4', '5', '8'], correct: 1,
      why: 'Count the rows: 5 rows = 5 planets. (8 was Gasperon\'s moons!)' },
    { kind: 'row', q: 'Click the row of the planet that has NO moons at all.', match: 'Tinyx',
      why: 'Tinyx\'s moons cell says 0 — you just looked up a record, like every app does.' },
    { kind: 'mcq', q: 'A NEW planet is discovered. What do we add to the table?', answers: ['A new row', 'A new column', 'A new table'], correct: 0,
      why: 'A new THING is a new row. A new FACT about all things would be a new column.' },
    { kind: 'col', q: 'Click the column that answers: "does this planet have rings?"', match: 'rings',
      why: 'Columns are the questions a table can answer about every row.' }
  ];
  var FILTERS = [
    { goal: 'The scanner needs every planet WITH rings. Click those rows, then press Check!', expect: ['Ringara', 'Gasperon'],
      why: 'You filtered the table: only the rows where rings = yes. Apps do this millions of times a day.' },
    { goal: 'Now select every planet with MORE than one moon.', expect: ['Vulcania', 'Ringara', 'Gasperon'],
      why: 'Filtering by number: moons greater than 1. Three planets pass the test.' },
    { goal: 'Select only the SMALL planets.', expect: ['Vulcania', 'Tinyx'],
      why: 'Same trick, different column: size = small.' },
    { goal: 'Two rules at once: planets WITH rings AND more than 5 moons.', expect: ['Gasperon'],
      why: 'Both rules must be true — only Gasperon has rings AND 8 moons. That is an AND filter.' },
    { goal: 'Final search: planets with NO rings and FEWER than 2 moons.', expect: ['Bluemar', 'Tinyx'],
      why: 'You combined two rules again. Search engines, shops, games — everything filters like this.' }
  ];

  var API_MISSIONS = [
    { brief: 'Get the list of ALL astronauts.', method: 'GET', path: '/astronauts', body: null,
      why: 'GET asks a server for data. The JSON list came straight back — that is an API!' },
    { brief: 'Fetch ONLY astronaut number 2.', method: 'GET', path: '/astronauts/2', body: null,
      why: 'Putting the id in the path targets ONE resource: /astronauts/2.' },
    { brief: 'Check which planets we can visit.', method: 'GET', path: '/planets', body: null,
      why: 'Different endpoints serve different data — one server, many doors.' },
    { brief: 'Add a brand-new astronaut called Nova Kid.', method: 'POST', path: '/astronauts', body: '{"name":"Nova Kid"}',
      why: 'POST CREATES things — and the data travels in the request body. See the 201 Created?' },
    { brief: 'Astronaut number 3 is retiring — remove them.', method: 'DELETE', path: '/astronauts/3', body: null,
      why: 'DELETE removes a resource. GET, POST, DELETE — you now speak HTTP!' },
    { brief: 'Log in to Mission Control with the crew password.', method: 'POST', path: '/login', body: '{"user":"maya","pass":"****"}',
      why: 'Logins are POSTs with a body — and the server answers with a token, your digital keycard.' }
  ];
  var API_STATUS = [
    { story: 'The feed loaded perfectly.', code: 200, why: '200 OK — everything worked.' },
    { story: 'A new astronaut was saved to the database.', code: 201, why: '201 Created — something NEW now exists on the server.' },
    { story: 'You asked for /astronauts/99 but nobody has that id.', code: 404, why: '404 Not Found — that address or thing does not exist.' },
    { story: 'You sent a create request but forgot the name in the body.', code: 400, why: '400 Bad Request — the CLIENT sent something wrong or incomplete.' },
    { story: 'A cadet tried to open the captain\'s secret logs.', code: 403, why: '403 Forbidden — the server understood, but you are not allowed.' },
    { story: 'The server itself crashed while answering.', code: 500, why: '500 Server Error — not your fault: the SERVER broke.' },
    { story: 'Login succeeded and a token came back.', code: 200, why: '200 OK — a successful login is still a normal OK response.' }
  ];
  var API_CHAINS = [
    { story: 'Maya taps SAVE SCORE in the game',
      steps: ['The app builds a POST /scores request', 'The request travels to the server', 'The server checks the data and saves it to the database', 'The server answers 201 Created', 'The app shows a green checkmark'],
      why: 'Every save you have ever made in any app took this exact trip.' },
    { story: 'Leo opens the photo feed',
      steps: ['The app sends GET /feed', 'The server asks the database for the newest posts', 'The database returns the rows', 'The server sends them back as JSON', 'The app draws the posts on screen'],
      why: 'Read requests flow app -> server -> database and all the way back.' },
    { story: 'Zed logs in',
      steps: ['The app sends POST /login with the password', 'The server hashes the password and compares it', 'The server creates a token', 'The response 200 carries the token back', 'The app stores the token for next time'],
      why: 'Passwords are never stored as plain text — hashes are compared instead.' },
    { story: 'The team ships a new version of the app',
      steps: ['Run the tests', 'Commit the code', 'Push to GitHub', 'Deploy to the cloud', 'Watch the logs for errors'],
      why: 'That is a real deployment pipeline — exactly how pro teams ship.' }
  ];

  /* ---- Scratch logic (Stage 1: events, loops, IF/ELSE, variables) ---- */
  var SCRATCH_LOGIC = [
    { kind: 'predict', q: 'Robo IS touching a rock. What happens?', answers: ['Robo turns around', 'Robo moves 10 steps', 'Nothing happens'], correct: 0,
      blocks: [{ c: 'event', t: 'when green flag clicked' }, { c: 'control', t: 'if < touching rock ? > then' }, { c: 'motion', t: 'turn 180 degrees', in: 1 }, { c: 'control', t: 'else' }, { c: 'motion', t: 'move 10 steps', in: 1 }, { c: 'control', t: 'end' }],
      why: 'The condition is TRUE, so the IF branch runs and the ELSE is skipped.' },
    { kind: 'predict', q: 'Robo is NOT touching a rock this time. What happens?', answers: ['Robo moves 10 steps', 'Robo turns around', 'Both things happen'], correct: 0,
      blocks: [{ c: 'event', t: 'when green flag clicked' }, { c: 'control', t: 'if < touching rock ? > then' }, { c: 'motion', t: 'turn 180 degrees', in: 1 }, { c: 'control', t: 'else' }, { c: 'motion', t: 'move 10 steps', in: 1 }, { c: 'control', t: 'end' }],
      why: 'FALSE condition = the ELSE branch runs. IF/ELSE always picks exactly ONE path.' },
    { kind: 'predict', q: 'What is score when this script finishes?', answers: ['8', '5', '3'], correct: 0,
      blocks: [{ c: 'event', t: 'when green flag clicked' }, { c: 'variables', t: 'set score to 0' }, { c: 'variables', t: 'change score by 5' }, { c: 'variables', t: 'change score by 3' }],
      why: 'A variable is a box: 0, then +5, then +3 makes 8.' },
    { kind: 'predict', q: 'The score is 7. What does the sprite say?', answers: ['Keep going!', 'You win!', 'Nothing'], correct: 0,
      blocks: [{ c: 'control', t: 'if < score > 10 > then' }, { c: 'looks', t: 'say "You win!"', in: 1 }, { c: 'control', t: 'else' }, { c: 'looks', t: 'say "Keep going!"', in: 1 }, { c: 'control', t: 'end' }],
      why: '7 is not bigger than 10, so the condition is FALSE and the ELSE runs.' },
    { kind: 'predict', q: 'How far does the sprite travel in total?', answers: ['40 steps', '10 steps', '4 steps'], correct: 0,
      blocks: [{ c: 'control', t: 'repeat 4' }, { c: 'motion', t: 'move 10 steps', in: 1 }, { c: 'control', t: 'end' }],
      why: 'A loop repeats its inside: 4 times 10 = 40 steps.' },
    { kind: 'predict', q: 'The player clicks the green flag. Does the sprite jump?', answers: ['No — this script waits for SPACE', 'Yes, right away', 'It jumps twice'], correct: 0,
      blocks: [{ c: 'event', t: 'when SPACE key pressed' }, { c: 'motion', t: 'change y by 50' }],
      why: 'Event blocks decide WHEN a script starts. This one only listens for the space key.' },
    { kind: 'predict', q: 'The sprite touches BLUE. What happens?', answers: ['Nothing — the condition is false', 'The boing sound plays', 'The sprite turns blue'], correct: 0,
      blocks: [{ c: 'control', t: 'if < touching color RED ? > then' }, { c: 'sound', t: 'play sound boing', in: 1 }, { c: 'control', t: 'end' }],
      why: 'An IF with no ELSE simply does nothing when the answer is no.' },
    { kind: 'predict', q: 'What does this script do?', answers: ['Moves and bounces off edges forever', 'Moves once and stops', 'Bounces one time'], correct: 0,
      blocks: [{ c: 'control', t: 'forever' }, { c: 'motion', t: 'move 5 steps', in: 1 }, { c: 'control', t: 'if < touching edge ? > then', in: 1 }, { c: 'motion', t: 'bounce', in: 2 }, { c: 'control', t: 'end', in: 1 }, { c: 'control', t: 'end' }],
      why: 'A forever loop with an IF inside — that is the heartbeat of almost every game!' }
  ];

  /* ---- Scratch -> Python bridge (side quest) ---- */
  var BRIDGE = [
    { kind: 'predict', q: 'Which Python line does the SAME thing?', answers: ['print("Hello!")', 'say("Hello!")', 'echo "Hello!"'], correct: 0,
      blocks: [{ c: 'looks', t: 'say "Hello!"' }], why: 'say in Scratch = print() in Python. Same idea, typed instead of dragged.' },
    { kind: 'predict', q: 'Which Python line does the SAME thing?', answers: ['score = 0', 'set score = 0', 'score == 0'], correct: 0,
      blocks: [{ c: 'variables', t: 'set score to 0' }], why: 'One = puts a value into the box. (Two == would ASK about it.)' },
    { kind: 'predict', q: 'Which Python line does the SAME thing?', answers: ['score = score + 1', 'score + 1', 'change score by 1'], correct: 0,
      blocks: [{ c: 'variables', t: 'change score by 1' }], why: 'Python has no "change by" — you write the new value yourself: old score plus 1.' },
    { kind: 'predict', q: 'Which Python line starts the SAME loop?', answers: ['for i in range(10):', 'repeat 10:', 'loop 10 times'], correct: 0,
      blocks: [{ c: 'control', t: 'repeat 10' }, { c: 'motion', t: 'move 10 steps', in: 1 }], why: 'repeat 10 = for i in range(10): — the indented lines below are the inside of the loop.' },
    { kind: 'predict', q: 'Which Python line does the SAME thing?', answers: ['name = input("Your name?")', 'ask("Your name?")', 'name = ask and wait'], correct: 0,
      blocks: [{ c: 'sensing', t: 'ask "Your name?" and wait' }], why: 'ask-and-wait = input(). The typed answer lands in the variable.' },
    { kind: 'predict', q: 'Which Python line asks the SAME question?', answers: ['if score == 10:', 'if score = 10 then', 'when score is 10'], correct: 0,
      blocks: [{ c: 'control', t: 'if < score = 10 > then' }], why: 'Careful: Python uses == to compare. The colon starts the indented branch.' },
    { kind: 'predict', q: 'Which Python line loops the SAME way?', answers: ['while True:', 'forever:', 'repeat always'], correct: 0,
      blocks: [{ c: 'control', t: 'forever' }], why: 'forever = while True: — a condition that never stops being true.' },
    { kind: 'predict', q: 'Which Python line waits the SAME way?', answers: ['time.sleep(1)', 'wait(1)', 'pause 1 second'], correct: 0,
      blocks: [{ c: 'control', t: 'wait 1 second' }], why: 'time.sleep(1) — after import time at the top of your program.' }
  ];

  /* ---- error reading (Stage 3) ---- */
  var CRASHES = [
    { kind: 'predict', q: 'The program crashed! What went wrong?', answers: ['A variable name is misspelled', 'The computer is broken', 'Python hates games'], correct: 0,
      code: 'score = 10\nprint(scor)\n\nNameError: name \'scor\' is not defined', why: 'Read the LAST line first: Python never heard of "scor" — the name was mistyped.' },
    { kind: 'predict', q: 'What caused this crash?', answers: ['Asked for item 5 but the list has only 2', 'Too many fruits', 'print is broken'], correct: 0,
      code: 'fruits = ["apple", "plum"]\nprint(fruits[5])\n\nIndexError: list index out of range', why: 'The list has indexes 0 and 1 — index 5 is off the end of the shelf.' },
    { kind: 'predict', q: 'What is Python complaining about?', answers: ['Gluing text to a number — wrap it in str()', 'age is too big', 'The + sign is illegal'], correct: 0,
      code: 'age = 12\nprint("I am " + age)\n\nTypeError: can only concatenate str (not "int") to str', why: '"I am " is text, 12 is a number. print("I am " + str(age)) fixes it.' },
    { kind: 'predict', q: 'Why did this explode?', answers: ['Dividing by zero — impossible in maths too', 'Zero is unlucky', 'Python cannot divide'], correct: 0,
      code: 'players = 0\nprint(100 / players)\n\nZeroDivisionError: division by zero', why: 'Check numbers before dividing — an IF guard saves the day.' },
    { kind: 'predict', q: 'What went wrong here?', answers: ['The dictionary has no "phone" key', 'The phone is switched off', 'Dictionaries only store names'], correct: 0,
      code: 'book = {"name": "Ada"}\nprint(book["phone"])\n\nKeyError: \'phone\'', why: 'You can only look up keys that exist — or use book.get("phone") to be safe.' },
    { kind: 'predict', q: 'Python refuses to even start. Why?', answers: ['The line under if needs spaces in front', 'The file is too long', 'if is spelled wrong'], correct: 0,
      code: 'if score > 10:\nprint("You win!")\n\nIndentationError: expected an indented block', why: 'Indentation is Python\'s grammar — the inside of an if must be pushed right.' }
  ];

  /* ---- binary lights (Stage 4) ---- */
  var BULB_ON  = '<svg viewBox="0 0 40 52" class="bulb-svg"><path d="M20 4a13 13 0 0 1 8 23c-1.6 1.5-2.5 3-2.5 5H14.5c0-2-.9-3.5-2.5-5A13 13 0 0 1 20 4z" fill="#ffd24a"/><rect x="14" y="34" width="12" height="4" rx="2" fill="#9aa9d6"/><rect x="15" y="40" width="10" height="3" rx="1.5" fill="#9aa9d6"/></svg>',
    BULB_OFF = '<svg viewBox="0 0 40 52" class="bulb-svg"><path d="M20 4a13 13 0 0 1 8 23c-1.6 1.5-2.5 3-2.5 5H14.5c0-2-.9-3.5-2.5-5A13 13 0 0 1 20 4z" fill="#dfe5f6"/><rect x="14" y="34" width="12" height="4" rx="2" fill="#c3cce8"/><rect x="15" y="40" width="10" height="3" rx="1.5" fill="#c3cce8"/></svg>';
  function binaryChapter(rounds) {
    return function (ctx) {
      var i = 0, score = 0;
      function draw() {
        ctx.hud([
          { label: 'Pattern', value: (i + 1) + ' / ' + rounds.length },
          { label: 'Decoded', value: String(score), id: 'bnS' }
        ]);
        var bits = rounds[i].bits;
        var target = 0;
        var VALS = [8, 4, 2, 1];
        bits.forEach(function (b, k) { if (b) target += VALS[k]; });
        ctx.stage.innerHTML = '';
        var wrap = el('div', 'oh-wrap');
        wrap.appendChild(askMsg('Computers store numbers as ON/OFF lights. Each light is worth its number — add up the ON ones!'));
        var row = el('div', 'bulb-row');
        bits.forEach(function (b, k) {
          var cell = el('div', 'bulb-cell' + (b ? ' on' : ''));
          cell.innerHTML = (b ? BULB_ON : BULB_OFF) + '<span>' + VALS[k] + '</span>';
          row.appendChild(cell);
        });
        wrap.appendChild(row);
        var done = false;
        wrap.appendChild(choiceRow(rounds[i].answers, '', function (ai, b, r) {
          if (done) return;
          done = true;
          var right = rounds[i].answers[ai] === String(target);
          b.classList.add(right ? 'is-right' : 'is-wrong');
          if (right) { score++; ctx.set('bnS', String(score)); }
          else {
            for (var k = 0; k < r.children.length; k++) if (r.children[k].textContent === String(target)) r.children[k].classList.add('is-right');
          }
          wrap.appendChild(whyBox(rounds[i].why));
          var nb = el('button', 'btn-blast oh-next', (i + 1 < rounds.length) ? 'Next pattern' : 'Finish');
          nb.type = 'button';
          nb.addEventListener('click', function () {
            i++;
            if (i >= rounds.length) {
              var st = score >= rounds.length ? 3 : (score >= rounds.length - 1 ? 2 : 1);
              ctx.done(st, 'You read ' + score + ' of ' + rounds.length + ' binary numbers — like a computer!');
            } else draw();
          });
          wrap.appendChild(nb);
        }));
        ctx.stage.appendChild(wrap);
      }
      draw();
    };
  }
  var BINARY = [
    { bits: [1, 0, 1, 0], answers: ['10', '5', '12'], why: '8 on + 2 on = 10. That is 1010 in binary!' },
    { bits: [0, 1, 0, 1], answers: ['5', '10', '3'], why: '4 + 1 = 5. Binary 0101.' },
    { bits: [1, 1, 0, 0], answers: ['12', '3', '6'], why: '8 + 4 = 12.' },
    { bits: [0, 0, 1, 1], answers: ['3', '12', '4'], why: '2 + 1 = 3.' },
    { bits: [1, 1, 1, 1], answers: ['15', '4', '1111'], why: 'All lights on: 8+4+2+1 = 15 — the biggest 4-light number.' },
    { bits: [1, 0, 0, 1], answers: ['9', '6', '11'], why: '8 + 1 = 9.' }
  ];
  var BIGO = [
    { kind: 'predict', q: 'Your list gets 10 times longer. ONE loop through it now takes about...', answers: ['10x longer', 'the same time', '100x longer'], correct: 0,
      code: 'for item in big_list:\n    check(item)', why: 'One loop grows WITH the list — engineers call this linear time.' },
    { kind: 'predict', q: 'Same list, 10x longer — but now a loop INSIDE a loop. How much slower?', answers: ['About 100x', 'About 10x', 'Not slower'], correct: 0,
      code: 'for a in big_list:\n    for b in big_list:\n        compare(a, b)', why: '10x times 10x = 100x. Nested loops explode — that is why games lag!' },
    { kind: 'predict', q: 'Find one name in a SORTED list of 1000. The fastest way checks about...', answers: ['10 names (binary search)', 'All 1000 names', '500 names'], correct: 0,
      code: 'names = [...1000 sorted names...]', why: 'Halving 1000 again and again reaches 1 in about 10 steps. You played this in Echo Scanner!' },
    { kind: 'predict', q: 'Your game lags when 100 aliens spawn. A pro suspects...', answers: ['A loop inside a loop over the aliens', 'The screen colour', 'Bad luck'], correct: 0,
      code: 'for alien in aliens:\n    for other in aliens:\n        check_crash(alien, other)', why: '100 x 100 = 10,000 checks every frame. Smarter algorithms fix lag, not luck.' },
    { kind: 'predict', q: 'Looking up a word in a Python dictionary is...', answers: ['Nearly instant, even with a million words', 'Slower for big dictionaries', 'Alphabetical only'], correct: 0,
      code: 'phone_book = {...a million entries...}\nphone_book["Maya"]', why: 'Hash tables jump straight to the answer — that is their superpower.' }
  ];

  /* ---- CSS selector sniper (Stage 5) ---- */
  function selectorChapter(rounds) {
    return function (ctx) {
      var i = 0, score = 0;
      ctx.stage.innerHTML = '';
      var wrap = el('div', 'wb-wrap');
      var browser = el('div', 'wb-browser');
      browser.appendChild(el('div', 'wb-bar',
        '<span class="l-map-dot" style="--c:#ff5fa2"></span><span class="l-map-dot" style="--c:#ffb020"></span><span class="l-map-dot" style="--c:#22c55e"></span><span class="wb-url">space-cafe.galaxy/menu</span>'));
      var page = el('div', 'wb-page');
      var targets = [
        { key: 'h1', html: '<span class="sel-tag">h1</span>Space Café' },
        { key: 'dish1', html: '<span class="sel-tag">li .dish</span>Star soup' },
        { key: 'dish2', html: '<span class="sel-tag">li .dish</span>Moon pie' },
        { key: 'napkin', html: '<span class="sel-tag">li</span>Napkins' },
        { key: 'order', html: '<span class="sel-tag">button #order</span>Order now' },
        { key: 'note', html: '<span class="sel-tag">p .note</span>Fresh comets daily' },
        { key: 'link', html: '<span class="sel-tag">a</span>Recipes' }
      ];
      var nodes = {};
      targets.forEach(function (t) {
        var n = el('button', 'sel-el sel-' + t.key, t.html);
        n.type = 'button';
        n.addEventListener('click', function () { pick(t.key, n); });
        nodes[t.key] = n;
        page.appendChild(n);
      });
      browser.appendChild(page);
      wrap.appendChild(browser);
      var quiz = el('div', 'wb-quiz');
      wrap.appendChild(quiz);
      ctx.stage.appendChild(wrap);
      var tried = false, locked = false;

      function drawHud() {
        ctx.hud([
          { label: 'Target', value: Math.min(i + 1, rounds.length) + ' / ' + rounds.length },
          { label: 'First-try hits', value: String(score), id: 'ssS' }
        ]);
      }
      function ask() {
        drawHud();
        tried = false; locked = false;
        quiz.innerHTML = '';
        quiz.appendChild(askMsg(rounds[i].q));
        quiz.appendChild(el('pre', 'code-block sel-code', rounds[i].sel + ' { border: 3px solid gold; }'));
      }
      function pick(key, n) {
        if (locked || i >= rounds.length) return;
        if (rounds[i].accept.indexOf(key) !== -1) {
          locked = true;
          if (!tried) score++;
          ctx.set('ssS', String(score));
          n.classList.add('is-hit');
          quiz.appendChild(whyBox(rounds[i].why));
          var nb = el('button', 'btn-blast oh-next', (i + 1 < rounds.length) ? 'Next selector' : 'Finish');
          nb.type = 'button';
          nb.addEventListener('click', function () {
            n.classList.remove('is-hit');
            i++;
            if (i >= rounds.length) {
              var st = score >= rounds.length ? 3 : (score >= rounds.length - 1 ? 2 : 1);
              ctx.done(st, 'You aimed ' + score + ' of ' + rounds.length + ' selectors perfectly.');
            } else ask();
          });
          quiz.appendChild(nb);
        } else {
          tried = true;
          n.classList.add('is-miss');
          setTimeout(function () { n.classList.remove('is-miss'); }, 450);
        }
      }
      ask();
    };
  }
  var SELECTORS = [
    { sel: 'h1', q: 'This CSS rule is loaded. Click the element it will style!', accept: ['h1'], why: 'A bare tag selector styles every element of that tag.' },
    { sel: '#order', q: 'Click the element #order points at.', accept: ['order'], why: '# means id — and an id belongs to exactly ONE element.' },
    { sel: '.dish', q: 'Click ANY element that .dish selects.', accept: ['dish1', 'dish2'], why: '. means class — many elements can share it. Both dishes match!' },
    { sel: 'a', q: 'Click what the a selector styles.', accept: ['link'], why: 'Tag selectors again — a is the link tag.' },
    { sel: 'li', q: 'Tricky: click the element that li selects but .dish does NOT.', accept: ['napkin'], why: 'Napkins is an li WITHOUT the dish class — classes are opt-in.' },
    { sel: 'p.note', q: 'Click what p.note targets.', accept: ['note'], why: 'p.note means: a p tag that ALSO has the note class. Both must be true.' }
  ];

  /* ---- toolbelt drills (Stage 6) ---- */
  var TOOLBELT = [
    { scenario: 'Install the rich library to print colourful terminal output.', options: ['pip install rich', 'install rich', 'python get rich', 'download rich'], correct: 0,
      output: 'Successfully installed rich-13.0', why: 'pip is Python\'s package manager — it fetches libraries from PyPI.' },
    { scenario: 'Write down every library your project needs, for your teammates.', options: ['pip freeze > requirements.txt', 'pip remember', 'pip list --save', 'note libraries.txt'], correct: 0,
      output: 'requirements.txt written', why: 'requirements.txt is the shopping list other people install from.' },
    { scenario: 'A teammate cloned your repo. How do they install your libraries?', options: ['pip install -r requirements.txt', 'pip install all', 'pip clone', 'python setup'], correct: 0,
      output: 'Installing collected packages... done', why: '-r reads the requirements file and installs everything on the list.' },
    { scenario: 'Run your game from the terminal.', options: ['python game.py', 'run game.py', 'start game', 'open game.py'], correct: 0,
      output: 'Welcome to Star Dodger!', why: 'python filename.py hands your file to the Python interpreter.' },
    { scenario: 'Show which folder you are standing in right now.', options: ['pwd', 'here', 'folder', 'whereami'], correct: 0,
      output: '/home/student/projects/star-dodger', why: 'pwd = print working directory. (Windows says cd with no arguments.)' },
    { scenario: 'Create a new folder called rocket for your next project.', options: ['mkdir rocket', 'newfolder rocket', 'create rocket', 'folder rocket'], correct: 0,
      output: '(folder created — check with ls)', why: 'mkdir = make directory. ls shows it is really there.' }
  ];

  /* ---- data design court (Stage 7) ---- */
  var DESIGN = [
    { kind: 'predict', q: 'Which design is better for the school library?', answers: ['Design B — one fact lives in one place', 'Design A — fewer tables is simpler', 'They are equal'], correct: 0,
      code: 'Design A: one giant table\n  loans(book, member_name, member_phone, due)\n\nDesign B: three tables\n  books(id, title)\n  members(id, name, phone)\n  loans(book_id, member_id, due)', why: 'In A, a member\'s phone is copied onto EVERY loan — change it once, and the copies disagree.' },
    { kind: 'predict', q: 'A member gets a new phone number. In the GOOD design you update...', answers: ['One row in members', 'Every loan they ever made', 'Nothing, phones are forever'], correct: 0,
      code: 'members(id, name, phone)\nloans(book_id, member_id, due)', why: 'That is WHY we split tables: one fact, one home, one update.' },
    { kind: 'predict', q: 'Where should each player\'s best score live?', answers: ['A best_score column in players', 'A brand-new table for every player', 'In the game\'s title'], correct: 0,
      code: 'players(id, name, ...?)', why: 'A new FACT about every player = a new COLUMN. New tables are for new kinds of things.' },
    { kind: 'predict', q: 'Every table should have...', answers: ['An id that is unique for each row', 'A favourite colour', 'At least ten columns'], correct: 0,
      code: 'ships(id, name, speed)\npilots(id, name, ship_id)', why: 'The id is the primary key — the handle other tables grab with their foreign keys.' },
    { kind: 'predict', q: 'Your app saves game SETTINGS whose shape changes all the time. Better fit?', answers: ['A flexible JSON document', 'A strict table', 'A screenshot'], correct: 0,
      code: '{ "volume": 80,\n  "controls": {"jump": "SPACE"},\n  "new_stuff_next_week": "?" }', why: 'Documents bend, tables are strict. Real engineers pick the shape that fits the data.' }
  ];

  /* ---- security patrol (Stage 8) ---- */
  var SECURITY = [
    { kind: 'predict', q: 'How should a server remember passwords?', answers: ['As hashes — never the real text', 'In a passwords.txt file', 'In the page URL'], correct: 0,
      code: 'stored: "d0a4b1..." (hash)\ntyped:  "rocket123" -> hash -> compare', why: 'If hackers steal hashes, they still do not have the passwords.' },
    { kind: 'predict', q: 'A visitor types this as their NAME. Your app should...', answers: ['Clean and escape it before showing it', 'Run it — the customer is always right', 'Show it to all users as-is'], correct: 0,
      code: 'name = "<script>steal()</script>"', why: 'Never trust input! Escaping turns sneaky code into harmless text.' },
    { kind: 'predict', q: 'What does the S in https:// actually buy you?', answers: ['The connection is encrypted', 'The site loads faster', 'The site is more expensive'], correct: 0,
      code: 'http://  = postcards anyone can read\nhttps:// = sealed envelopes', why: 'On http, anyone on the wifi can read what you send. HTTPS seals it.' },
    { kind: 'predict', q: 'Where do API keys and passwords belong?', answers: ['Environment variables — outside the code', 'Pushed to GitHub with everything else', 'In a code comment'], correct: 0,
      code: 'BAD:  API_KEY = "sk-12345" in app.py\nGOOD: API_KEY = os.environ["API_KEY"]', why: 'Code gets shared; secrets must not travel with it. (This site follows that rule too!)' },
    { kind: 'predict', q: 'The safe order for shipping new code is...', answers: ['Test it, then deploy, then watch the logs', 'Deploy first, test if users complain', 'Delete the tests to go faster'], correct: 0,
      code: 'tests -> commit -> push -> deploy -> logs', why: 'Every pro pipeline runs the tests BEFORE the code reaches real users.' },
    { kind: 'predict', q: 'A form asks for age and someone types "banana". Your server should...', answers: ['Reject it politely with a 400', 'Crash — not your problem', 'Store the banana'], correct: 0,
      code: 'POST /signup { "age": "banana" }', why: 'Validate everything: right type, sensible size. 400 Bad Request is the polite no.' }
  ];

  /* ---- hero art (self-drawn, copyright-free) ---- */
  var HEROES = {
    robot: SVG.robot,
    scroll: '<svg viewBox="0 0 64 64"><rect x="14" y="8" width="36" height="48" rx="5" fill="#fff7e2"/><rect x="14" y="8" width="36" height="10" rx="5" fill="#ffd24a"/><line x1="21" y1="28" x2="43" y2="28" stroke="#b9a15c" stroke-width="3" stroke-linecap="round"/><line x1="21" y1="36" x2="43" y2="36" stroke="#b9a15c" stroke-width="3" stroke-linecap="round"/><line x1="21" y1="44" x2="35" y2="44" stroke="#b9a15c" stroke-width="3" stroke-linecap="round"/></svg>',
    wrench: '<svg viewBox="0 0 64 64"><path d="M44 10a10 10 0 0 0-13 13L12 42a6 6 0 0 0 9 9l19-19a10 10 0 0 0 13-13l-7 7-8-2-2-8z" fill="#cfd8f2"/><circle cx="17" cy="47" r="3" fill="#8a97c9"/></svg>',
    asteroid: '<svg viewBox="0 0 64 64"><circle cx="30" cy="32" r="16" fill="#8a97c9"/><circle cx="24" cy="28" r="4" fill="#5d6ca3"/><circle cx="36" cy="38" r="3" fill="#5d6ca3"/><path d="M48 12l4 8M54 26l6 2M50 44l6 6" stroke="#ffd24a" stroke-width="3" stroke-linecap="round"/></svg>',
    browser: '<svg viewBox="0 0 64 64"><rect x="8" y="12" width="48" height="40" rx="6" fill="#fff"/><rect x="8" y="12" width="48" height="12" rx="6" fill="#4c6fff"/><circle cx="16" cy="18" r="2.5" fill="#ff5fa2"/><circle cx="24" cy="18" r="2.5" fill="#ffd24a"/><circle cx="32" cy="18" r="2.5" fill="#34d399"/><rect x="14" y="30" width="22" height="5" rx="2.5" fill="#cfd8f2"/><rect x="14" y="39" width="34" height="5" rx="2.5" fill="#e7ecfb"/></svg>',
    branches: '<svg viewBox="0 0 64 64"><circle cx="16" cy="14" r="6" fill="#4c6fff"/><circle cx="16" cy="50" r="6" fill="#4c6fff"/><circle cx="48" cy="32" r="6" fill="#ff8a3c"/><path d="M16 20v24M16 26c0 8 32-2 32 0" fill="none" stroke="#9aa9d6" stroke-width="4" stroke-linecap="round"/></svg>',
    vault: '<svg viewBox="0 0 64 64"><rect x="10" y="10" width="44" height="44" rx="8" fill="#6366f1"/><circle cx="32" cy="32" r="13" fill="#e7ecfb"/><circle cx="32" cy="32" r="5" fill="#6366f1"/><path d="M32 19v6M32 39v6M19 32h6M39 32h6" stroke="#c7d2fe" stroke-width="3" stroke-linecap="round"/></svg>',
    satellite: '<svg viewBox="0 0 64 64"><rect x="26" y="24" width="12" height="16" rx="3" fill="#cfd8f2"/><rect x="6" y="26" width="16" height="12" rx="2" fill="#4c6fff"/><rect x="42" y="26" width="16" height="12" rx="2" fill="#4c6fff"/><line x1="32" y1="24" x2="32" y2="14" stroke="#8a97c9" stroke-width="3"/><circle cx="32" cy="11" r="4" fill="#ff5fa2"/><path d="M20 50c8 6 16 6 24 0" fill="none" stroke="#ffd24a" stroke-width="3" stroke-linecap="round"/></svg>',
    planets: '<svg viewBox="0 0 64 64"><circle cx="22" cy="26" r="12" fill="#9a6bff"/><ellipse cx="22" cy="27" rx="19" ry="6" fill="none" stroke="#ffd24a" stroke-width="3" transform="rotate(-18 22 27)"/><circle cx="46" cy="44" r="8" fill="#34d399"/><circle cx="49" cy="15" r="5" fill="#ff5fa2"/></svg>'
  };

  /* =================================================================
     GAME REGISTRY
     ================================================================= */
  var GAMES = {
    s1: {
      key: 's1', title: 'Robo Runner', tag: 'Plan routes, master REPEAT blocks, then face the IF/ELSE gates.',
      hero: HEROES.robot,
      finale: 'Robo\'s ship is refuelled and airborne! Sequences, loops, IF/ELSE — you know the moves behind every game.',
      chapters: [
        { name: 'Crash Site', blurb: 'Learn to queue commands and reach the flag.',
          run: gridQuest([
            { w: 5, h: 3, bot: [0, 1], flag: [4, 1], stars: [[2, 0]], rocks: [[2, 1]], par: 6 },
            { w: 5, h: 4, bot: [0, 3], flag: [4, 3], stars: [[0, 0], [4, 0]], rocks: [[2, 2], [2, 3]], par: 10 },
            { w: 6, h: 4, bot: [0, 3], flag: [5, 3], stars: [[3, 0]], rocks: [[1, 2], [1, 3], [4, 1]], par: 11 }
          ], false) },
        { name: 'Rock Maze', blurb: 'Two stars per level and trickier rock walls.',
          run: gridQuest([
            { w: 6, h: 5, bot: [0, 4], flag: [5, 0], stars: [[0, 0], [5, 4]], rocks: [[2, 1], [2, 2], [2, 3]], par: 17 },
            { w: 6, h: 5, bot: [0, 2], flag: [5, 2], stars: [[2, 0], [2, 4]], rocks: [[1, 1], [3, 1], [1, 3], [3, 3]], par: 13 },
            { w: 6, h: 5, bot: [5, 4], flag: [0, 0], stars: [[5, 0], [0, 4]], rocks: [[1, 1], [2, 2], [4, 4]], par: 17 }
          ], false) },
        { name: 'Loop Canyon', blurb: 'The block limit is tight — use x2 and x3 repeats!',
          run: gridQuest([
            { w: 6, h: 5, bot: [0, 4], flag: [5, 0], stars: [], rocks: [], par: 4, limit: 6 },
            { w: 6, h: 5, bot: [0, 4], flag: [5, 4], stars: [[2, 0], [3, 0]], rocks: [], par: 6, limit: 7 },
            { w: 5, h: 5, bot: [0, 4], flag: [4, 0], stars: [], rocks: [[1, 4], [2, 3], [3, 2], [4, 1]], par: 8, limit: 8 }
          ], true) },
        { name: 'Rule Gates', blurb: 'IF this THEN that — real Scratch logic puzzles.', run: quizQuest(SCRATCH_LOGIC, 3) }
      ]
    },
    s2: {
      key: 's2', title: 'Python Quest', tag: 'Translate Scratch blocks, predict code, fix it, weave it together.',
      hero: HEROES.scroll,
      finale: 'You can read, complete and assemble Python — and you saw it is just Scratch in typed clothes.',
      chapters: [
        { name: 'Block Translator', blurb: 'SIDE QUEST: every Scratch block has a Python twin.', run: quizQuest(BRIDGE, 3) },
        { name: 'Prophecy Hall', blurb: 'Predict what each spell prints.', run: quizQuest(PREDICT, 3) },
        { name: 'Broken Spellbook', blurb: 'Choose the missing rune in each spell.', run: quizQuest(BLANKS, 3) },
        { name: 'Scroll Weaver', blurb: 'Tap the torn lines back into working order.', run: quizQuest(ORDERS, 3) },
        { name: 'Dragon\'s Gate', blurb: 'BOSS: the hardest prophecies, few lives.', run: quizQuest(shuffle(PREDICT_HARD.concat([BLANKS[4], BLANKS[1]])), 2) }
      ]
    },
    s3: {
      key: 's3', title: 'Debug Station', tag: 'Find broken lines, read crash reports, save the station.',
      hero: HEROES.wrench,
      finale: 'All systems green! Reading errors calmly is a superpower most adults never learn.',
      chapters: [
        { name: 'Life Support', blurb: 'Classic bugs: typos, = vs ==, indentation.', run: debugQuest(DEBUG_C1, 3) },
        { name: 'Navigation', blurb: 'Logic bugs: ranges, loops that never end.', run: debugQuest(DEBUG_C2, 3) },
        { name: 'Crash Reports', blurb: 'Real error messages — name the cause.', run: quizQuest(CRASHES, 3) },
        { name: 'Reactor Core', blurb: 'BOSS: subtle bugs, only 2 lives.', run: debugQuest(DEBUG_C3, 2) }
      ]
    },
    s4: {
      key: 's4', title: 'Algorithm Galaxy', tag: 'Sort belts, hunt with binary search, read binary, judge speed.',
      hero: HEROES.asteroid,
      finale: 'You used the same algorithms that run inside every search engine and game — and you can even read binary.',
      chapters: [
        { name: 'Asteroid Belt', blurb: 'Sort with as few swaps as the maths allows.', run: sortChapter([[5, 2, 7, 1], [3, 7, 1, 5, 2], [9, 2, 8, 4, 6, 1], [6, 3, 8, 1, 9, 2, 7]]) },
        { name: 'Echo Scanner', blurb: 'Find hidden pirates — always scan the middle!', run: searchChapter([{ max: 31, budget: 6 }, { max: 63, budget: 7 }, { max: 100, budget: 8 }]) },
        { name: 'Cargo Bay', blurb: 'Stacks vs queues: predict what comes out.', run: quizQuest(CARGO, 3) },
        { name: 'Binary Lights', blurb: 'Read numbers the way computers store them.', run: binaryChapter(BINARY) },
        { name: 'Speed Court', blurb: 'Judge which code is fast and which is slow.', run: quizQuest(BIGO, 3) }
      ]
    },
    s5: {
      key: 's5', title: 'Web Builder', tag: 'Build the Space Café\'s site piece by piece — and aim CSS like a sniper.',
      hero: HEROES.browser,
      finale: 'The Space Café is ONLINE! You used the exact three languages every website on Earth is made of.',
      chapters: [
        { name: 'Raise the Bones', blurb: 'HTML: place the right tag for every need.', run: webQuest(WEB_HTML) },
        { name: 'Paint the Hull', blurb: 'CSS: style the page — see it change live.', run: webQuest(WEB_CSS) },
        { name: 'Selector Sniper', blurb: 'Aim tag, .class and #id selectors at the right targets.', run: selectorChapter(SELECTORS) },
        { name: 'Flip the Switch', blurb: 'JavaScript: wire up clicks, greetings and night mode.', run: webQuest(webJsSteps()) }
      ]
    },
    s6: {
      key: 's6', title: 'Git Time Machine', tag: 'Commits, branches, conflicts — plus pip and terminal drills.',
      hero: HEROES.branches,
      finale: 'Commits, branches, merges, pip, terminal — you now work like a real software team member.',
      chapters: [
        { name: 'First Snapshots', blurb: 'The core commands: add, commit, push, pull.', run: termChapter(GIT_C1, 3) },
        { name: 'Branch Riddles', blurb: 'Parallel timelines and how they merge.', run: quizQuest(GIT_C2, 3) },
        { name: 'Toolbelt Drills', blurb: 'pip, requirements.txt, folders and running code.', run: termChapter(TOOLBELT, 3) },
        { name: 'Conflict Boss', blurb: 'Resolve real merge conflicts by hand.', run: conflictChapter(GIT_C3) }
      ]
    },
    s7: {
      key: 's7', title: 'Data Vault', tag: 'Read tables, follow secret keys, filter rows, judge designs.',
      hero: HEROES.vault,
      finale: 'Rows, columns, keys, filters and design — you now think in data like an engineer.',
      chapters: [
        { name: 'The Reading Room', blurb: 'Rows, columns, records — learn to read a table.', run: tableChapter(TBL_ROUNDS) },
        { name: 'Secret Keys', blurb: 'Follow the ids that connect tables together.', run: keysChapter() },
        { name: 'Filter Patrol', blurb: 'Select exactly the right rows, like a real search.', run: filterChapter(FILTERS) },
        { name: 'Vault Architect', blurb: 'Judge good and bad data designs.', run: quizQuest(DESIGN, 3) }
      ]
    },
    s8: {
      key: 's8', title: 'API Command Center', tag: 'Send real requests, decode signals, pass security, ship it.',
      hero: HEROES.satellite,
      finale: 'THE GALAXY APP IS LIVE! Requests, status codes, security, deployment — the daily magic of a senior engineer.',
      chapters: [
        { name: 'Request Academy', blurb: 'Build GET, POST and DELETE requests — a live server answers.', run: requestChapter(API_MISSIONS) },
        { name: 'Code Red Signals', blurb: 'Decode 200, 201, 400, 403, 404 and 500.', run: statusChapter(API_STATUS) },
        { name: 'Signal Chains', blurb: 'Trace requests app to server to database and back.', run: chainChapter(API_CHAINS.slice(0, 3)) },
        { name: 'Shield Wall', blurb: 'Passwords, HTTPS, sneaky input — think like security.', run: quizQuest(SECURITY, 3) },
        { name: 'Launch Day', blurb: 'BOSS: run the deployment pipeline and go LIVE.', run: chainChapter([API_CHAINS[3]]) }
      ]
    },
    j1: {
      key: 'j1', title: 'Robo Runner Jr', tag: 'Walk little Robo to the star, one arrow at a time.',
      hero: HEROES.robot,
      finale: 'Robo is home! You gave a robot its very first instructions — that is real programming!',
      chapters: [
        { name: 'First Steps', blurb: 'Short walks, no rocks.',
          run: gridQuest([
            { w: 3, h: 3, bot: [0, 2], flag: [2, 2], stars: [], rocks: [], par: 2 },
            { w: 3, h: 3, bot: [0, 2], flag: [2, 0], stars: [], rocks: [], par: 4 },
            { w: 4, h: 3, bot: [0, 1], flag: [3, 1], stars: [[2, 1]], rocks: [], par: 3 }
          ], false) },
        { name: 'Rocky Road', blurb: 'Steer around the rocks and grab a star.',
          run: gridQuest([
            { w: 4, h: 3, bot: [0, 2], flag: [3, 0], stars: [], rocks: [[1, 2], [2, 0]], par: 5 },
            { w: 4, h: 4, bot: [0, 3], flag: [3, 0], stars: [[0, 0]], rocks: [[1, 3], [1, 2], [2, 1]], par: 6 },
            { w: 4, h: 4, bot: [0, 3], flag: [3, 3], stars: [[3, 0]], rocks: [[2, 3], [2, 2]], par: 10 }
          ], false) }
      ]
    },
    j2: {
      key: 'j2', title: 'Planet Echo', tag: 'Watch the planets light up, then tap the pattern back.',
      hero: HEROES.planets,
      finale: 'The planets sing your name across the nebula! Remembering patterns is exactly how coders read programs.',
      chapters: [
        { name: 'The Light Song', blurb: 'Reach a pattern of 4 to pass. 8 is legendary!', run: echoQuest(8, 6, 4) }
      ]
    }
  };
  var FALLBACK = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

  /* ---------- open / close ---------- */
  function open(info) {
    current = info;
    var g = GAMES[info.key] || GAMES[FALLBACK[(parseInt(info.num, 10) - 1) % FALLBACK.length]] || GAMES.s1;
    elWorld.textContent = 'World ' + info.num + ' — ' + info.name;
    elTitle.textContent = g.title;
    elTag.textContent = g.tag;
    card.style.setProperty('--planet-color', info.color || '#4c6fff');
    showChapters(g, info);
  }

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-arcade]');
    if (!btn) return;
    ev.preventDefault();
    ev.stopPropagation();
    modal.hidden = false;
    open({ key: btn.dataset.arcade, num: btn.dataset.num, name: btn.dataset.name, color: btn.dataset.color });
  });
  modal.addEventListener('click', function (ev) {
    if (ev.target.hasAttribute('data-aclose')) close();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !modal.hidden) close();
  });
  function close() {
    modal.hidden = true;
    elStage.innerHTML = '';
    elHud.innerHTML = '';
    current = null;
  }
})();
