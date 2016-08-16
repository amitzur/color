
  function readFromHash(hash = location.hash.slice(1)) {
    if (hash) {
      var hash = hash.split("--").map(x => decodeURIComponent(x));
      setColorInStorage("left", tinycolor(hash[0]));
      setColorInStorage("right", tinycolor(hash[1]));
    }
  }

  readFromHash();

  ["left", "right"].forEach(function(side, i) {
    setDefaultValue("color-" + side, (i === 0 ? "greenyellow" : "yellowgreen"));
    setDefaultValue("color-" + side + "-text", "black");

    var el = window[side + "El"] = document.createElement("div");
    el.className = "x";
    el.setAttribute("data-side", side);
    el.setAttribute("tabindex", i+1);
    el.innerHTML = '<div contenteditable spellcheck="false"></div>' +
        '<div class="hex"></div>' +
        '<div class="rgb"></div>' +
        '<div class="hsl"></div>' +
        '<div class="name"></div>';

    document.body.appendChild(el);

    setColor(side);
    el.addEventListener("click", moveFocus);
  });

  pushToHistory();

  function setDefaultValue(key, value) {
    localStorage.setItem(key, localStorage.getItem(key) || value);
  }

  function setColorInStorage(side, color) {
      var text = color.getOriginalInput();
      localStorage.setItem("color-" + side, text);

      if (!tinycolor.isReadable(color, localStorage.getItem("color-" + side + "-text"))) {
        console.log("not readable: " + color.getOriginalInput() + "<->" + localStorage.getItem("color-" + side + "-text"));
        localStorage.setItem("color-" + side + "-text", tinycolor.mostReadable(text, ["#fff","#000"]).toHexString());
      }
  }

  document.addEventListener("input", function(e) {
    var el = e.target.parentNode,
        text = e.target.textContent,
        color = tinycolor(text),
        side = el.getAttribute("data-side");

    if (color.isValid()) {
      setColorInStorage(side, color);
      setColor(side);
      
      pushToHistory();
    }
  });

  document.addEventListener("keyup", function(e) {
    if (e.keyCode === 27) {
      setColor("left");
      setColor("right");
    }
  });

  function pushToHistory() {
    var leftColor = getColor("left"),
        rightColor = getColor("right"),
        state = [leftColor, rightColor];

    console.log("pushstate", state);

    history.pushState(state, "some page name", "#" + encodeURIComponent(leftColor) + "--" + encodeURIComponent(rightColor));
  }

  function moveFocus(e) {
    var el = e.target.querySelector("[contenteditable]");
    el && el.focus();
  }

  function getColor(side) {
    var el = getEditorEl(side);
    if (el) return el.textContent;
  }

  function getEl(side) {
    return document.querySelector("[data-side='" + side + "']");
  }

  function getEditorEl(side) {
    return document.querySelector("[data-side='" + side + "'] [contenteditable]");
  }

  function setColor(side) {
    var el = getEl(side),
        color = tinycolor(localStorage.getItem("color-" + side));

    var text = color.getOriginalInput();

    el.style.background = text;
    el.style.color = localStorage.getItem("color-" + side + "-text");
    el.querySelector(".hex").textContent = color.toHexString();
    el.querySelector(".rgb").textContent = color.toRgbString();
    el.querySelector(".hsl").textContent = color.toHslString();
    el.querySelector(".name").textContent = color.toName() || "";

    var editor = getEditorEl(side),
        currText = editor.textContent;

    editor.textContent = text;

    ga('send', 'event', 'color', 'setColor', text);
  }

  window.addEventListener("popstate", function(e) {
    console.log("popstate", e.state);
    if (!e.state) return;

    if (e.state[0]) setColorInStorage("left", tinycolor(e.state[0]));
    if (e.state[1]) setColorInStorage("right", tinycolor(e.state[1]));
    setColor("left");
    setColor("right");
  });

  window.addEventListener("hashchange", function() {
    readFromHash();
    setColor("left");
    setColor("right");
  });
