// Enable hover comment/comment-wrapper and display comment tooltip effect
//   by simulating the check/uncheck when mouseenter/leave
(function(){
    var comments = document.querySelectorAll('.comment-wrapper, .comment');

    comments.forEach(function(comment){
        comment.addEventListener('mouseenter', function(){
            this.querySelector('input').checked = true;
        });

        comment.addEventListener('mouseleave', function(){
            this.querySelector('input').checked = false;
        });
    });
})();
