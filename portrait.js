// Draws the dot portrait as real SVG <circle> elements (no image file).
(function () {
  var host = document.getElementById("portrait");
  var P = window.PORTRAIT;
  if (!host || !P) return;

  var NS = "http://www.w3.org/2000/svg";
  var R = 0.33;                       // same radius for every dot
  var ROW = 0.866;                    // hex packing
  var W = P.cols + 0.5, H = P.rows * ROW + 0.5;
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H.toFixed(2));
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Dot portrait of Abu Sulayman");

  // gray for levels 1..7: pale -> near black
  function gray(l) {
    var v = Math.round(225 - (225 - 8) * (l - 1) / 6);
    return "rgb(" + v + "," + v + "," + v + ")";
  }

  var n = 0;
  P.data.forEach(function (line, r) {
    for (var c = 0; c < line.length; c++) {
      var l = +line[c];
      if (!l) continue;
      var dot = document.createElementNS(NS, "circle");
      dot.setAttribute("cx", (c + 0.5 + (r % 2 ? 0.5 : 0)).toFixed(2));
      dot.setAttribute("cy", (r * ROW + 0.5).toFixed(2));
      dot.setAttribute("r", R);
      dot.setAttribute("fill", gray(l));
      dot.style.animationDelay = (r * 14) + "ms";
      svg.appendChild(dot);
      n++;
    }
  });

  host.appendChild(svg);
  var count = document.getElementById("dot-count");
  if (count) count.textContent = n.toLocaleString() + " dots";
})();
