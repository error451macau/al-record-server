// only if #bill-votes-summary__pie exists
var elem = document.getElementById('bill-votes-summary__pie');
if(elem){

var Plotly = require('plotly.js/lib/core');

Plotly.register([
    require('plotly.js/lib/pie'),
]);

var data = JSON.parse(elem.dataset.pieData);

require('./_abstain-sector-coloring')(elem, data[0]);

var layout = {
    height: 190,
    width:  190,
    showlegend: false,
    margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
    },
    font: {
        family: getComputedStyle(elem)['font-family'],
        size: 15,
        color: '#232323'
    }
};

Plotly.newPlot('bill-votes-summary__pie', data, layout, {staticPlot: true});

}