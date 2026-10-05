// Quran player: a slim bar pinned to the very top of every page.
// Internal links are loaded in place so the audio never stops; the track and
// position are also saved, so a full reload picks up where it left off.
(function () {
  if (window.__quranPlayer) return;
  window.__quranPlayer = true;

  // Mishary Rashid Alafasy, full surahs, via mp3quran.net
  var SRC = "https://server8.mp3quran.net/afs/";
  var RECITER = "Mishary Alafasy";
  var SURAHS = ("Al-Fatiha,Al-Baqarah,Al-Imran,An-Nisa,Al-Ma'idah,Al-An'am,Al-A'raf,Al-Anfal,At-Tawbah,Yunus," +
    "Hud,Yusuf,Ar-Ra'd,Ibrahim,Al-Hijr,An-Nahl,Al-Isra,Al-Kahf,Maryam,Ta-Ha," +
    "Al-Anbiya,Al-Hajj,Al-Mu'minun,An-Nur,Al-Furqan,Ash-Shu'ara,An-Naml,Al-Qasas,Al-Ankabut,Ar-Rum," +
    "Luqman,As-Sajdah,Al-Ahzab,Saba,Fatir,Ya-Sin,As-Saffat,Sad,Az-Zumar,Ghafir," +
    "Fussilat,Ash-Shura,Az-Zukhruf,Ad-Dukhan,Al-Jathiyah,Al-Ahqaf,Muhammad,Al-Fath,Al-Hujurat,Qaf," +
    "Adh-Dhariyat,At-Tur,An-Najm,Al-Qamar,Ar-Rahman,Al-Waqi'ah,Al-Hadid,Al-Mujadilah,Al-Hashr,Al-Mumtahanah," +
    "As-Saff,Al-Jumu'ah,Al-Munafiqun,At-Taghabun,At-Talaq,At-Tahrim,Al-Mulk,Al-Qalam,Al-Haqqah,Al-Ma'arij," +
    "Nuh,Al-Jinn,Al-Muzzammil,Al-Muddaththir,Al-Qiyamah,Al-Insan,Al-Mursalat,An-Naba,An-Nazi'at,Abasa," +
    "At-Takwir,Al-Infitar,Al-Mutaffifin,Al-Inshiqaq,Al-Buruj,At-Tariq,Al-A'la,Al-Ghashiyah,Al-Fajr,Al-Balad," +
    "Ash-Shams,Al-Layl,Ad-Duha,Ash-Sharh,At-Tin,Al-Alaq,Al-Qadr,Al-Bayyinah,Az-Zalzalah,Al-Adiyat," +
    "Al-Qari'ah,At-Takathur,Al-Asr,Al-Humazah,Al-Fil,Quraysh,Al-Ma'un,Al-Kawthar,Al-Kafirun,An-Nasr," +
    "Al-Masad,Al-Ikhlas,Al-Falaq,An-Nas").split(",");
  var KEY = "quran-player";

  var ICON_PLAY = '<svg class="i-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/></svg>';
  var ICON_PAUSE = '<svg class="i-pause" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 3h2.5v10H4.5zM9 3h2.5v10H9z" fill="currentColor"/></svg>';
  var ICON_NEXT = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5v9l6.5-4.5zM11 3.5h2v9h-2z" fill="currentColor"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  var audio = new Audio();
  audio.preload = "metadata";
  var surah = 1;

  var bar = document.createElement("div");
  bar.className = "qp";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Quran player");
  bar.innerHTML =
    '<div class="wrap qp-in">' +
      '<button class="qp-play" type="button" aria-label="Play">' + ICON_PLAY + ICON_PAUSE + '</button>' +
      '<div class="qp-meta"><span class="qp-title"></span><span class="qp-sub">' + RECITER + '</span></div>' +
      '<span class="qp-time">0:00</span>' +
      '<button class="qp-next" type="button" aria-label="Next surah">' + ICON_NEXT + '</button>' +
      '<button class="qp-close" type="button" aria-label="Close player">' + ICON_CLOSE + '</button>' +
    '</div>' +
    '<div class="qp-bar"><div class="qp-fill"></div></div>';
  var $ = function (s) { return bar.querySelector(s); };
  var playBtn = $(".qp-play"), title = $(".qp-title"), time = $(".qp-time"), fill = $(".qp-fill");

  function fmt(t) {
    t = Math.max(0, Math.floor(t || 0));
    return Math.floor(t / 60) + ":" + ("0" + (t % 60)).slice(-2);
  }

  function load(n, at) {
    surah = n;
    audio.src = SRC + ("00" + n).slice(-3) + ".mp3";
    if (at) audio.addEventListener("loadedmetadata", function seek() {
      audio.removeEventListener("loadedmetadata", seek);
      audio.currentTime = at;
    });
    title.textContent = n + ". " + SURAHS[n - 1];
    fill.style.width = "0";
    time.textContent = fmt(at);
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: "Surah " + SURAHS[n - 1], artist: RECITER, album: "The Holy Quran" });
    }
  }

  function show() { document.documentElement.classList.add("qp-on"); }

  function play() {
    if (!audio.src) load(surah);
    show();
    var p = audio.play();
    if (p && p.catch) p.catch(function () { sync(); });
  }

  function save() {
    try {
      if (!document.documentElement.classList.contains("qp-on")) return localStorage.removeItem(KEY);
      localStorage.setItem(KEY, JSON.stringify({ surah: surah, time: audio.currentTime || 0, playing: !audio.paused }));
    } catch (e) {}
  }

  // reflect state on the bar and on every Quran button on the page
  function sync() {
    var on = !audio.paused;
    bar.classList.toggle("playing", on);
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
    document.querySelectorAll("[data-quran-toggle]").forEach(function (b) {
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll("[data-quran-label]").forEach(function (l) {
      l.textContent = on ? "Now playing: " + SURAHS[surah - 1] : audio.src ? "Resume " + SURAHS[surah - 1] : "Listen to the Quran";
    });
    save();
  }

  audio.addEventListener("play", sync);
  audio.addEventListener("pause", sync);
  audio.addEventListener("timeupdate", function () {
    time.textContent = fmt(audio.duration ? audio.duration - audio.currentTime : audio.currentTime);
    if (audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100) + "%";
  });
  audio.addEventListener("ended", function () { load(surah % 114 + 1); play(); });
  setInterval(function () { if (!audio.paused) save(); }, 3000);
  window.addEventListener("pagehide", save);

  playBtn.onclick = function () { audio.paused ? play() : audio.pause(); };
  $(".qp-next").onclick = function () { load(surah % 114 + 1); play(); };
  $(".qp-close").onclick = function () {
    audio.pause();
    document.documentElement.classList.remove("qp-on");
    save();
  };
  $(".qp-bar").onclick = function (e) {
    if (!audio.duration) return;
    var r = this.getBoundingClientRect();
    audio.currentTime = (e.clientX - r.left) / r.width * audio.duration;
  };

  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", play);
    navigator.mediaSession.setActionHandler("pause", function () { audio.pause(); });
    navigator.mediaSession.setActionHandler("nexttrack", function () { load(surah % 114 + 1); play(); });
  }

  // any [data-quran-toggle] button on any page drives the same player
  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-quran-toggle]")) return;
    audio.paused ? play() : audio.pause();
  });

  // ---- keep the audio alive across pages: swap the page body in place ----
  function swap(url, push) {
    return fetch(url).then(function (r) {
      if (!r.ok || !/text\/html/.test(r.headers.get("content-type") || "")) throw 0;
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      if (push) history.pushState({}, "", url);
      document.title = doc.title;
      // bring over any stylesheet the new page needs
      doc.querySelectorAll('head link[rel="stylesheet"]').forEach(function (l) {
        var href = new URL(l.getAttribute("href"), url).href;
        var have = [].some.call(document.querySelectorAll('link[rel="stylesheet"]'), function (m) { return m.href === href; });
        if (!have) { var n = document.createElement("link"); n.rel = "stylesheet"; n.href = href; document.head.appendChild(n); }
      });
      [].slice.call(document.body.children).forEach(function (c) { if (c !== bar) c.remove(); });
      [].slice.call(doc.body.children).forEach(function (c) {
        if (c.tagName === "SCRIPT") {
          if (c.hasAttribute("data-persist")) return;
          var s = document.createElement("script");
          if (c.src) { s.src = new URL(c.getAttribute("src"), url).href; s.async = false; } else s.textContent = c.textContent;
          document.body.appendChild(s);
        } else document.body.appendChild(document.adoptNode(c));
      });
      var hash = new URL(url).hash, target = hash && document.getElementById(hash.slice(1));
      if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
      sync();
    }).catch(function () { location.href = url; });
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== "_self" || a.hasAttribute("download") || a.origin !== location.origin) return;
    if (a.pathname === location.pathname && a.search === location.search) return; // same-page anchor
    e.preventDefault();
    swap(a.href, true);
  });
  window.addEventListener("popstate", function () { swap(location.href, false); });

  // ---- mount, and restore after a full reload ----
  document.body.insertBefore(bar, document.body.firstChild);
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (saved && saved.surah) {
    load(saved.surah, saved.time);
    show();
    if (saved.playing) play();
  }
  sync();
})();
