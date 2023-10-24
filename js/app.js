var url = window.location.href;
var swLocation = "/xdebate/sw.js";

var swReg;

if (navigator.serviceWorker) {
  if (url.includes("localhost")) {
    swLocation = "/sw.js";
  }

  //   window.addEventListener("load", function () {
  //     navigator.serviceWorker.register(swLocation).then(function (reg) {
  //       swReg = reg;
  //       swReg.pushManager.getSubscription().then(verificaSuscripcion);
  //     });
  //     console.log("[evt: load] sw registrado");
  //   });
}

if (
  "serviceWorker" in navigator &&
  window.matchMedia("(display-mode: standalone)").matches
) {
  // La app ya está instalada, ocultar el botón.
  document.getElementById("installButton").style.display = "none";
} else {
  // La app no está instalada, mostrar el botón.
  const installButton = document.getElementById("installButton");
  installButton.addEventListener("click", function () {
    navigator.serviceWorker.register(swLocation).then(function (reg) {
      swReg = reg;
      document.getElementById("installButton").style.display = "none";
      console.log("[evt: load] sw registrado");
    });
  });
}

var googleMapKey = "AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8";
var titulo = $("#titulo");
var nuevoBtn = $("#nuevo-btn");
var salirBtn = $("#salir-btn");
var cancelarBtn = $("#cancel-btn");
var postBtn = $("#post-btn");
var avatarSel = $("#seleccion");
var timeline = $("#timeline");

var modal = $("#modal");
var modalAvatar = $("#modal-avatar");
var avatarBtns = $(".seleccion-avatar");
var txtMensaje = $("#txtMensaje");

var btnActivadas = $(".btn-noti-activadas");
var btnDesactivadas = $(".btn-noti-desactivadas");

var btnLocation = $("#location-btn");

var modalMapa = $(".modal-mapa");

var btnTomarFoto = $("#tomar-foto-btn");
var btnPhoto = $("#photo-btn");

var lat = null;
var lng = null;
var foto = null;

var usuario;

function crearMensajeHTML(mensaje, personaje, lat, lng, foto) {

  var content = `
    <li class="animated fadeIn fast"
        data-user="${personaje}"
        data-mensaje="${mensaje}"
        data-tipo="mensaje">


        <div class="avatar">
            <img src="img/avatars/${personaje}.png">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${personaje}</h3>
                <br/>
                ${mensaje}
                `;

  if (foto) {
    content += `
                <br>
                <img class="foto-mensaje" src="${foto}">
        `;
  }

  content += `</div>        
                <div class="arrow"></div>
            </div>
        </li>
    `;

  if (lat) {
    crearMensajeMapa(lat, lng, personaje);
  }
  lat = null;
  lng = null;

  $(".modal-mapa").remove();

  timeline.prepend(content);
  cancelarBtn.click();
}

function crearMensajeMapa(lat, lng, personaje) {
  let content = `
    <li class="animated fadeIn fast"
        data-tipo="mapa"
        data-user="${personaje}"
        data-lat="${lat}"
        data-lng="${lng}">
                <div class="avatar">
                    <img src="img/avatars/${personaje}.jpg">
                </div>
                <div class="bubble-container">
                    <div class="bubble">
                        <iframe
                            width="100%"
                            height="250"
                            frameborder="0" style="border:0"
                            src="https://www.google.com/maps/embed/v1/view?key=${googleMapKey}&center=${lat},${lng}&zoom=17" allowfullscreen>
                            </iframe>
                    </div>
                    
                    <div class="arrow"></div>
                </div>
            </li> 
    `;

  timeline.prepend(content);
}

function logIn(ingreso) {
  if (ingreso) {
    nuevoBtn.removeClass("oculto");
    salirBtn.removeClass("oculto");
    timeline.removeClass("oculto");
    avatarSel.addClass("oculto");
    modalAvatar.attr("src", "img/avatars/" + usuario + ".jpg");
  } else {
    nuevoBtn.addClass("oculto");
    salirBtn.addClass("oculto");
    timeline.addClass("oculto");
    avatarSel.removeClass("oculto");

    titulo.text("Seleccione Personaje");
  }
}

avatarBtns.on("click", function () {
  usuario = $(this).data("user");

  titulo.text("@" + usuario);

  logIn(true);
});

salirBtn.on("click", function () {
  logIn(false);
});

nuevoBtn.on("click", function () {
  modal.removeClass("oculto");
  modal.animate(
    {
      marginTop: "-=1000px",
      opacity: 1,
    },
    200
  );
});

cancelarBtn.on("click", function () {
  if (!modal.hasClass("oculto")) {
    modal.animate(
      {
        marginTop: "+=1000px",
        opacity: 0,
      },
      200,
      function () {
        modal.addClass("oculto");
        modalMapa.addClass("oculto");
        txtMensaje.val("");
      }
    );
  }
});

postBtn.on("click", function () {
  var mensaje = txtMensaje.val();
  if (mensaje.length === 0) {
    cancelarBtn.click();
    return;
  }

  var data = {
    mensaje: mensaje,
    user: usuario,
    lat: lat,
    lng: lng,
    foto: foto,
  };

  fetch("api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => console.log("app.js", res))
    .catch((err) => console.log("app.js error:", err));

  crearMensajeHTML(mensaje, usuario, lat, lng, foto);

  foto = null;
});

function getMensajes() {
  fetch("api")
    .then((res) => res.json())
    .then((posts) => {

      posts.forEach((post) =>
        crearMensajeHTML(post.mensaje, post.user, post.lat, post.lng, post.foto)
      );
    });
}

getMensajes();

// Detectar cambios de conexión
function isOnline() {
  if (navigator.onLine) {
    // tenemos conexión
    // console.log('online');
    $.mdtoast("Online", {
      interaction: true,
      interactionTimeout: 1000,
      actionText: "OK!",
    });
  } else {
    // No tenemos conexión
    $.mdtoast("Offline", {
      interaction: true,
      actionText: "OK",
      type: "warning",
    });
  }
}

window.addEventListener("online", isOnline);
window.addEventListener("offline", isOnline);

isOnline();

// Crear mapa en el modal
function mostrarMapaModal(lat, lng) {
  $(".modal-mapa").remove();

  var content = `
            <div class="modal-mapa">
                <iframe
                    width="100%"
                    height="250"
                    frameborder="0"
                    src="https://www.google.com/maps/embed/v1/view?key=${googleMapKey}&center=${lat},${lng}&zoom=17" allowfullscreen>
                    </iframe>
            </div>
    `;

  modal.append(content);
}

btnLocation.on("click", () => {
  $.mdtoast("Cargando mapa...", {
    interaction: true,
    interactionTimeout: 2000,
    actionText: "Ok!",
  });

  navigator.geolocation.getCurrentPosition((pos) => {
    console.log(pos);
    mostrarMapaModal(pos.coords.latitude, pos.coords.longitude);

    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
  });
});


// Share API

// if ( navigator.share ) {
//     console.log('Navegador lo soporta');
// } else {
//     console.log('Navegador NO lo soporta');
// }

timeline.on("click", "li", function () {

  let tipo = $(this).data("tipo");
  let lat = $(this).data("lat");
  let lng = $(this).data("lng");
  let mensaje = $(this).data("mensaje");
  let user = $(this).data("user");

  console.log({ tipo, lat, lng, mensaje, user });

  const shareOpts = {
    title: user,
    text: mensaje,
  };

  if (tipo === "mapa") {
    shareOpts.text = "Mapa";
    shareOpts.url = `https://www.google.com/maps/@${lat},${lng},15z`;
  }

  navigator
    .share(shareOpts)
    .then(() => console.log("Successful share"))
    .catch((error) => console.log("Error sharing", error));
});
