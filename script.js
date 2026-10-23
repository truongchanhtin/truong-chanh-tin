// script.js — hiệu ứng tương tác (tôn trọng "giảm chuyển động")
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

  /* ========== 1. CHỮ GÕ MÁY ở dòng vai trò (.role) ==========
     - Mặc định: gõ đúng chữ đang có trong HTML, một lần.
     - Muốn xoay vòng nhiều vai trò: <p class="role" data-roles="Web Developer|Designer|Freelancer">
  */
  var role = document.querySelector('.role');
  if (role && !reduce) {
    var list = (role.getAttribute('data-roles') || role.textContent.trim()).split('|').map(function (s) { return s.trim(); });
    var loop = list.length > 1;
    role.style.minHeight = role.offsetHeight + 'px';
    role.textContent = '';
    role.classList.add('typing');
    var wi = 0, ci = 0, deleting = false;
    var tick = function () {
      var word = list[wi];
      if (!deleting) {
        ci++;
        role.textContent = word.slice(0, ci);
        if (ci === word.length) {
          if (!loop) { setTimeout(function () { role.classList.add('done'); }, 2500); return; }
          deleting = true;
          return setTimeout(tick, 1600);
        }
        return setTimeout(tick, 70 + Math.random() * 50);
      }
      ci--;
      role.textContent = word.slice(0, ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % list.length; return setTimeout(tick, 350); }
      setTimeout(tick, 35);
    };
    setTimeout(tick, 900); // chờ hiệu ứng hiện đầu trang xong
  }

  /* ========== 2. SỐ ĐẾM CHẠY (.count) ==========
     <span class="count" data-count="120" data-suffix="+"></span>
     Tùy chọn: data-prefix, data-suffix, data-decimals
  */
  var counters = document.querySelectorAll('[data-count]');
  var fmt = function (el, v) {
    var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
    el.textContent = (el.getAttribute('data-prefix') || '') +
      v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) +
      (el.getAttribute('data-suffix') || '');
  };
  var runCount = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (reduce) { fmt(el, target); return; }
    var dur = 1800, start = null;
    var step = function (t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      fmt(el, target * eased);
      if (p < 1) requestAnimationFrame(step); else fmt(el, target);
    };
    requestAnimationFrame(step);
  };
  counters.forEach(function (el) { fmt(el, 0); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io.observe(el); });
  } else {
    counters.forEach(runCount);
  }

  /* ========== Các hiệu ứng chuột (chỉ máy có chuột) ========== */
  if (reduce || !fine) return;

  // Vệt sáng đi theo chuột
  var glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  var x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; glow.style.opacity = 1; });
  document.addEventListener('mouseleave', function () { glow.style.opacity = 0; });
  (function loop() {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    glow.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    requestAnimationFrame(loop);
  })();

  // Đèn pha trong thẻ + nghiêng 3D cho thẻ dự án
  document.querySelectorAll('.project-card, .job, .stat').forEach(function (card) {
    var tilt = card.classList.contains('project-card');
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = e.clientX - r.left, py = e.clientY - r.top;
      card.style.setProperty('--mx', px + 'px');
      card.style.setProperty('--my', py + 'px');
      if (tilt) {
        card.style.setProperty('--ry', ((px / r.width - 0.5) * 8) + 'deg');
        card.style.setProperty('--rx', (-(py / r.height - 0.5) * 8) + 'deg');
      }
    });
    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  // Nút bấm "từ tính"
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
      var dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
      btn.style.translate = dx + 'px ' + dy + 'px';
    });
    btn.addEventListener('mouseleave', function () { btn.style.translate = '0 0'; });
  });
})();