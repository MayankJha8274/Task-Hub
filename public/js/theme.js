// Apply saved theme on page load
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  // Update icon if it exists
  const icon = document.getElementById("themeIcon");
  if (icon) icon.className = "bi bi-sun-fill fs-5";
}

// Toggle theme
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");

      if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        if (icon) icon.className = "bi bi-sun-fill fs-5";
      } else {
        localStorage.setItem("theme", "light");
        if (icon) icon.className = "bi bi-moon-stars fs-5";
      }
    });
  }
});
