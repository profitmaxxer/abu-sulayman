// Draws the dot portrait as live vector dots (SVG), batched per gray shade so it stays fast.
(function () {
  var host = document.getElementById("portrait");
  var P = window.PORTRAIT;
  if (!host || !P) return;

  var NS = "http://www.w3.org/2000/svg";
  var R = 0.33;                       // same radius for every dot
  var ROW = 0.866;                    // hex packing
  var W = P.cols + 0.5, H = P.rows * ROW + 0.5;
  var svg = document.createElementNS(NS, "svg");
  // data-view crops the portrait (e.g. to the head for the small avatar)
  svg.setAttribute("viewBox", host.getAttribute("data-view") || "0 0 " + W + " " + H.toFixed(2));
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Dot portrait of Abu Sulayman");

  // gray for levels 1..7: pale -> near black
  function gray(l) {
    var v = Math.round(225 - (225 - 8) * (l - 1) / 6);
    return "rgb(" + v + "," + v + "," + v + ")";
  }

  // one path per shade; each dot is a zero-length line drawn with a round cap
  var paths = {};
  P.data.forEach(function (line, r) {
    for (var c = 0; c < line.length; c++) {
      var l = +line[c];
      if (!l) continue;
      var x = (c + 0.5 + (r % 2 ? 0.5 : 0)).toFixed(2);
      var y = (r * ROW + 0.5).toFixed(2);
      paths[l] = (paths[l] || "") + "M" + x + " " + y + "h0";
    }
  });

  Object.keys(paths).forEach(function (l) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", paths[l]);
    p.setAttribute("stroke", gray(+l));
    p.setAttribute("stroke-width", R * 2);
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("fill", "none");
    svg.appendChild(p);
  });

  host.appendChild(svg);
})();
