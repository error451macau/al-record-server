if(location.hash && location.hash.match(/^#?docid-[0-9]+$/)){
    var target = document.querySelector('[data-docid="' + location.hash.replace(/^#?docid-/, '') + '"]');

    if(target){
        document.documentElement.scrollTop = window.scrollY + target.getBoundingClientRect().top - 100;
        target.className += 'hll';
    }
}
