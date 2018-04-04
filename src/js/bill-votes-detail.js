// Enable hover deputy name and display comment tooltip effect
(function(){
    var elems = document.querySelectorAll('.avatar-table-wrapper');

    elems.forEach(function(elem){
        elem.addEventListener('mouseenter', function(){
            if(this.nextElementSibling
                && this.nextElementSibling.className.indexOf('comment-wrapper') != -1){
                    this.nextElementSibling.querySelector('input').checked = true;
                }
        });

        elem.addEventListener('mouseleave', function(){
            if(this.nextElementSibling
                && this.nextElementSibling.className.indexOf('comment-wrapper') != -1){
                    this.nextElementSibling.querySelector('input').checked = false;
                }
        });
    });
})();
