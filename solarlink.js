const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

function animateCounters() {
  document.querySelectorAll("[data-count]").forEach((counter) => {
    const target = Number(counter.dataset.count || 0);
    const start = performance.now();
    const duration = 1100;
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      counter.textContent = Math.round(target * p);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

function setupParticles() {
  const canvas = document.getElementById("solarParticles");
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = Array.from({ length: Math.min(80, Math.floor(window.innerWidth / 18)) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.4 + 0.6,
      s: Math.random() * 0.35 + 0.12,
      a: Math.random() * 0.24 + 0.08
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y -= p.s;
      p.x += Math.sin(p.y * 0.01) * 0.18;
      if (p.y < -10) p.y = canvas.height + 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 200, 74, ${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
}

function setupHotspots() {
  const tip = document.getElementById("hotspotTip");
  document.querySelectorAll(".hotspot").forEach((hotspot) => {
    hotspot.addEventListener("click", () => {
      tip.textContent = hotspot.dataset.tip;
      document.querySelectorAll(".hotspot").forEach((h) => h.classList.remove("is-active"));
      hotspot.classList.add("is-active");
    });
  });
}

let challengeTimer = null;
let challengeRemaining = 60;
let connectedCount = 0;

function updateChallenge() {
  const timerEl = document.getElementById("challengeTimer");
  const circle = document.querySelector(".timer-circle");
  timerEl.textContent = challengeRemaining;
  circle.style.setProperty("--progress", `${(challengeRemaining / 60) * 100}%`);
}

function startChallenge() {
  clearInterval(challengeTimer);
  challengeRemaining = 60;
  connectedCount = 0;
  document.querySelectorAll(".camp-module").forEach((module) => module.classList.remove("is-connected"));
  document.getElementById("challengeStatus").textContent = "Connect modules to create the best social campsite layout.";
  updateChallenge();

  challengeTimer = setInterval(() => {
    challengeRemaining -= 1;
    updateChallenge();
    if (challengeRemaining <= 0) {
      clearInterval(challengeTimer);
      document.getElementById("challengeStatus").textContent =
        connectedCount >= 4 ? "Great campsite! Visitors can vote for this layout." : "Time is up. Try connecting every module next round.";
    }
  }, 1000);
}

function setupActivationGame() {
  document.getElementById("startChallenge")?.addEventListener("click", startChallenge);
  document.querySelectorAll(".camp-module").forEach((module) => {
    module.addEventListener("click", () => {
      if (!module.classList.contains("is-connected")) {
        connectedCount += 1;
        module.classList.add("is-connected");
      }
      document.getElementById("challengeStatus").textContent =
        `${connectedCount}/4 modules connected. Build your camp, power your crew.`;
    });
  });
}

function setupScrollPolish() {
  const navLinks = [...document.querySelectorAll(".site-nav nav a")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function updateActiveSection() {
    const scrollProgress = Math.round((window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 100);
    document.documentElement.style.setProperty("--scroll-glow", scrollProgress);

    const activeSection = sections
      .map((section) => ({
        id: section.id,
        distance: Math.abs(section.getBoundingClientRect().top - 140)
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${activeSection?.id}`);
    });
  }

  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
  updateActiveSection();
}

function alignHashSection() {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (target) {
    window.scrollTo({
      top: Math.max(target.offsetTop, 0),
      behavior: "auto"
    });
  }
}

function scheduleHashAlignment() {
  [80, 260, 700, 1400].forEach((delay) => {
    setTimeout(alignHashSection, delay);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  animateCounters();
  setupParticles();
  setupHotspots();
  setupActivationGame();
  setupScrollPolish();
  scheduleHashAlignment();
});

window.addEventListener("load", () => {
  scheduleHashAlignment();
});
