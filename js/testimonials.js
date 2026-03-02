(() => {
  const grid = document.getElementById("testimonials-grid");
  const template = document.getElementById("testimonial-card-template");

  if (!grid || !(template instanceof HTMLTemplateElement)) {
    return;
  }

  const columns = Array.from(grid.querySelectorAll(".column"));

  if (!columns.length) {
    return;
  }

  const testimonials = [
    {
      column: 0,
      quote:
        "We ordered for delivery, it was 10 out of 10 it’s the best pizza I have tried in Santo Domingo! Great ingredients, real Neapolitan pizza from wood oven! Also I was surprised to see the message in the pizza box, little details that makes the difference.",
      name: "Awilda Suero",
      avatarSrc: "/assets/awilda.png",
      rating: 5,
    },
    {
      column: 0,
      quote:
        "Sus pizzas son excelentes, hechas con ingredientes de alta calidad, estilo napolitano auténtico, tienen una amplia selección de cervezas a elegir y probar. El local tiene un muy buen ambiente.",
      name: "Fabio Reyes",
      avatarSrc: "/assets/fabio.png",
      rating: 5,
    },
    {
      column: 0,
      quote:
        "La pizza es artesanal para los amantes de este tipo, es un lugar pequeño pero bien distribuido, si te gusta probar cervezas diferentes es el lugar de elección. Parqueo limitado",
      name: "Karla Villar",
      avatarSrc: "/assets/karla.png",
      rating: 4,
    },
    {
      column: 1,
      quote:
        "Tienen una variedad deliciosa e interesante de pizza y unas berengenas riquísimas. El café es muy rico y tienen variedad de cócteles.",
      name: "Liecel Franco",
      avatarSrc: "/assets/liecel.png",
      rating: 5,
    },
    {
      column: 1,
      quote:
        "Es la mejor pizza napolitana que he probado, textura y grosor perfecto, no era ni muy finita ni muy gordita la masa, era perfecta. Llena bastante. Tienen una gran variedad de cervezas y vinos. Probamos la sweet goat y la de burrata con pesto y prosciutto, excelentes las dos. Volvería una y mil veces. 😻🥰",
      name: "Prysla Rodríguez",
      avatarSrc: "/assets/prysla.png",
      rating: 5,
    },
    {
      column: 1,
      quote:
        "Al abrir la puerta el rico olor a pizza te invita a continuar y tomar asiento, el servicio es excepcional y las pizzas espectaculares.",
      name: "Angel Tejeda Piña",
      avatarSrc: "/assets/angel.png",
      rating: 5,
    },
    {
      column: 2,
      quote:
        "Mi resturante favorito en Santo Domingo Este, las pizzas son buenisimas, excelente servicio y ambiente. El take out tambien funciona de maravilla. 10/10 en todo! Recomendadisimo.",
      name: "Massiel Beltre",
      avatarSrc: "/assets/massiel.png",
      rating: 5,
    },
    {
      column: 2,
      quote:
        "10/10 Un cóctel riquísimo, pizzas que wow, llenas de sabor con una auténtica masa que te transporta y el tiramisu DIOS MIO QUE BUENO!! He probado 3 pizzas y todas me han encantado. Los recomiendo 100%",
      name: "Vianneris Morillo",
      avatarSrc: "/assets/vianneris.png",
      rating: 5,
    },
    {
      column: 2,
      quote:
        "Their pizzas are awesome and very good value. They also have a great beer selection to accompany your pizzas. Staff is very attentive and has a great disposition, service was very good across all the times I’ve visited. Try their Sweet Goat and Figata pizzas.\n\nThey have espanded seating lately, but parking can still be an issue sometimes as the spot the restaurant is in has few slots available.\n\nThey are also available for takeout and delivery using PedidosYa and similar.",
      name: "Ricardo Restituyo",
      avatarSrc: "/assets/ricardo.png",
      rating: 5,
    },
  ];

  const getColumnCount = () => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;

    if (viewportWidth <= 760) {
      return 1;
    }

    if (viewportWidth <= 1200) {
      return 2;
    }

    return 3;
  };

  const createStars = (container, rating) => {
    if (!container) {
      return;
    }

    const safeRating = Number.isFinite(rating)
      ? Math.max(0, Math.min(5, Math.round(rating)))
      : 5;

    container.setAttribute("aria-label", `${safeRating} out of 5 stars`);

    const stars = document.createDocumentFragment();

    for (let index = 0; index < 5; index += 1) {
      const star = document.createElement("img");
      star.className = index < safeRating ? "star" : "star star--muted";
      star.src = "assets/star.svg";
      star.alt = "";
      star.width = 16;
      star.height = 16;
      star.loading = "lazy";
      star.setAttribute("aria-hidden", "true");
      stars.appendChild(star);
    }

    container.replaceChildren(stars);
  };

  const createCard = (item) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".card");
    const text = node.querySelector(".card-text");
    const avatar = node.querySelector(".avatar");
    const name = node.querySelector(".user-name");
    const role = node.querySelector(".user-role");
    const stars = node.querySelector(".stars");

    if (!card || !text || !avatar || !name || !role || !stars) {
      return null;
    }

    text.textContent = item.quote;
    name.textContent = item.name;
    role.textContent = "Local Guide";
    createStars(stars, item.rating);

    if (item.avatarSrc) {
      const image = document.createElement("img");
      image.src = item.avatarSrc;
      image.alt = `${item.name} avatar`;
      image.loading = "lazy";
      image.addEventListener("error", () => {
        image.remove();
      });
      avatar.appendChild(image);
    }

    return node;
  };

  const render = () => {
    const columnCount = Math.min(getColumnCount(), columns.length);
    const fragments = columns.map(() => document.createDocumentFragment());

    columns.forEach((column, index) => {
      column.hidden = index >= columnCount;
      column.replaceChildren();
    });

    grid.style.setProperty("--testimonials-columns", String(columnCount));

    if (columnCount === 3) {
      testimonials.forEach((item) => {
        const targetColumn = Number.isInteger(item.column)
          ? Math.max(0, Math.min(2, item.column))
          : 0;
        const card = createCard(item);

        if (!card) {
          return;
        }

        fragments[targetColumn].appendChild(card);
      });
    } else {
      let targetColumn = 0;

      testimonials.forEach((item) => {
        const card = createCard(item);

        if (!card) {
          return;
        }

        fragments[targetColumn].appendChild(card);
        targetColumn = (targetColumn + 1) % columnCount;
      });
    }

    for (let index = 0; index < columnCount; index += 1) {
      columns[index].replaceChildren(fragments[index]);
    }
  };

  let resizeFrame = 0;

  window.addEventListener(
    "resize",
    () => {
      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        render();
      });
    },
    { passive: true }
  );

  render();
})();
