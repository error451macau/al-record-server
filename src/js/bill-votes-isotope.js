// only if .bill-votes exists
var elem = document.getElementsByClassName('bill-votes');
if(elem.length > 0){

var Isotope = require('isotope-layout');
var imagesLoaded = require('imagesloaded');

var iso = new Isotope( '.bill-votes', {
    percentPosition: true,
    sortBy: ['vote', 'electedMethod'],
    getSortData: {
        vote: function(itemElement){
            switch (itemElement.dataset.vote){
                case 'Y': return 0;
                case 'N': return 1;
                case 'P': return 2;
                case 'A': return 3;
            }
        },
        electedMethod: function(itemElement){
            switch (itemElement.dataset.electedMethod){
                case 'direct': return 0;
                case 'indirect': return 1;
                case 'appointed': return 2;
            }
        }
    }
});

imagesLoaded('.bill-votes', function(){
    iso.layout();
});

}
