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

require('./_abstain-sector-coloring')(pieElem, data[0]);

(function(){
    var sideLength = calcSideLength();

    var layout = {
        height: sideLength,
        width:  sideLength,
        showlegend: false,
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0,
        },
        font: {
            family: getComputedStyle(pieElem)['font-family'],
            size: 15,
            color: '#232323'
        }
    };

    // first render on mobile has wrapperElem.clientHeight shorter than sideLength,
    //   in this case top is set to 0px
    if(wrapperElem.clientHeight < sideLength){
        pieElem.style.top = '0px';
    } else {
        pieElem.style.top = ((wrapperElem.clientHeight - sideLength) / 2) + 'px';
    }

    Plotly.newPlot('home__bill__pie', data, layout, {staticPlot: true});
})();

window.addEventListener('resize', debounce(function(){
    // so that its own height does not affect wrapperElem height
    pieElem.style.height = 0;

    var sideLength = calcSideLength();

    Plotly.relayout('home__bill__pie', {
        height: sideLength,
        width: sideLength,
    });

    pieElem.style.top = Math.max(0, (wrapperElem.clientHeight - sideLength) / 2) + 'px';
    pieElem.style.height = 'auto'; // revert height = 0 above

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