/* Code Galaxy — dashboard interactions (lesson modal + progress) */
(function () {
  var CG = window.CG || {};
  var rail = document.querySelector('.map');
  var modal = document.getElementById('levelModal');
  if (!rail || !modal) return;

  /* inline icons (no emoji anywhere) */
  var ICON = {
    check: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2.2" fill="currentColor"/><path d="M8.2 11V8a3.8 3.8 0 0 1 7.6 0v3" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>'
  };

  /* ---------- open the lesson modal when a mission is tapped ---------- */
  rail.addEventListener('click', function (ev) {
    var li = ev.target.closest('.level');
    if (!li) return;
    openModal(li.dataset.key, parseInt(li.dataset.index, 10));
  });

  function stateFor(idx) {
    if (idx < CG.frontier) return 'done';
    if (idx === CG.frontier) return 'current';
    return 'locked';
  }

  function openModal(key, idx) {
    var d = (CG.levels || {})[key];
    if (!d) return;

    document.getElementById('mTool').textContent = d.tool || '';
    document.getElementById('mStage').textContent = d.stage || '';
    document.getElementById('mTitle').textContent = d.title || '';
    document.getElementById('mTopic').textContent = d.topic || '';
    document.getElementById('mMission').textContent = d.mission || '';

    var ul = document.getElementById('mLearn');
    ul.innerHTML = '';
    (d.learn || []).forEach(function (item) {
      var liEl = document.createElement('li');
      liEl.textContent = item;
      ul.appendChild(liEl);
    });

    // what to do (numbered steps for the student)
    var teach = document.getElementById('mTeach');
    teach.innerHTML = '';
    (d.steps || []).forEach(function (step) {
      var liT = document.createElement('li');
      liT.textContent = step;
      teach.appendChild(liT);
    });
    var teachBtn = document.getElementById('mTeachBtn');
    var teachPanel = document.getElementById('mTeachPanel');
    teachPanel.hidden = true;
    teachBtn.style.display = (d.steps && d.steps.length) ? '' : 'none';
    teachBtn.textContent = 'What to do — step by step';

    // suggested languages / platforms (tags)
    var plat = document.getElementById('mPlatforms');
    plat.innerHTML = '';
    (d.platforms || []).forEach(function (p) {
      var s = document.createElement('span');
      s.className = 'tag';
      s.textContent = p;
      plat.appendChild(s);
    });

    // suggested learning sources (links)
    var res = document.getElementById('mResources');
    res.innerHTML = '';
    (d.resources || []).forEach(function (r) {
      var liEl = document.createElement('li');
      var a = document.createElement('a');
      a.href = r.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = r.name;
      liEl.appendChild(a);
      res.appendChild(liEl);
    });

    // reset the resources panel to collapsed each time
    var resBtn = document.getElementById('mResBtn');
    var resPanel = document.getElementById('mResPanel');
    var hasRes = (d.platforms && d.platforms.length) || (d.resources && d.resources.length);
    resPanel.hidden = true;
    resBtn.style.display = hasRes ? '' : 'none';
    resBtn.textContent = 'See where to learn this';

    // colour accent from the stage
    modal.querySelector('.modal-card').style.setProperty('--planet-color', d.color || '#4c6fff');

    setupAction(key, idx);
    modal.hidden = false;
  }

  // toggle the resources panel open/closed
  var resToggle = document.getElementById('mResBtn');
  if (resToggle) {
    resToggle.addEventListener('click', function () {
      var panel = document.getElementById('mResPanel');
      panel.hidden = !panel.hidden;
      resToggle.textContent = panel.hidden ? 'See where to learn this' : 'Hide learning sources';
    });
  }

  // toggle the step-by-step guide open/closed
  var teachToggle = document.getElementById('mTeachBtn');
  if (teachToggle) {
    teachToggle.addEventListener('click', function () {
      var panel = document.getElementById('mTeachPanel');
      panel.hidden = !panel.hidden;
      teachToggle.textContent = panel.hidden ? 'What to do — step by step' : 'Hide the steps';
    });
  }

  function setupAction(key, idx) {
    var btn = document.getElementById('mAction');
    var note = document.getElementById('mNote');
    var st = stateFor(idx);
    btn.style.display = '';
    note.textContent = '';

    if (st === 'current') {
      btn.textContent = 'I finished this — complete!';
      btn.className = 'btn-blast';
      btn.onclick = function () { doToggle(key, idx, 'complete'); };
    } else if (st === 'done') {
      if (idx === CG.frontier - 1) {
        btn.textContent = 'Mark as not done yet';
        btn.className = 'btn-ghost-wide';
        btn.onclick = function () { doToggle(key, idx, 'uncomplete'); };
        note.textContent = 'You have completed this mission.';
      } else {
        btn.style.display = 'none';
        note.textContent = 'Completed!  (finish later missions to undo this one)';
      }
    } else { // locked
      btn.style.display = 'none';
      note.textContent = 'Finish the earlier missions first to unlock this one.';
    }
  }

  function doToggle(key, idx, action) {
    var btn = document.getElementById('mAction');
    btn.disabled = true;
    fetch('toggle.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF': CG.csrf },
      body: JSON.stringify({ key: key, action: action })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        btn.disabled = false;
        if (!res.ok) { document.getElementById('mNote').textContent = res.error || 'Could not save.'; return; }
        CG.frontier = res.frontier;
        updateTop(res);
        rebuildStates(res.frontier);
        if (action === 'complete') {
          closeModal();
          celebrate();
        } else {
          setupAction(key, idx); // refresh button to the new state
        }
      })
      .catch(function () { btn.disabled = false; document.getElementById('mNote').textContent = 'Network error.'; });
  }

  /* ---------- close handlers ---------- */
  modal.addEventListener('click', function (ev) {
    if (ev.target.hasAttribute('data-close')) closeModal();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !modal.hidden) closeModal();
  });
  function closeModal() { modal.hidden = true; }

  /* ---------- update top bar + node states ---------- */
  function updateTop(res) {
    var fill = document.getElementById('globalFill');
    if (fill) fill.style.width = res.pct + '%';
    document.querySelectorAll('.xp-label').forEach(function (el) {
      if (el.textContent.indexOf('XP') !== -1) el.textContent = res.xp + ' XP';
      else if (el.textContent.indexOf('missions') !== -1) el.textContent = res.done + '/' + res.total + ' missions';
    });
  }

  function rebuildStates(frontier) {
    document.querySelectorAll('.level').forEach(function (li) {
      var idx = parseInt(li.dataset.index, 10);
      li.classList.remove('node-done', 'node-current', 'node-locked');
      var dot = li.querySelector('.dot-icon');
      if (idx < frontier) {
        li.classList.add('node-done');
        if (dot) dot.innerHTML = ICON.check;
      } else if (idx === frontier) {
        li.classList.add('node-current');
        if (dot) dot.textContent = String(idx + 1);
      } else {
        li.classList.add('node-locked');
        if (dot) dot.innerHTML = ICON.lock;
      }
    });
  }

  /* ---------- celebration ---------- */
  function celebrate() {
    var ov = document.getElementById('celebrate');
    if (ov) {
      var sub = document.getElementById('celebrateSub');
      if (sub) sub.textContent = '+' + (CG.xpPerLevel || 100) + ' XP';
      ov.hidden = false;
      clearTimeout(celebrate._t);
      celebrate._t = setTimeout(function () { ov.hidden = true; }, 1100);
    }
    confetti();
  }

  function confetti() {
    var colors = ['#ffd24a', '#4c6fff', '#9a6bff', '#34d399', '#ff5fa2', '#ff8a3c'];
    for (var i = 0; i < 70; i++) {
      var c = document.createElement('div');
      c.className = 'confetti';
      var size = 7 + Math.round(Math.random() * 9);
      c.style.left = (Math.random() * 100) + 'vw';
      c.style.width = size + 'px';
      c.style.height = (size + Math.round(Math.random() * 6)) + 'px';
      c.style.background = colors[i % colors.length];
      if (Math.random() < 0.4) c.style.borderRadius = '50%';
      c.style.animationDuration = (1 + Math.random() * 1.2) + 's';
      c.style.animationDelay = (Math.random() * 0.25) + 's';
      document.body.appendChild(c);
      (function (el) { setTimeout(function () { el.remove(); }, 3000); })(c);
    }
  }
})();
