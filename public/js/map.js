document.addEventListener("DOMContentLoaded", function () {
  const mapElement = document.getElementById("map");
  const lat = parseFloat(mapElement.getAttribute("data-lat"));
  const lng = parseFloat(mapElement.getAttribute("data-lng"));
  const title = mapElement.getAttribute("data-title");

  const map = L.map("map").setView([lat, lng], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  L.marker([lat, lng]).addTo(map)
    .bindPopup(title)
    .openPopup();
});