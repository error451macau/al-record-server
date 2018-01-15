// only if #bill-votes-summary__pie exists
var elem = document.getElementById('bill-votes-summary__pie');
if(elem){

var Plotly = require('plotly.js/lib/core');

Plotly.register([
    require('plotly.js/lib/pie'),
]);

var data = JSON.parse(elem.dataset.pieData);

var layout = {
    height: document.getElementsByClassName('bill-votes-summary__table')[0].clientHeight,
    width:  document.getElementsByClassName('bill-votes-summary__table')[0].clientHeight,
    showlegend: false,
    margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
    }
};

Plotly.newPlot('bill-votes-summary__pie', data, layout, {staticPlot: true});

}