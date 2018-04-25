// only if #home__bill__pie exists
var billElem = document.getElementById('home__bill');
var pieElem = document.getElementById('home__bill__pie');
var wrapperElem = document.getElementById('home__bill__pie-wrapper');

if(pieElem){

var Plotly = require('plotly.js/lib/core');

Plotly.register([
    require('plotly.js/lib/pie'),
]);

var data = JSON.parse(pieElem.dataset.pieData);

var layout = {
    height: calcSideLength(),
    width:  calcSideLength(),
    showlegend: false,
    margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
    }
};

Plotly.newPlot('home__bill__pie', data, layout, {staticPlot: true});
setTimeout(function(){
    window.dispatchEvent(new Event('resize')); // trigger size calculation
}, 0);

window.addEventListener('resize', debounce(function(){
    var sideLength = calcSideLength();

    Plotly.relayout('home__bill__pie', {
        height: sideLength,
        width: sideLength,
    });

    pieElem.style.top = ((wrapperElem.clientHeight - sideLength) / 2) + 'px';

    console.log('Plotly.relayout');
}, 40));

function calcSideLength(){
    // if == flex -> calculate dynamic size with min(wrapper width, wrapper height)
    // else use wrapper width as side length
    if(getComputedStyle(billElem).display == 'flex'){
        // get the shorter side of the wrapper, while maintaining a minimum height of 280px
        return Math.min(wrapperElem.clientWidth, wrapperElem.clientHeight);
    } else {
        return wrapperElem.clientWidth;
    }
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};


}