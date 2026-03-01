(() => {
  const current = document.body?.dataset?.page || "";
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === current) link.classList.add("active");
  });

  const revealItems = document.querySelectorAll(".reveal");
  if (!revealItems.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => io.observe(item));
})();
