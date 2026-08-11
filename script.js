
/* ============================================================
   1. DARK MODE TOGGLE
   
   How it works:
   - Tailwind uses darkMode:"class" strategy
   - Adding "dark" to <html> enables dark: utility classes
   - We save the user's choice to localStorage so it persists
     across page refreshes
============================================================ */

// Grab DOM elements
const darkToggle = document.getElementById("dark-toggle");
const toggleKnob = document.getElementById("toggle-knob");
const htmlEl = document.documentElement;

/**
 * setTheme(theme)
 * Applies "dark" or "light" mode and saves it to localStorage.
 * Also updates the toggle knob position and aria-pressed attribute
 * so screen readers know the current state.
 *
 * @param {string} theme - "dark" or "light"
 */
function setTheme(theme) {
  if (theme === "dark") {
    htmlEl.classList.add("dark");
    toggleKnob.style.transform = "translateX(24px)"; 
    darkToggle.setAttribute("aria-pressed", "true");
  } else {
    htmlEl.classList.remove("dark");
    toggleKnob.style.transform = "translateX(0px)"; 
    darkToggle.setAttribute("aria-pressed", "false");
  }
  // Save preference so it loads correctly on the next visit
  localStorage.setItem("theme", theme);
}

// On page load: use saved theme, or default to "dark"
const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

// When the toggle button is clicked, flip the current theme
darkToggle.addEventListener("click", () => {
  // Check if "dark" class is currently on <html>
  const isDark = htmlEl.classList.contains("dark");
  setTheme(isDark ? "light" : "dark");
});


/* ============================================================
   2. MOBILE NAVBAR TOGGLE (Burger Menu)
   
   How it works:
   - Clicking the burger button toggles a boolean (menuOpen)
   - We add/remove class "open" on #mobile-menu
   - CSS handles the slide animation via max-height transition
   - The three lines animate into an X shape when open
   - We also update aria attributes for screen reader support
============================================================ */

const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobile-menu");
const burgerLines = document.querySelectorAll(".burger-line");
let menuOpen = false; // tracks menu state

burger.addEventListener("click", () => {
  menuOpen = !menuOpen; // flip the state

  // Toggle "open" class which triggers CSS max-height animation
  mobileMenu.classList.toggle("open", menuOpen);

  // Update aria attributes for accessibility
  burger.setAttribute("aria-expanded", menuOpen);
  mobileMenu.setAttribute("aria-hidden", !menuOpen);
  burger.setAttribute("aria-label", menuOpen ? "Close navigation menu" : "Open navigation menu");

  // Animate burger lines into X (or back to lines)
  if (menuOpen) {
    burgerLines[0].style.transform = "rotate(45deg) translate(7px, 7px)";
    burgerLines[1].style.opacity = "0";
    burgerLines[2].style.transform = "rotate(-45deg) translate(6px, -6px)";
  } else {
    burgerLines[0].style.transform = "";
    burgerLines[1].style.opacity = "";
    burgerLines[2].style.transform = "";
  }
});

/**
 * closeMenu()
 * Resets the mobile menu to its closed state.
 * Called when a menu link is clicked or Escape key is pressed.
 */
function closeMenu() {
  menuOpen = false;
  mobileMenu.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
  burger.setAttribute("aria-label", "Open navigation menu");
  burgerLines[0].style.transform = "";
  burgerLines[1].style.opacity = "";
  burgerLines[2].style.transform = "";
}

// Close menu when any nav link inside it is clicked
document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// FIX: Close menu when Escape key is pressed (keyboard accessibility)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) {
    closeMenu();
    burger.focus(); // return focus to the burger button
  }
});


/* ============================================================
   3. TYPING EFFECT (Hero Section)
   
   How it works:
   - An array of "roles" cycles one by one
   - Each role is typed out character by character
   - After a pause, characters are deleted
   - Then the next role starts typing
   - setTimeout schedules the next step recursively
============================================================ */

const typedEl = document.getElementById("typed-text");

// The roles to cycle through
const roles = [
  "Web Developer",
  "PHP & Laravel Developer",
  "Full-Stack Developer",
  "Frontend Developer",
];

let roleIndex = 0;   // which role we're currently typing
let charIndex = 0;   // how many characters we've typed so far
let isDeleting = false; // are we typing or deleting?

/**
 * typeEffect()
 * Called repeatedly by setTimeout to create the typewriter animation.
 * Adds one character when typing, removes one when deleting.
 */
function typeEffect() {
  const currentRole = roles[roleIndex];

  if (!isDeleting) {
    // --- Typing forward ---
    // Show characters from 0 up to charIndex+1
    typedEl.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentRole.length) {
      // Finished typing this role → wait 1.5s before deleting
      isDeleting = true;
      setTimeout(typeEffect, 1500);
      return; // stop here, don't schedule again below
    }
  } else {
    // --- Deleting backward ---
    // Show characters from 0 up to charIndex-1
    typedEl.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      // Finished deleting → move to next role
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length; // wrap around to 0
    }
  }

  // Deleting is faster (60ms) than typing (110ms) for natural feel
  const speed = isDeleting ? 60 : 110;
  setTimeout(typeEffect, speed);
}

// Wait 800ms before starting so the page finishes loading first
setTimeout(typeEffect, 800);


/* ============================================================
   4. SCROLL REVEAL ANIMATION
   
   How it works:
   - IntersectionObserver watches elements with class "reveal"
   - When an element becomes 12% visible, we add class "revealed"
   - CSS transitions handle the actual fade + slide animation
   - unobserve() stops watching once revealed (no re-animation)
   
   Why IntersectionObserver instead of scroll events?
   - Much better performance (no scroll event listeners)
   - Browser handles the heavy lifting efficiently
============================================================ */

/**
 * revealObserver
 * Fires when observed elements enter/leave the viewport.
 * threshold:0.12 → fires when 12% of element is visible
 * rootMargin → triggers slightly before the element reaches the edge
 */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target); // only animate once
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px",
  }
);

// Start observing every element with class "reveal"
document.querySelectorAll(".reveal").forEach((el) => {
  revealObserver.observe(el);
});


/* ============================================================
   5. SKILL BAR ANIMATION
   
   How it works:
   - A second IntersectionObserver watches the #skills section
   - When skills section enters the viewport, we add class
     "animated" to every .skill-bar-fill inside it
   - CSS transitions the width from 0% → var(--level)
   - The --level custom property is set inline on each bar in HTML
============================================================ */

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Animate all skill bars in this section
        entry.target.querySelectorAll(".skill-bar-fill").forEach((bar) => {
          bar.classList.add("animated");
        });
        skillObserver.unobserve(entry.target); // only animate once
      }
    });
  },
  { threshold: 0.2 } // fire when 20% of the section is visible
);

// Only observe if the section exists (safe null check)
const skillsSection = document.getElementById("skills");
if (skillsSection) {
  skillObserver.observe(skillsSection);
}


/* ============================================================
   6. CONTACT FORM VALIDATION
   
   How it works:
   - We intercept form submission with e.preventDefault()
   - Check each required field manually
   - showError(input, true/false) adds error/success classes
     and shows/hides the sibling error message paragraph
   - If all valid, simulate a form send (replace with real API)
   - Live validation clears errors as user types
============================================================ */

const form = document.getElementById("contact-form");

/**
 * showError(input, show)
 * Toggles error styling and visibility of the error message.
 *
 * @param {HTMLElement} input - the input/textarea element
 * @param {boolean} show - true = show error, false = show success
 */
function showError(input, show) {
  // The error message paragraph is referenced by aria-describedby id
  const errorMsgId = input.getAttribute("aria-describedby");
  const errorMsg = errorMsgId ? document.getElementById(errorMsgId) : null;

  if (show) {
    input.classList.add("error");
    input.classList.remove("success");
    errorMsg?.classList.remove("hidden"); // optional chaining: safe if null
  } else {
    input.classList.remove("error");
    input.classList.add("success");
    errorMsg?.classList.add("hidden");
  }
}

/**
 * isValidEmail(email)
 * Checks email format using a simple regex.
 * Example: "user@example.com" → true, "notanemail" → false
 *
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Live validation: clear error styles as the user types
["name", "email", "message"].forEach((fieldId) => {
  const field = document.getElementById(fieldId);
  field?.addEventListener("input", function () {
    // Only clear error if the field now has a value
    if (this.value.trim()) {
      showError(this, false);
    }
  });
});

// Handle form submission
form?.addEventListener("submit", function (e) {
  e.preventDefault(); // stop the page from reloading

  // Grab form elements
  const nameInput    = document.getElementById("name");
  const emailInput   = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const successDiv   = document.getElementById("form-success");
  const btnText      = document.getElementById("btn-text");

  let isValid = true; // assume valid, set false if any check fails

  // --- Validate Name (must not be empty) ---
  if (!nameInput.value.trim()) {
    showError(nameInput, true);
    isValid = false;
  } else {
    showError(nameInput, false);
  }

  // --- Validate Email (must match email format) ---
  if (!isValidEmail(emailInput.value.trim())) {
    showError(emailInput, true);
    isValid = false;
  } else {
    showError(emailInput, false);
  }

  // --- Validate Message (must be at least 10 characters) ---
  if (messageInput.value.trim().length < 10) {
    showError(messageInput, true);
    isValid = false;
  } else {
    showError(messageInput, false);
  }

  // --- If all checks pass, send email via Web3Forms API ---
  if (isValid) {
    btnText.textContent = "Sending...";

    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const jsonBody = JSON.stringify(object);

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: jsonBody,
    })
      .then(async (response) => {
        const json = await response.json();
        btnText.textContent = "Send Message";

        if (response.status === 200 && json.success) {
          successDiv.textContent =
            "Message sent successfully! I'll get back to you soon.";
          successDiv.classList.remove(
            "hidden",
            "bg-red-500/10",
            "border-red-500/30",
            "text-red-400"
          );
          successDiv.classList.add(
            "bg-green-500/10",
            "border-green-500/30",
            "text-green-400"
          );

          // Reset the form fields
          form.reset();

          // Remove success styling from inputs after reset
          ["name", "email", "message"].forEach((fieldId) => {
            document.getElementById(fieldId)?.classList.remove("success");
          });

          // Auto-hide success message after 6 seconds
          setTimeout(() => successDiv.classList.add("hidden"), 6000);
        } else {
          successDiv.textContent =
            json.message || "Something went wrong. Please try again.";
          successDiv.classList.remove(
            "hidden",
            "bg-green-500/10",
            "border-green-500/30",
            "text-green-400"
          );
          successDiv.classList.add(
            "bg-red-500/10",
            "border-red-500/30",
            "text-red-400"
          );
        }
      })
      .catch((error) => {
        btnText.textContent = "Send Message";
        successDiv.textContent =
          "Network error. Please try sending your message again.";
        successDiv.classList.remove(
          "hidden",
          "bg-green-500/10",
          "border-green-500/30",
          "text-green-400"
        );
        successDiv.classList.add(
          "bg-red-500/10",
          "border-red-500/30",
          "text-red-400"
        );
      });
  }
});


/* ============================================================
   7. ACTIVE NAV LINK TRACKING
   
   How it works:
   - A third IntersectionObserver watches all <section> elements
   - When a section is 40% visible, we mark its nav link "active"
   - "active" class triggers the underline animation in CSS
   - rootMargin shrinks the detection zone (so top nav doesn't
     interfere with which section is "current")
============================================================ */

// Grab all sections that have an id (About, Skills, Projects, etc.)
const sections = document.querySelectorAll("section[id]");
// Grab all desktop nav links
const navLinks = document.querySelectorAll(".nav-link");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.getAttribute("id");

        // Loop through nav links and activate the matching one
        navLinks.forEach((link) => {
          const isMatch = link.getAttribute("href") === `#${sectionId}`;
          link.classList.toggle("active", isMatch);
        });
      }
    });
  },
  {
    threshold: 0.4,                  // 40% of section must be in view
    rootMargin: "-10% 0px -50% 0px", // narrow detection band
  }
);

sections.forEach((section) => sectionObserver.observe(section));


/* ============================================================
   8. NAVBAR SCROLL SHADOW
   
   How it works:
   - Listens for scroll events on the window
   - When scrolled more than 20px, adds a stronger shadow to navbar
   - When back at top, removes the shadow
   - passive:true tells the browser this listener won't call
     preventDefault(), allowing smoother scroll performance
============================================================ */

const navbar = document.getElementById("navbar");

window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = "0 4px 32px rgba(0,0,0,0.5)";
    } else {
      navbar.style.boxShadow = "none";
    }
  },
  { passive: true } // performance optimization for scroll listeners
);


/* ============================================================
   9. PROJECT CATEGORY FILTERING
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectArticles = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      projectArticles.forEach((card) => {
        const categories = card.getAttribute("data-category") || "";
        if (filter === "all" || categories.includes(filter)) {
          card.style.display = "block";
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, 50);
        } else {
          card.style.opacity = "0";
          card.style.transform = "translateY(20px)";
          setTimeout(() => {
            card.style.display = "none";
          }, 300);
        }
      });
    });
  });
});


/* ============================================================
   10. PROJECT DETAILS MODAL HANDLER
============================================================ */
window.openProjectModal = function (projectId) {
  const projectModal = document.getElementById("project-modal");
  const modalContent = document.getElementById("modal-content");
  if (!projectModal || !modalContent) return;

  if (projectId === "smart-hrms") {
    modalContent.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span class="text-xs px-3 py-1 rounded-full bg-accent/15 text-accent font-semibold uppercase tracking-wider">Featured &bull; PHP/Laravel</span>
            <h3 class="font-display text-2xl font-bold text-white mt-2">Smart HRMS — Enterprise HR Management System</h3>
          </div>
        </div>

        <div>
          <h4 class="font-display font-semibold text-accent mb-2">Overview</h4>
          <p class="text-muted text-sm leading-relaxed">
            Smart HRMS is a production-ready, full-stack enterprise Human Resource Management System engineered with Laravel 12, Spatie Role-Based Access Control (RBAC), Blade Components, Chart.js analytics, and Google Gemini AI integration.
          </p>
        </div>

        <div>
          <h4 class="font-display font-semibold text-accent mb-2">Technology Stack</h4>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="px-2.5 py-1 rounded bg-border text-white">Laravel 12</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">PHP 8.2+</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Laravel Breeze</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Spatie Permission (RBAC)</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Eloquent ORM</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">SQLite</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Blade Components</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Chart.js (v4.4)</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Google Gemini AI</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">PHPUnit / Pest (31 passing tests)</span>
          </div>
        </div>

        <div>
          <h4 class="font-display font-semibold text-accent mb-2">Key Modules & Verified Features</h4>
          <ul class="list-disc list-inside text-muted text-sm space-y-1.5 leading-relaxed">
            <li><strong class="text-white">Role-Based Access Control (RBAC):</strong> Admin & Employee roles managed via Spatie Laravel-Permission middleware.</li>
            <li><strong class="text-white">Departments & Designations CRUD:</strong> Eager-loaded department hierarchy with code validation, soft deletes, and relationship mapping.</li>
            <li><strong class="text-white">Employee Management:</strong> Atomic DB transactions (<code class="text-accent text-xs">DB::transaction()</code>) managing user creation and profile avatar uploads.</li>
            <li><strong class="text-white">Leave Management Engine:</strong> Sick (10), Casual (6), and Paid (12) balance tracking with manager approval state transitions.</li>
            <li><strong class="text-white">Attendance & Live Check-In Widget:</strong> 1-click check-in/out, late threshold calculation (09:30 AM), monthly logs, and admin manual corrections.</li>
            <li><strong class="text-white">Role-Scoped Chart.js Analytics:</strong> Org-wide KPIs, pending approval queues, and donut balance visualizations.</li>
            <li><strong class="text-white">Google Gemini AI Integration:</strong> AI Announcement Generator & Email Polisher built with a clean service layer (<code class="text-accent text-xs">AIService.php</code>) and typewriter JS rendering.</li>
            <li><strong class="text-white">Automated Test Suite:</strong> 31 feature & unit tests passing cleanly with Pest / PHPUnit.</li>
          </ul>
        </div>

        <div>
          <h4 class="font-display font-semibold text-accent mb-2">Technical Implementation</h4>
          <p class="text-muted text-sm leading-relaxed">
            Architected using MVC and SOLID design principles. The backend isolates external AI calls into a dedicated service layer (<code class="text-accent text-xs">AIService.php</code>) consuming the Google Gemini API. Authentication and authorization are handled seamlessly via Breeze and Spatie permission gates. Front-end analytics leverage Chart.js v4.4 with responsive canvas bindings.
          </p>
        </div>

        <div class="flex flex-wrap gap-4 pt-4 border-t border-border">
          <a href="https://smart-hrms-2sat.onrender.com/" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 bg-accent hover:bg-accentDark text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
            Live Demo ↗
          </a>
          <a href="https://github.com/akshada-03/smart-hrms" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 bg-border hover:bg-border/80 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
            GitHub Repository ↗
          </a>
        </div>
      </div>
    `;
  } else if (projectId === "ecom-ai") {
    modalContent.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span class="text-xs px-3 py-1 rounded-full bg-accent/15 text-accent font-semibold uppercase tracking-wider">PHP/Laravel</span>
            <h3 class="font-display text-2xl font-bold text-white mt-2">AI-Assisted E-commerce Web Application</h3>
          </div>
        </div>

        <div>
          <h4 class="font-display font-semibold text-accent mb-2">Overview</h4>
          <p class="text-muted text-sm leading-relaxed">
            Full-stack e-commerce web application developed with Laravel and MySQL. Features an end-to-end shopping workflow including dynamic product catalog browsing, cart management, checkout order generation, user account authentication, and an administrator dashboard for store management.
          </p>
        </div>

        <div>
          <h4 class="font-display font-semibold text-accent mb-2">Technology Stack</h4>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="px-2.5 py-1 rounded bg-border text-white">Laravel</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">PHP</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">MySQL</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Eloquent ORM</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Laravel Breeze</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Blade Templates</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Tailwind CSS</span>
          </div>
        </div>

        <div>
          <h4 class="font-display font-semibold text-accent mb-2">Key Implemented Modules</h4>
          <ul class="list-disc list-inside text-muted text-sm space-y-1.5 leading-relaxed">
            <li><strong class="text-white">Product Catalog & Detail View:</strong> Slug-based product routing with category filtering.</li>
            <li><strong class="text-white">Shopping Cart Management:</strong> Cart item persistence with user session sync and live quantity updates.</li>
            <li><strong class="text-white">Checkout & Order System:</strong> Order placement, status tracking (pending/completed), and order item line calculations.</li>
            <li><strong class="text-white">Admin Management Panel:</strong> Product CRUD, Category CRUD, and order status lifecycle updates.</li>
            <li><strong class="text-white">Relational DB Design:</strong> Eloquent relationships linking User, Product, Category, Cart, CartItem, Order, and OrderItem models.</li>
          </ul>
        </div>

        <div class="flex flex-wrap gap-4 pt-4 border-t border-border">
          <a href="https://github.com/akshada-03/AI-Assisted-E-commerce-Web-Application" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 bg-accent hover:bg-accentDark text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
            GitHub Repository ↗
          </a>
        </div>
      </div>
    `;
  } else if (projectId === "helpdesk") {
    modalContent.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span class="text-xs px-3 py-1 rounded-full bg-accent/15 text-accent font-semibold uppercase tracking-wider">Full Stack</span>
            <h3 class="font-display text-2xl font-bold text-white mt-2">Helpdesk — Ticket Management System</h3>
          </div>
        </div>

        <div>
          <h4 class="font-display font-semibold text-accent mb-2">Overview</h4>
          <p class="text-muted text-sm leading-relaxed">
            Helpdesk is a full-stack ticket management system structured as a monorepo featuring a React + TypeScript client frontend and an Express + TypeScript API backend running on the Bun runtime environment.
          </p>
        </div>

        <div>
          <h4 class="font-display font-semibold text-accent mb-2">Technology Stack</h4>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="px-2.5 py-1 rounded bg-border text-white">React</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">TypeScript</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Express API</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Bun Runtime</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Node.js</span>
            <span class="px-2.5 py-1 rounded bg-border text-white">Monorepo Architecture</span>
          </div>
        </div>

        <div>
          <h4 class="font-display font-semibold text-accent mb-2">Architecture Highlights</h4>
          <ul class="list-disc list-inside text-muted text-sm space-y-1.5 leading-relaxed">
            <li><strong class="text-white">Monorepo Structure:</strong> Separate <code class="text-accent text-xs">client/</code> and <code class="text-accent text-xs">server/</code> workspace directories with shared TypeScript configs.</li>
            <li><strong class="text-white">Bun Native Bundling:</strong> Client served via Bun's fast dev server with HMR and SPA fallback.</li>
            <li><strong class="text-white">Express REST API:</strong> Modular Express router serving JSON API endpoints with health check monitoring.</li>
          </ul>
        </div>

        <div class="flex flex-wrap gap-4 pt-4 border-t border-border">
          <a href="https://helpdesk-b8hm.onrender.com/" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 bg-accent hover:bg-accentDark text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
            Live Demo ↗
          </a>
          <a href="https://github.com/akshada-03/helpdesk" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 bg-border hover:bg-border/80 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
            GitHub Repository ↗
          </a>
        </div>
      </div>
    `;
  }

  projectModal.classList.add("active");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

window.closeProjectModal = function () {
  const projectModal = document.getElementById("project-modal");
  if (!projectModal) return;
  projectModal.classList.remove("active");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

document.addEventListener("DOMContentLoaded", () => {
  const modalCloseBtn = document.getElementById("modal-close");
  const projectModal = document.getElementById("project-modal");

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", window.closeProjectModal);
  }

  if (projectModal) {
    projectModal.addEventListener("click", (e) => {
      if (e.target === projectModal) {
        window.closeProjectModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && projectModal && projectModal.classList.contains("active")) {
      window.closeProjectModal();
    }
  });
});

