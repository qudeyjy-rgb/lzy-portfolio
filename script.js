const header = document.querySelector("[data-header]");
const scrollTopButton = document.querySelector("[data-scroll-top]");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const carouselCards = Array.from(document.querySelectorAll("[data-carousel-card]"));
const workCarousel = document.querySelector(".work-carousel");
const workPrev = document.querySelector("[data-work-prev]");
const workNext = document.querySelector("[data-work-next]");
const carouselCurrent = document.querySelector("[data-carousel-current]");
const carouselProgressLine = document.querySelector("[data-progress-line]");
const projectGalleryItems = Array.from(document.querySelectorAll(".project-gallery-item"));
const projectDetails = Array.from(document.querySelectorAll("[data-project-detail]"));
const siteVideos = Array.from(document.querySelectorAll("video"));
const galleryLightbox = document.querySelector("[data-gallery-lightbox]");
const galleryLightboxImage = document.querySelector("[data-gallery-lightbox-image]");
const galleryLightboxVideo = document.querySelector("[data-gallery-lightbox-video]");
const galleryLightboxPlaceholder = document.querySelector("[data-gallery-lightbox-placeholder]");
const galleryLightboxClose = document.querySelector("[data-gallery-lightbox-close]");

let activeWorkIndex = 0;
let carouselPointerId = null;
let carouselDragStartX = 0;
let carouselDragStartY = 0;
let suppressCarouselClick = false;

const prepareVideoForAutoplay = (video) => {
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
};

const videoCanPlayInView = (video) => {
  if (document.hidden || video.closest("[hidden]") || video.hidden) return false;

  const rect = video.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  );
};

const playVisibleVideos = () => {
  siteVideos.forEach((video) => {
    if (!videoCanPlayInView(video)) return;
    video.play().catch(() => {});
  });
};

const updateHeader = () => {
  if (!header) return;
  header.style.boxShadow =
    window.scrollY > 12 ? "0 14px 38px rgba(0, 0, 0, 0.48)" : "none";
};

const updateCarousel = () => {
  const total = carouselCards.length;
  if (!total) return;

  activeWorkIndex = (activeWorkIndex + total) % total;
  const activeCategory = carouselCards[activeWorkIndex]?.dataset.category || "all";

  carouselCards.forEach((card, index) => {
    const distance = (index - activeWorkIndex + total) % total;
    card.classList.remove(
      "is-active",
      "is-prev",
      "is-next",
      "is-far-prev",
      "is-far-next",
      "is-hidden-slide",
    );

    if (distance === 0) {
      card.classList.add("is-active");
    } else if (distance === 1) {
      card.classList.add("is-next");
    } else if (distance === total - 1) {
      card.classList.add("is-prev");
    } else if (distance === 2) {
      card.classList.add("is-far-next");
    } else if (distance === total - 2) {
      card.classList.add("is-far-prev");
    } else {
      card.classList.add("is-hidden-slide");
    }
  });

  if (carouselCurrent) {
    carouselCurrent.textContent = String(activeWorkIndex + 1);
  }

  if (carouselProgressLine) {
    carouselProgressLine.style.width = `${((activeWorkIndex + 1) / total) * 100}%`;
  }

  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === activeCategory);
  });
};

const setFilter = (category = "all") => {
  const matchingIndex =
    category === "all"
      ? 0
      : carouselCards.findIndex((card) => card.dataset.category === category);

  activeWorkIndex = matchingIndex >= 0 ? matchingIndex : 0;

  updateCarousel();
};

const revealProjectDetail = (targetId) => {
  if (!targetId) return;
  const detail = document.getElementById(targetId);
  if (!detail) return;

  projectDetails.forEach((section) => {
    if (section === detail) return;
    section.hidden = true;
    section.classList.add("is-hidden");
  });

  detail.hidden = false;
  detail.classList.remove("is-hidden");

  requestAnimationFrame(() => {
    detail.scrollIntoView({ behavior: "smooth", block: "start" });
    playVisibleVideos();
  });
};

const openGalleryLightbox = (item) => {
  if (!galleryLightbox || !galleryLightboxImage || !galleryLightboxVideo || !galleryLightboxPlaceholder) {
    return;
  }
  const image = item.querySelector("img");
  const video = item.querySelector("video");

  galleryLightboxImage.hidden = true;
  galleryLightboxVideo.hidden = true;
  galleryLightboxPlaceholder.hidden = true;
  galleryLightboxImage.removeAttribute("src");
  galleryLightboxVideo.pause();
  galleryLightboxVideo.removeAttribute("src");
  galleryLightboxVideo.load();

  if (image) {
    galleryLightboxImage.src = image.currentSrc || image.src;
    galleryLightboxImage.alt = image.alt || "";
    galleryLightboxImage.hidden = false;
  } else if (video) {
    galleryLightboxVideo.src = video.currentSrc || video.src;
    galleryLightboxVideo.hidden = false;
    galleryLightboxVideo.play().catch(() => {});
  } else {
    galleryLightboxPlaceholder.textContent = item.textContent.trim() || "IMAGE SLOT";
    galleryLightboxPlaceholder.hidden = false;
  }

  galleryLightbox.hidden = false;
  galleryLightbox.setAttribute("aria-hidden", "false");
  playVisibleVideos();
};

const closeGalleryLightbox = () => {
  if (!galleryLightbox || !galleryLightboxImage || !galleryLightboxVideo || !galleryLightboxPlaceholder) {
    return;
  }

  galleryLightbox.hidden = true;
  galleryLightbox.setAttribute("aria-hidden", "true");
  galleryLightboxImage.removeAttribute("src");
  galleryLightboxImage.hidden = true;
  galleryLightboxImage.alt = "";
  galleryLightboxVideo.pause();
  galleryLightboxVideo.removeAttribute("src");
  galleryLightboxVideo.hidden = true;
  galleryLightboxVideo.load();
  galleryLightboxPlaceholder.hidden = true;
};

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("scroll", playVisibleVideos, { passive: true });
window.addEventListener("resize", playVisibleVideos);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) playVisibleVideos();
});

siteVideos.forEach(prepareVideoForAutoplay);

if ("IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || !videoCanPlayInView(entry.target)) return;
        entry.target.play().catch(() => {});
      });
    },
    { threshold: 0.16 },
  );

  siteVideos.forEach((video) => videoObserver.observe(video));
}

updateHeader();
setFilter("all");
playVisibleVideos();

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filter || "all");
  });
});

workPrev?.addEventListener("click", () => {
  activeWorkIndex -= 1;
  updateCarousel();
});

workNext?.addEventListener("click", () => {
  activeWorkIndex += 1;
  updateCarousel();
});

workCarousel?.addEventListener("pointerdown", (event) => {
  carouselPointerId = event.pointerId;
  carouselDragStartX = event.clientX;
  carouselDragStartY = event.clientY;
  workCarousel.classList.add("is-dragging");
  workCarousel.setPointerCapture?.(event.pointerId);
});

const finishCarouselDrag = (event) => {
  if (carouselPointerId !== event.pointerId) return;

  const deltaX = event.clientX - carouselDragStartX;
  const deltaY = event.clientY - carouselDragStartY;
  const isHorizontalSwipe = Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY);

  workCarousel?.classList.remove("is-dragging");
  workCarousel?.releasePointerCapture?.(event.pointerId);
  carouselPointerId = null;

  if (!isHorizontalSwipe) return;

  suppressCarouselClick = true;
  activeWorkIndex += deltaX < 0 ? 1 : -1;
  updateCarousel();

  window.setTimeout(() => {
    suppressCarouselClick = false;
  }, 160);
};

workCarousel?.addEventListener("pointerup", finishCarouselDrag);
workCarousel?.addEventListener("pointercancel", (event) => {
  if (carouselPointerId !== event.pointerId) return;
  workCarousel.classList.remove("is-dragging");
  carouselPointerId = null;
});

carouselCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    if (suppressCarouselClick) return;
    activeWorkIndex = index;
    updateCarousel();
    revealProjectDetail(card.dataset.detailTarget);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activeWorkIndex = index;
    updateCarousel();
    revealProjectDetail(card.dataset.detailTarget);
  });
});

projectGalleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    openGalleryLightbox(item);
  });

  item.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    item.click();
  });
});

galleryLightbox?.addEventListener("click", (event) => {
  closeGalleryLightbox();
});

galleryLightboxClose?.addEventListener("click", () => {
  closeGalleryLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeGalleryLightbox();
});

scrollTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
