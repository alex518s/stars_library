(() => {
  const pathSvg = document.querySelector(".every__path");
  const everySection = document.querySelector(".every");
  const title = everySection?.querySelector("h2");
  if (!pathSvg || !everySection || !title) return;

  const updateBeamOpacity = () => {
    const titleRect = title.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const titleCenter = titleRect.top + titleRect.height / 2;

    // Вычисляем расстояние от центра заголовка до центра экрана
    const distance = Math.abs(titleCenter - viewportCenter);

    // Максимальное расстояние, на котором свечение еще видно
    const maxDistance = window.innerHeight * 0.8;

    // Вычисляем proximity: 1 когда заголовок в центре, 0 когда далеко
    const proximity = Math.max(0, 1 - distance / maxDistance);

    // Минимальная яркость 0.3, максимальная - 0.8 вместо 1.0
    const minBrightness = 0.3;
    const maxBrightness = 0.6; // Максимальное значение яркости
    const curvePower = 0.6;

    // Интерполируем между minBrightness и maxBrightness
    const beamOpacity =
      minBrightness +
      (maxBrightness - minBrightness) * Math.pow(proximity, curvePower);

    pathSvg.style.setProperty("--beam-opacity", beamOpacity.toFixed(2));

    const maxBrightnessStar = 1
    const starOpacity =
      minBrightness +
      (maxBrightnessStar - minBrightness) * Math.pow(proximity, curvePower);

    pathSvg.style.setProperty("--beam-opacity", beamOpacity.toFixed(2));
    pathSvg.style.setProperty("--star-opacity", starOpacity.toFixed(2));
  };

  updateBeamOpacity();
  window.addEventListener("scroll", updateBeamOpacity, { passive: true });
  window.addEventListener("resize", updateBeamOpacity);
})();

(() => {
  const door = document.querySelector(".every__door");
  if (!door) return;

  const minScale = 0.4;
  const maxScale = 1;

  const updateDoorScale = () => {
    const rect = door.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const doorCenter = rect.top + rect.height / 2;
    const distance = Math.abs(doorCenter - viewportCenter);
    const maxDistance = window.innerHeight * 1.2;
    const proximity = 1 - Math.min(distance / maxDistance, 1);
    const scale = minScale + (maxScale - minScale) * proximity;
    door.style.setProperty("--door-scale", scale.toFixed(3));
  };

  updateDoorScale();
  window.addEventListener("scroll", updateDoorScale, { passive: true });
  window.addEventListener("resize", updateDoorScale);
})();

(() => {
  const personText = document.querySelector(".person p");
  if (!personText) return;

  const updateTextOpacity = () => {
    const rect = personText.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const textCenter = rect.top + rect.height / 2;
    const distance = Math.abs(textCenter - viewportCenter);
    const maxDistance = window.innerHeight * 0.8;
    const proximity = Math.max(0, 1 - distance / maxDistance);
    personText.style.opacity = proximity;
  };

  updateTextOpacity();
  window.addEventListener("scroll", updateTextOpacity, { passive: true });
  window.addEventListener("resize", updateTextOpacity);
})();

(() => {
  const stage1 = document.querySelector(".book__star-book-1");
  const stage2 = document.querySelector(".book__star-book-2");
  const stage3 = document.querySelector(".book__star-book-3");
  const bookContainer = document.querySelector(".book");
  if (!stage1 || !stage2 || !stage3 || !bookContainer) return;

  const baseSizes = {
    stage1: { width: 78, height: 72 },
    stage2: { width: 100, height: 93 },
    stage3Start: { width: 193 * 1.5, height: 171 * 1.5 },
    stage3End: { width: 367 * 1.5, height: 325 * 1.5 },
  };

  const mobileSizes = {
    stage1: { width: 48, height: 40 },
    stage2: { width: 60, height: 53 },
    stage3Start: { width: 60 * 1.5, height: 53 * 1.5 },
    stage3End: { width: 92 * 1.5, height: 81 * 1.5 },
  };

  const tintedFilter =
    "brightness(0) saturate(100%) invert(89%) sepia(46%) saturate(450%) hue-rotate(336deg) brightness(103%) contrast(101%)";

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const getSizes = () => {
    return window.innerWidth < 500 ? mobileSizes : baseSizes;
  };

  const updateBookContainerHeight = () => {
    const sizes = getSizes();
    const maxBookHeight = sizes.stage3End.height;
    const padding = window.innerWidth < 500 ? 38 : 154; // отступы сверху и снизу
    const minHeight = padding + maxBookHeight + padding;
    bookContainer.style.minHeight = `${minHeight}px`;
  };

  const updateBookStar = () => {
    const sizes = getSizes();
    const rect = stage1.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const starCenter = rect.top + rect.height / 2;
    const distance = Math.abs(starCenter - viewportCenter);
    const maxDistance = window.innerHeight * 0.9;
    const proximity = clamp(1 - distance / maxDistance, 0, 1);

    // Stage 1: видна до 50%, затем исчезает
    let stage1Opacity = 0;
    if (proximity < 0.5) {
      stage1Opacity = 1 - proximity / 0.5;
    }

    // Stage 2: появляется на 50% (середина), исчезает к 75%
    let stage2Opacity = 0;
    if (proximity >= 0.5 && proximity < 0.75) {
      stage2Opacity = 1 - (proximity - 0.5) / 0.25;
    }

    // Stage 3: появляется на 75% с размерами 193x171, увеличивается до максимального размера на 100%
    let stage3Opacity = 0;
    if (proximity >= 0.75) {
      stage3Opacity = 1;
    }

    const lerp = (from, to, t) => from + (to - from) * t;
    const sizeForStage3 = (() => {
      if (proximity < 0.75) return sizes.stage3Start;
      const t = clamp((proximity - 0.75) / 0.25, 0, 1);
      return {
        width: lerp(sizes.stage3Start.width, sizes.stage3End.width, t),
        height: lerp(sizes.stage3Start.height, sizes.stage3End.height, t),
      };
    })();

    const applyState = (el, opacity, size, filter = "none") => {
      el.style.opacity = opacity.toFixed(2);
      el.style.width = `${size.width.toFixed(2)}px`;
      el.style.height = `${size.height.toFixed(2)}px`;
      el.style.filter = filter;
    };

    const bookGlowFilter =
      stage3Opacity > 0
        ? "drop-shadow(0 0 20px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 60px rgba(255, 255, 255, 0.2))"
        : "none";

    applyState(stage1, stage1Opacity, sizes.stage1);
    applyState(stage2, stage2Opacity, sizes.stage2, tintedFilter);
    applyState(stage3, stage3Opacity, sizeForStage3, bookGlowFilter);
  };

  updateBookContainerHeight();
  updateBookStar();
  window.addEventListener("scroll", updateBookStar, { passive: true });
  window.addEventListener("resize", () => {
    updateBookContainerHeight();
    updateBookStar();
  });
})();

// Управление прозрачностью текста в SVG-элементе section.person
(() => {
  const textElement = document.querySelector("#knowledge-text");
  if (!textElement) return;

  const updateTextOpacity = () => {
    // Получаем позицию SVG-изображения в теле документа
    const svgImage = document.querySelector(".person__people");
    if (!svgImage) return;

    const rect = svgImage.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const elementCenter = rect.top + rect.height / 2;

    // Вычисляем расстояние от центра элемента до центра экрана
    const distance = Math.abs(elementCenter - viewportCenter);

    // Максимальное расстояние для полного затухания
    const maxDistance = window.innerHeight * 0.6;

    // Вычисляем proximity: 1 в центре, 0 далеко
    const proximity = Math.max(0, 1 - distance / maxDistance);

    // Прозрачность: от 0.5 (серый) в краях до 1.0 (белый) в центре
    const opacity = 0.1 + proximity * 0.5;

    textElement.setAttribute("opacity", opacity.toFixed(2));
  };

  updateTextOpacity();
  window.addEventListener("scroll", updateTextOpacity, { passive: true });
  window.addEventListener("resize", updateTextOpacity);
})();
