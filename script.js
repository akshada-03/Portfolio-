
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
  "Web Developer Intern",
  "Frontend Learner",
  "Problem Solver",
  "Future Full-Stack Dev",
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

  // --- If all checks pass, simulate form submission ---
  if (isValid) {
    btnText.textContent = "Sending...";

    // TODO: Replace this setTimeout with a real fetch() call to your backend or
    // an email service like Formspree, EmailJS, or Web3Forms.
    setTimeout(() => {
      btnText.textContent = "Send Message";

      // Show success message
      successDiv.classList.remove("hidden");

      // Reset the form fields
      form.reset();

      // Remove success styling from inputs after reset
      ["name", "email", "message"].forEach((fieldId) => {
        document.getElementById(fieldId)?.classList.remove("success");
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => successDiv.classList.add("hidden"), 5000);
    }, 1500);
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
