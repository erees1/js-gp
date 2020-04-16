// --------------------
// GP Chart
// --------------------

function makeGPChart(ctx) {
  Chart.pluginService.register({
    beforeDraw: function (chart, easing) {
      if (
        chart.config.options.chartArea &&
        chart.config.options.chartArea.backgroundColor
      ) {
        var helpers = Chart.helpers;
        var ctx = chart.chart.ctx;
        var chartArea = chart.chartArea;

        ctx.save();
        ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
        ctx.fillRect(
          chartArea.left,
          chartArea.top,
          chartArea.right - chartArea.left,
          chartArea.bottom - chartArea.top
        );
        ctx.restore();
      }
    },
  });

  var gpChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Observations",
          data: [],
          pointStyle: "circle",
          radius: 5,
          borderColor: "rgba(0,57,115,1)",
          backgroundColor: "rgba(0,57,115,0.4)",
          fill: false,
          showLine: false,
          borderRadius: 3,
        },
        {
          label: "Mean",
          data: [],
          pointStyle: "None",
          radius: 0,
          borderColor: "rgba(90,190,192,1)",
          backgroundColor: "rgba(90,190,192,1)",
          fill: false,
          showLine: true,
          linewidth: 3,
        },
        {
          label: "Uncertainity",
          data: [],
          pointStyle: "None",
          radius: 0,
          borderColor: "rgba(253,224,221,1)",
          fill: true,
          showLine: true,
          backgroundColor: "rgba(253,224,221,1)",
        },
      ],
    },
    options: {
      chartArea: {
        backgroundColor: "rgba(247, 247, 247, 1)",
      },
      tooltips: {
        enabled: false,
      },
      hover: { mode: null },
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
        },
      },
      scales: {
        xAxes: [
          {
            type: "linear",
            position: "bottom",
            gridLines: {
              drawBorder: true,
              display: true,
              drawOnChartArea: false,
            },
            ticks: {
              min: -5,
              max: 5,
            },
          },
          {
            position: "top",
            ticks: {
              display: false,
            },
            gridLines: {
              display: true,
              drawTicks: false,
              drawOnChartArea: false,
            },
          },
        ],
        yAxes: [
          {
            position: "left",
            gridLines: {
              display: true,
              drawOnChartArea: false,
            },
            ticks: {
              min: -5,
              max: 5,
            },
          },
          {
            position: "right",
            ticks: {
              display: false,
            },
            gridLines: {
              display: true,
              drawTicks: false,
              drawOnChartArea: false,
            },
          },
        ],
      },
    },
  });

  return gpChart;
}

function resetObservations() {
  observations = [[], []];
  calculateGP(selected_kernel, x_s);
  replaceData(gpChart, 0, [], []);
}
function addData(chart, x, y) {
  var datapoint = { x: x, y: y };
  chart.data.datasets[0].data.push(datapoint);
  chart.update();
}
function replaceData(chart, idx, xs, ys) {
  var data = [];
  xs.forEach(function (value, index, matrix) {
    data.push({ x: value, y: ys.get(index) });
  });
  chart.data.datasets[idx].data = data;
  chart.update();
}

// --------------------
// Mouse Events
// --------------------

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return [x, y];
}
function getCursorCoordinates(canvas, myChart, event) {
  var ytop = myChart.chartArea.top;
  var ybottom = myChart.chartArea.bottom;
  var ymin = myChart.scales["y-axis-0"].min;
  var ymax = myChart.scales["y-axis-0"].max;

  var xleft = myChart.chartArea.left;
  var xright = myChart.chartArea.right;
  var xmin = myChart.scales["x-axis-0"].min;
  var xmax = myChart.scales["x-axis-0"].max;

  var clickpos = getCursorPosition(canvas, event);
  var x = clickpos[0];
  var y = clickpos[1];

  if (x < xright && x > xleft && y < ybottom && y > ytop) {
    var xproportion = (x - xleft) / (xright - xleft);
    var xcoord = xproportion * (xmax - xmin) + xmin;

    var yproportion = -(y - ybottom) / (ybottom - ytop);
    var ycoord = yproportion * (ymax - ymin) + ymin;
  }

  return [xcoord, ycoord];
}
function addDataPointAtCursor(canvas, myChart, e) {
  var coords = getCursorCoordinates(canvas, gpChart, e);
  addData(myChart, coords[0], coords[1]);
  observations[0].push(coords[0]);
  observations[1].push(coords[1]);
}

// --------------------
// Kernel Heatmap
// --------------------

function makeHeatMap(div, initial_data, zmax) {
  var colorScale = makeColorScale(15);
  var data = [
    {
      z: initial_data,
      type: "heatmap",
      colorscale: colorScale,
      showscale: false,
      reversescale: false,
      zmax: zmax,
      zmin: 0,
      zauto: false,
    },
  ];

  var layout = {
    showlegend: false,
    staticplot: true,
    title: false,
    margin: {
      l: 1,
      r: 1,
      b: 1,
      t: 1,
    },
    xaxis: {
      linecolor: "rgb(230, 230, 230)",
      linewidth: 1,
      mirror: true,
    },
    yaxis: {
      linecolor: "rgb(230, 230, 230)",
      linewidth: 1,
      mirror: true,
    },
  };

  var config = {
    displayModeBar: false,
    responsive: true,
  };
  Plotly.newPlot(div, data, layout, config);
}
function makeColorScale(n) {
  var ps = linspace(0, 1, n);
  var output = [];
  ps.forEach(function (p, i) {
    row = [p.toFixed(4), d3.interpolateGnBu(p)];
    output.push(row);
  });
  return output;
}

function updateHeatMapData(plot, arr) {
  data = { z: [arr] };
  Plotly.restyle(plot, data, 0);
}

// --------------------
// Mathematical Functions
// --------------------

function m(xs) {
  return math.zeros(len(xs));
}
function linspace(low, high, n) {
  var step = (high - low) / (n - 1);
  return math.range(low, high, step, true);
}
function flip(matrix) {
  var idx = math.range(0, len(matrix));
  var flippedidx = math.subtract(idx.get([len(idx) - 1]), idx);
  return matrix.subset(math.index(flippedidx));
}
function len(matrix, axis = 0) {
  if (matrix instanceof Array) {
    length = matrix.length;
  } else {
    length = matrix.size()[axis];
  }
  return length;
}
function pairwise_diffenerence(matrix1, matrix2) {
  pd = math.zeros(len(matrix1), len(matrix2));
  matrix1.forEach(function (m1, idx1) {
    matrix2.forEach(function (m2, idx2) {
      pd._data[idx1][idx2] = m1 - m2;
    });
  });
  return pd;
}

// --------------------
// Gaussain Process Implementation
// --------------------

class LinearKernel {
  constructor(sigma, sigma_b, c, n_example = 25) {
    this.sigma = sigma;
    this.sigma_b = sigma_b;
    this.c = c;
    this.n_example = n_example;
    this.example_points = linspace(-5, 5, n_example);
  }
  calculate(xs, ys) {
    xs = math.matrix(xs);
    ys = math.matrix(ys);
    var x_less_offset = math.subtract(xs, this.c);
    var y_less_offset = math.subtract(ys, this.c);
    var sigma_square = math.square(this.sigma);
    var sigma_b_square = math.square(this.sigma_b);
    x_less_offset = math.reshape(x_less_offset, [len(x_less_offset), 1]);
    y_less_offset = math.reshape(y_less_offset, [1, len(y_less_offset)]);

    var prod = math.multiply(x_less_offset, y_less_offset);

    return math.add(sigma_b_square, math.multiply(sigma_square, prod));
  }
  updateSigmaA(value) {
    this.sigma = value;
  }
  updateSigmaB(value) {
    this.sigma_b = value;
  }
  updateC(value) {
    this.c = value;
  }
  getVisualization() {
    return this.calculate(this.example_points, this.example_points);
  }
}
class PeriodicKernel {
  constructor(sigma, length, p, n_example = 25) {
    this.sigma = sigma;
    this.l = length;
    this.p = p;
    this.n_example = n_example;
    this.example_points = linspace(-5, 5, n_example);
  }
  calculate(xs, ys) {
    var xs = math.matrix(xs);
    var ys = math.matrix(ys);
    var d = pairwise_diffenerence(xs, ys);
    var pi_d = math.multiply(Math.PI, d);
    var pi_d_p = math.divide(pi_d, this.p);
    var sin_square = math.square(math.sin(pi_d_p));
    var sin_square_l = math.divide(sin_square, math.square(this.l));
    var e = math.exp(math.multiply(sin_square_l, -2));
    return math.multiply(math.square(this.sigma), e);
  }
  updateSigma(value) {
    this.sigma = value;
  }
  updateL(value) {
    this.l = value;
  }
  updateP(value) {
    this.p = value;
  }
  getVisualization() {
    return this.calculate(this.example_points, this.example_points);
  }
}
class RBF {
  constructor(sigma, l, n_example = 25) {
    this.sigma = sigma;
    this.l = l;
    this.n_example = n_example;
    this.example_points = linspace(-5, 5, n_example);
  }
  calculate(xs, ys) {
    xs = math.matrix(xs);
    ys = math.matrix(ys);
    var d = pairwise_diffenerence(xs, ys);
    var dl = math.divide(math.square(d), math.square(this.l));
    var e = math.exp(math.multiply(dl, -0.5));
    return math.multiply(math.square(this.sigma), e);
  }
  updateSigma(value) {
    this.sigma = value;
  }
  updateL(value) {
    this.l = value;
  }
  getVisualization() {
    return this.calculate(this.example_points, this.example_points);
  }
}
function calculateGP(kernel, x_s) {
  var x_obs = observations[0];
  var y_obs = observations[1];

  if (len(observations[0]) == 0) {
    std = math.multiply(kernel.sigma, math.ones(len(x_s)));
    mu_s = m(x_s);
  } else {

    // Calculate kernel components
    var K = kernel.calculate(x_obs, x_obs);
    // Measurement noise
    var sigma_noise = 0.2;
    var identity = math.identity(K.size());
    var noise = math.multiply(math.square(sigma_noise), identity);
    var K_s = kernel.calculate(x_obs, x_s);
    var K_ss = kernel.calculate(x_s, x_s);
    var K_sTKinv = math.multiply(
      math.transpose(K_s),
      math.inv(math.add(K, noise))
    );
    // New mean
    var mu_s = math.add(
      m(x_s),
      math.squeeze(math.multiply(K_sTKinv, math.subtract(y_obs, m(x_obs))))
    );
    var Sigma_s = math.subtract(K_ss, math.multiply(K_sTKinv, K_s));
    // New std
    var std = math.sqrt(Sigma_s.diagonal());
  }
  var uncertainty = math.multiply(2, std);
  replaceData(gpChart, 1, x_s, mu_s);
  x_s = math.concat(x_s, flip(x_s));
  y_s = math.concat(
    math.add(mu_s, uncertainty),
    flip(math.subtract(mu_s, uncertainty))
  );
  replaceData(gpChart, 2, x_s, y_s);
}
function makexPoints(n) {
  var xmin = gpChart.scales["x-axis-0"].min;
  var xmax = gpChart.scales["x-axis-0"].max;
  return linspace(xmin, xmax + 1, n);
}

// --------------------
// Slider Events
// --------------------

function updateFromSlider(slider, output, updateAtrFunc, kernel, heatmapDiv) {
  slider.oninput = function () {
    output.innerHTML = this.value;
    updateAtrFunc(this.value);
    // Update graphs
    kernelviz = kernel.getVisualization();
    updateHeatMapData(heatmapDiv, kernelviz._data);
    calculateGP(selected_kernel, x_s);
  };
}

// --------------------
// Button Events
// --------------------

function makeActive(kernel, buttonId) {
  selected_kernel = kernel;
  buttons = document.getElementsByClassName("kernel-button");

  for (i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("activated");
  }
  var button = document.getElementById(buttonId);
  button.classList.add("activated");

  calculateGP(selected_kernel, x_s);
}

// --------------------
// Main
// --------------------

var observations = [[], []];

const canvas = document.querySelector("canvas");
var ctx = document.getElementById("myChart").getContext("2d");
var gpChart = makeGPChart(ctx);

// Set Up slider listeners
// ---------------------

// RBF Options
var rbfSigmaSlider = document.getElementById("rbfSigmaSlider");
var rbfSigmaOutput = document.getElementById("rbfSigmaOuput");
rbfSigmaOutput.innerHTML = rbfSigmaSlider.value; // Display the default slider value

var rbfLengthSlider = document.getElementById("rbfLengthSlider");
var rbfLengthOutput = document.getElementById("rbfLengthOuput");
rbfLengthOutput.innerHTML = rbfLengthSlider.value; // Display the default slider value

// rbf object, set intial values from slider defaults
rbf = new RBF(rbfSigmaSlider.value, rbfLengthSlider.value);

updateFromSlider(
  rbfSigmaSlider,
  rbfSigmaOutput,
  rbf.updateSigma.bind(rbf),
  rbf,
  "rbf-heatmap"
);
updateFromSlider(
  rbfLengthSlider,
  rbfLengthOutput,
  rbf.updateL.bind(rbf),
  rbf,
  "rbf-heatmap"
);

// Linear Options
var linearSigmaASlider = document.getElementById("linearSigmaASlider");
var linearSigmaAOutput = document.getElementById("linearSigmaAOuput");
linearSigmaAOutput.innerHTML = linearSigmaASlider.value; // Display the default slider value

var linearSigmaBSlider = document.getElementById("linearSigmaBSlider");
var linearSigmaBOutput = document.getElementById("linearSigmaBOuput");
linearSigmaBOutput.innerHTML = linearSigmaBSlider.value; // Display the default slider value

var linearOffsetSlider = document.getElementById("linearOffsetSlider");
var linearOffsetOutput = document.getElementById("linearOffsetOuput");
linearOffsetOutput.innerHTML = linearOffsetSlider.value; // Display the default slider value

// linear object, set intial values from slider defaults
linear = new LinearKernel(
  linearSigmaASlider.value,
  linearSigmaBSlider.value,
  linearOffsetSlider.value
);

updateFromSlider(
  linearSigmaASlider,
  linearSigmaAOutput,
  linear.updateSigmaA.bind(linear),
  linear,
  "linear-heatmap"
);
updateFromSlider(
  linearSigmaBSlider,
  linearSigmaBOutput,
  linear.updateSigmaB.bind(linear),
  linear,
  "linear-heatmap"
);
updateFromSlider(
  linearOffsetSlider,
  linearOffsetOutput,
  linear.updateC.bind(linear),
  linear,
  "linear-heatmap"
);

// Periodic Options
var periodicSigmaSlider = document.getElementById("periodicSigmaSlider");
var periodicSigmaOutput = document.getElementById("periodicSigmaOuput");
periodicSigmaOutput.innerHTML = periodicSigmaSlider.value; // Display the default slider value

var periodicLengthSlider = document.getElementById("periodicLengthSlider");
var periodicLengthOutput = document.getElementById("periodicLengthOuput");
periodicLengthOutput.innerHTML = periodicLengthSlider.value; // Display the default slider value

var periodicPSlider = document.getElementById("periodicPSlider");
var periodicPOutput = document.getElementById("periodicPOuput");
periodicPOutput.innerHTML = periodicPSlider.value; // Display the default slider value
console.log(periodicPOutput.innerHTML);

// periodic object, set intial values from slider defaults
pdk = new PeriodicKernel(
  periodicSigmaSlider.value,
  periodicLengthSlider.value,
  periodicPSlider.value
);

updateFromSlider(
  periodicSigmaSlider,
  periodicSigmaOutput,
  pdk.updateSigma.bind(pdk),
  pdk,
  "periodic-heatmap"
);
updateFromSlider(
  periodicLengthSlider,
  periodicLengthOutput,
  pdk.updateL.bind(pdk),
  pdk,
  "periodic-heatmap"
);
updateFromSlider(
  periodicPSlider,
  periodicPOutput,
  pdk.updateP.bind(pdk),
  pdk,
  "periodic-heatmap"
);

// Initialise GP and HeatMap
x_s = makexPoints(50);
rbfkernelviz = rbf.getVisualization();
linearkernelviz = linear.getVisualization();
periodicviz = pdk.getVisualization();
selected_kernel = rbf;
makeHeatMap("rbf-heatmap", rbfkernelviz._data, 1);
makeHeatMap("linear-heatmap", linearkernelviz._data, 1);
makeHeatMap("periodic-heatmap", periodicviz._data, 1);
calculateGP(selected_kernel, x_s);

// Listen for mouse clicks and update graphs
canvas.addEventListener("mousedown", function (e) {
  addDataPointAtCursor(canvas, gpChart, e);
  calculateGP(selected_kernel, x_s);
});
