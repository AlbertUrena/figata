(() => {
  const grid = document.getElementById("mas-pedidas-grid");
  const template = document.getElementById("mas-pedidas-card-template");

  if (!grid || !(template instanceof HTMLTemplateElement)) {
    return;
  }

  const dash = "\u2014";
  const getHoverImageSrc = (src) => src.replace(/\.png$/i, "-hover.png");

  const cards = [
    {
      imageSrc: "assets/quattroformaggi.png",
      title: "Quattro Formaggi",
      description: "Una mezcla cremosa de cuatro quesos italianos en nuestra masa madre.",
      price: "RD$1,150.00",
    },
    ...Array.from({ length: 7 }, () => ({
      imageSrc: "",
      title: dash,
      description: dash,
      price: dash,
    })),
  ];

  const fragment = document.createDocumentFragment();

  cards.forEach((card) => {
    const node = template.content.cloneNode(true);
    const article = node.querySelector(".mas-pedidas-card");
    const media = node.querySelector(".mas-pedidas-card__media");
    const baseImage = node.querySelector(".mas-pedidas-card__image--base");
    const hoverImage = node.querySelector(".mas-pedidas-card__image--hover");
    const title = node.querySelector(".mas-pedidas-card__title");
    const description = node.querySelector(".mas-pedidas-card__description");
    const price = node.querySelector(".mas-pedidas-card__price");

    if (
      !article ||
      !media ||
      !baseImage ||
      !hoverImage ||
      !title ||
      !description ||
      !price
    ) {
      return;
    }

    const isPlaceholder = !card.imageSrc && card.title === dash;

    title.textContent = card.title;
    description.textContent = card.description;
    price.textContent = card.price;

    if (card.imageSrc) {
      const hoverSrc = getHoverImageSrc(card.imageSrc);

      baseImage.src = card.imageSrc;
      baseImage.alt = card.title;
      baseImage.loading = "lazy";
      baseImage.addEventListener("error", () => {
        baseImage.hidden = true;
        hoverImage.hidden = true;
        article.classList.remove("has-hover-image");
        media.classList.add("is-empty");
      });

      hoverImage.src = hoverSrc;
      hoverImage.alt = "";
      hoverImage.loading = "lazy";
      hoverImage.addEventListener("load", () => {
        if (!hoverImage.hidden) {
          article.classList.add("has-hover-image");
        }
      });
      hoverImage.addEventListener("error", () => {
        hoverImage.hidden = true;
        article.classList.remove("has-hover-image");
      });
    } else {
      baseImage.hidden = true;
      hoverImage.hidden = true;
      media.classList.add("is-empty");
    }

    if (isPlaceholder) {
      article.classList.add("is-placeholder");
    }

    fragment.appendChild(node);
  });

  grid.replaceChildren(fragment);
})();
