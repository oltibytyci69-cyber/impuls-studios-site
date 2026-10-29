const contentUrl = "/content/site.json";
let site;
let language = "sq";
let revealObserver;

const byId = (id) => document.getElementById(id);
const languageData = () => site.languages[language];
const textAt = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);

function setText(element, value) {
  if (!element || value == null) return;
  element.textContent = value;
}

function setLineBreakText(element, value) {
  if (!element || value == null) return;
  element.replaceChildren();
  value.split(/<br\s*\/?>/i).forEach((part, index) => {
    if (index) element.append(document.createElement("br"));
    element.append(document.createTextNode(part));
  });
}

function safeMediaUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  const url = value.trim();
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

function observeReveals() {
  const elements = document.querySelectorAll(".reveal:not([data-reveal-ready])");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
  }
  elements.forEach((element) => {
    element.dataset.revealReady = "true";
    revealObserver.observe(element);
  });
}

function updateWhatsAppLinks() {
  const number = site.brand.whatsapp.replace(/\D/g, "");
  const message = encodeURIComponent(languageData().whatsappMessage);
  document.querySelectorAll('[data-contact="whatsapp"]').forEach((link) => {
    link.href = `https://wa.me/${number}?text=${message}`;
  });
}

function updateContactLinks() {
  document.querySelectorAll('[data-contact="email"]').forEach((link) => {
    link.href = `mailto:${site.brand.email}`;
    if (link.childElementCount === 0) link.textContent = site.brand.email;
  });
  document.querySelectorAll('[data-contact="instagram"]').forEach((link) => {
    link.href = site.brand.instagram;
  });
}

function projectMediaUrl(item) {
  return safeMediaUrl(item.url) || safeMediaUrl(item.src);
}

function renderServices() {
  const list = byId("service-list");
  const checkboxList = byId("service-options-list");
  const selectedServices = new Set(
    [...checkboxList.querySelectorAll('input[name="services"]:checked')].map((checkbox) => checkbox.value)
  );
  list.replaceChildren();
  checkboxList.replaceChildren();

  const items = languageData().serviceItems;
  const checkboxGrid = document.createElement("div");
  checkboxGrid.className = "service-checkboxes";

  items.forEach((service, index) => {
    const row = document.createElement("article");
    row.className = "service-row";
    row.classList.add("reveal");
    row.innerHTML = "";

    const number = document.createElement("span");
    number.className = "service-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const title = document.createElement("h3");
    title.className = "service-title";
    title.textContent = service.title;

    const description = document.createElement("p");
    description.className = "service-description";
    description.textContent = service.description;

    const inquiryLink = document.createElement("a");
    inquiryLink.className = "service-link";
    inquiryLink.href = `https://wa.me/${site.brand.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`${languageData().whatsappMessage} ${service.title}`)}`;
    inquiryLink.target = "_blank";
    inquiryLink.rel = "noopener noreferrer";
    inquiryLink.setAttribute("aria-label", `${languageData().services.inquire}: ${service.title}`);
    inquiryLink.textContent = "↗";

    row.append(number, title, description, inquiryLink);
    list.append(row);

    const label = document.createElement("label");
    label.className = "check-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "services";
    checkbox.value = service.id;
    checkbox.checked = selectedServices.has(service.id);
    checkbox.setAttribute("aria-label", service.title);
    const labelText = document.createElement("span");
    labelText.textContent = service.title;
    label.append(checkbox, labelText);
    checkboxGrid.append(label);
  });

  checkboxList.append(checkboxGrid);
  observeReveals();
}

function projectText(project, key) {
  const value = project[key];
  if (typeof value === "string") return value;
  return value?.[language] || "";
}

function renderProjects() {
  const grid = byId("project-grid");
  const empty = byId("work-empty");
  grid.replaceChildren();
  const projects = (site.projects || []).filter((project) => {
    return project.published === true && safeMediaUrl(project.cover);
  });

  empty.hidden = projects.length > 0;
  projects.forEach((project) => {
    const imageUrl = safeMediaUrl(project.cover);
    const title = projectText(project, "title");
    const category = projectText(project, "category");
    const card = document.createElement("button");
    card.type = "button";
    card.className = "project-card reveal";
    card.setAttribute("aria-label", `${languageData().work.openProject}: ${title}`);

    const imageWrap = document.createElement("span");
    imageWrap.className = "project-image-wrap";
    const image = document.createElement("img");
    image.className = "project-image";
    image.src = imageUrl;
    image.alt = projectText(project, "alt") || title;
    image.loading = "lazy";
    image.decoding = "async";
    const imageLabel = document.createElement("span");
    imageLabel.className = "project-image-label";
    const categoryLabel = document.createElement("span");
    categoryLabel.textContent = category;
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    imageLabel.append(categoryLabel, arrow);
    imageWrap.append(image, imageLabel);

    const meta = document.createElement("span");
    meta.className = "project-meta";
    const heading = document.createElement("span");
    heading.className = "project-meta-title";
    heading.textContent = title;
    const client = project.client ? document.createElement("span") : null;
    if (client) client.textContent = project.client;
    meta.append(heading);
    if (client) meta.append(client);
    card.append(imageWrap, meta);
    card.addEventListener("click", () => openProject(project));
    grid.append(card);
  });

  observeReveals();
}

function openProject(project) {
  const dialog = byId("project-dialog");
  const mediaList = Array.isArray(project.media) ? project.media.filter((item) => projectMediaUrl(item)) : [];
  byId("dialog-category").textContent = projectText(project, "category");
  byId("dialog-title").textContent = projectText(project, "title");
  byId("dialog-description").textContent = projectText(project, "description");
  const gallery = byId("dialog-gallery");
  gallery.replaceChildren();

  mediaList.forEach((item) => {
    const url = projectMediaUrl(item);
    if (!url) return;
    if (item.type === "video") {
      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      const source = document.createElement("source");
      source.src = url;
      source.type = item.mimeType || "video/mp4";
      video.append(source);
      gallery.append(video);
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `${languageData().work.openMedia}: ${item.alt || projectText(project, "title")}`);
    const image = document.createElement("img");
    image.src = url;
    image.alt = item.alt || projectText(project, "title");
    image.loading = "lazy";
    image.decoding = "async";
    button.append(image);
    button.addEventListener("click", () => openMedia(url, image.alt));
    gallery.append(button);
  });

  dialog.showModal();
}

function openMedia(src, alt) {
  const view = byId("media-view");
  view.replaceChildren();
  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;
  view.append(image);
  byId("media-dialog").showModal();
}

function updateNavigation(activeLanguage) {
  const copy = languageData();
  document.documentElement.lang = copy.locale;
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = textAt(copy, element.dataset.copy);
    if (element.id === "hero-title" || element.id === "about-title" || element.id === "services-title" || element.id === "work-title" || element.id === "contact-title") {
      setLineBreakText(element, value);
    } else if (element.dataset.copy === "form.privacy") {
      const text = element.querySelector("[data-copy-text]");
      setText(text, value);
    } else {
      setText(element, value);
    }
  });

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.textContent = copy.nav[link.dataset.nav];
  });
  document.querySelectorAll(".menu-toggle").forEach((toggle) => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    const label = toggle.querySelector(".menu-toggle-label");
    setText(label, copy.nav.menu);
    toggle.setAttribute("aria-label", open ? copy.nav.menuClose : copy.nav.menuOpen);
  });
  document.querySelectorAll(".language-switch").forEach((switcher) => {
    switcher.setAttribute("aria-label", copy.nav.language);
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === activeLanguage));
  });

  document.querySelectorAll(".wordmark").forEach((mark) => {
    setText(mark, site.brand.name);
    mark.setAttribute("aria-label", `${site.brand.name} — ${copy.nav.about}`);
  });
  document.querySelectorAll(".copyright-name").forEach((label) => setText(label, site.brand.name));
  document.querySelector(".skip-link").setAttribute("href", "#main");
  setText(document.querySelector(".skip-link"), copy.nav.skip);
  document.querySelector(".skip-link").setAttribute("aria-label", copy.nav.skip);
  const pageMetadata = byId("privacy-title")
    ? copy.privacy
    : byId("not-found-title")
      ? copy.notFound
      : copy;
  const title = pageMetadata.metaTitle || copy.metaTitle;
  const description = pageMetadata.metaDescription || copy.metaDescription;
  document.title = title;
  document.querySelector('meta[name="description"]').content = description;
  document.querySelector('meta[property="og:title"]').content = title;
  document.querySelector('meta[property="og:description"]').content = description;
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) ogLocale.content = copy.locale;
  document.documentElement.setAttribute("lang", copy.locale);

  if (byId("privacy-title")) {
    setText(byId("privacy-title"), copy.privacy.title);
    ["intro", "submitted", "storage", "cookies", "rights"].forEach((key) => setText(byId(`privacy-${key}`), copy.privacy[key]));
  }
  if (byId("not-found-title")) {
    setText(byId("not-found-title"), copy.notFound.title);
    setText(byId("not-found-description"), copy.notFound.description);
    const homeLink = byId("not-found-home");
    setText(homeLink, copy.notFound.home);
    const arrow = document.createElement("span");
    arrow.className = "button-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    homeLink.append(arrow);
  }
  updateWhatsAppLinks();
  updateContactLinks();
  if (byId("service-list")) renderServices();
  if (byId("project-grid")) renderProjects();
  updateFormMessages();
}

function changeLanguage(nextLanguage) {
  if (!site.languages[nextLanguage]) return;
  language = nextLanguage;
  try {
    window.localStorage.setItem("impuls-language", language);
  } catch (error) {
    console.warn("The language preference could not be saved.", error);
  }
  updateNavigation(language);
}

function updateFormMessages() {
  const form = document.querySelector(".inquiry-form");
  if (!form) return;
  const copy = languageData();
  form.querySelectorAll('input[type="checkbox"][name="services"]').forEach((checkbox, index) => {
    const label = checkbox.closest("label");
    const labelText = copy.serviceItems[index]?.title;
    if (label && labelText) {
      setText(label.querySelector("span"), labelText);
      checkbox.setAttribute("aria-label", labelText);
      checkbox.value = copy.serviceItems[index].id;
    }
  });
}

function setupForm() {
  const form = document.querySelector(".inquiry-form");
  if (!form) return;
  const status = byId("form-status");
  const configurationNotice = byId("form-configuration");
  const localHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) || window.location.protocol === "file:";
  const deliveryConfigured = site.brand.formDeliveryConfigured === true;
  if (localHost || !deliveryConfigured) configurationNotice.hidden = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    if (!form.reportValidity()) return;

    const copy = languageData().form;
    if (!form.querySelector('input[name="services"]:checked')) {
      status.textContent = copy.requiredServices;
      form.querySelector(".service-options").scrollIntoView({ block: "center", behavior: "smooth" });
      form.querySelector('input[name="services"]')?.focus();
      return;
    }

    if (form.elements.namedItem("bot-field").value) return;
    if (localHost || !deliveryConfigured) {
      configurationNotice.hidden = false;
      status.textContent = languageData().form.configuration;
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    const originalButtonText = submitButton.querySelector("[data-copy]").textContent;
    submitButton.disabled = true;
    submitButton.querySelector("[data-copy]").textContent = copy.submitting;
    try {
      const payload = new URLSearchParams(new FormData(form));
      const response = await fetch(form.action || "/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString()
      });
      if (!response.ok) throw new Error(`Netlify form returned HTTP ${response.status}`);
      form.reset();
      status.textContent = copy.success;
    } catch (error) {
      console.error("The contact form could not be delivered.", error);
      status.textContent = copy.error;
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector("[data-copy]").textContent = originalButtonText;
    }
  });
}

function setupMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = byId("primary-nav");
  if (!toggle || !nav) return;
  const closeMenu = (returnFocus = false) => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-label", languageData().nav.menuOpen);
    if (returnFocus) toggle.focus();
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-label", open ? languageData().nav.menuClose : languageData().nav.menuOpen);
    if (open) nav.querySelector("a")?.focus();
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
}

function setupDialogs() {
  const projectDialog = byId("project-dialog");
  const mediaDialog = byId("media-dialog");
  document.querySelector("[data-close-dialog]")?.addEventListener("click", () => projectDialog.close());
  document.querySelector("[data-close-media]")?.addEventListener("click", () => mediaDialog.close());
  projectDialog?.addEventListener("click", (event) => {
    if (event.target === projectDialog) projectDialog.close();
  });
  mediaDialog?.addEventListener("click", (event) => {
    if (event.target === mediaDialog) mediaDialog.close();
  });
  mediaDialog?.addEventListener("close", () => byId("media-view").replaceChildren());
}

function setupHeaderAndYear() {
  byId("current-year")?.replaceChildren(document.createTextNode(String(new Date().getFullYear())));
  const header = document.querySelector(".site-header");
  const updateScrollState = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
}

function showContentError(error) {
  console.error("Site content could not be loaded.", error);
  const notice = document.createElement("p");
  notice.className = "init-error";
  notice.setAttribute("role", "alert");
  notice.textContent = "Site content could not be loaded. Check that content/site.json is available and reload the page.";
  document.querySelector(".site-header")?.after(notice);
}

async function initialize() {
  try {
    const response = await fetch(contentUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Content request returned HTTP ${response.status}`);
    site = await response.json();
    if (!site?.brand?.whatsapp || !site?.languages?.sq || !site?.languages?.en) {
      throw new Error("The site content is missing required brand or language data.");
    }
    language = site.brand.defaultLanguage in site.languages ? site.brand.defaultLanguage : "sq";
    try {
      const savedLanguage = window.localStorage.getItem("impuls-language");
      if (savedLanguage && site.languages[savedLanguage]) language = savedLanguage;
    } catch (error) {
      console.warn("The saved language preference could not be read.", error);
    }
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => changeLanguage(button.dataset.language));
    });
    updateNavigation(language);
    setupMenu();
    setupForm();
    setupDialogs();
    setupHeaderAndYear();
    observeReveals();
  } catch (error) {
    showContentError(error);
  }
}

initialize();
