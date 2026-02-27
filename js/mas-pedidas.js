(() => {
  const grid = document.getElementById("mas-pedidas-grid");
  const template = document.getElementById("mas-pedidas-card-template");

  if (!grid || !(template instanceof HTMLTemplateElement)) {
    return;
  }

  const getHoverImageSrc = (src) => src.replace(/\.png$/i, "-hover.png");

  const cards = [
    {
      slug: "quattroformaggi",
      title: "Quattro Formaggi",
      description:
        "Una mezcla cremosa y poderosa de cuatro quesos italianos que se funden en cada bocado.",
      price: "RD$1,150.00",
    },
    {
      slug: "margherita",
      title: "Margherita",
      description:
        "La reina napolitana. Pomodoro San Marzano, mozzarella fresca y albahaca sobre masa madre.",
      price: "RD$600.00",
    },
    {
      slug: "sourdough-ciabatta",
      title: "Sourdough Ciabatta",
      description:
        "Pan de masa madre crujiente por fuera, suave por dentro. Ideal para compartir...",
      price: "RD$200.00",
    },
    {
      slug: "tiramisu",
      title: "Tiramisú",
      description:
        "Capas delicadas de café y mascarpone que se deshacen suavemente. El final perfecto, al estilo italiano.",
      price: "RD$350.00",
    },
    {
      slug: "diavola",
      title: "Diavola",
      description:
        "Salammino piccante y mozzarella fundida sobre pomodoro vibrante. Un delicioso toque picante.",
      price: "RD$850.00",
    },
    {
      slug: "bruschetta",
      title: "Bruschetta",
      description:
        "Pan tostado de masa madre con tomate fresco y pesto. Ligera, fresca y llena de sabor mediterráneo.",
      price: "RD$500.00",
    },
    {
      slug: "schiacciata-sandwich",
      title: "Schiacciata sándwich",
      description:
        "Crujiente, generosa y llena de carácter. Una combinación irresistible entre tradición y street food.",
      price: "RD$950.00",
    },
    {
      slug: "margherita-sbagliata",
      title: "Margherita Sbagliata",
      description:
        "La versión intensa de la clásica. Más sabor, más personalidad, más Figata.",
      price: "RD$750.00",
    },
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

    title.textContent = card.title;
    description.textContent = card.description;
    price.textContent = card.price;

    const imageSrc = card.slug ? `assets/${card.slug}.png` : "";

    if (imageSrc) {
      const hoverSrc = getHoverImageSrc(imageSrc);

      baseImage.src = imageSrc;
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

    fragment.appendChild(node);
  });

  grid.replaceChildren(fragment);
})();
