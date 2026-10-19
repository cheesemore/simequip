(function (root) {
  function url(part, level) {
    var data = root.PET_DATA;
    return encodeURI("icons/按名字/" + level + "级" + data.parts[part] + "-" + data.names[part][level] + ".png");
  }

  root.PetIcons = { url: url };
})(typeof window !== "undefined" ? window : globalThis);
