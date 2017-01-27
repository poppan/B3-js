(function () {

    // worker
    var worker = new Worker("js/02-worker.js");

/*    // le sprite du player
    var player = $('.player');*/


    // event trigger pour alimenter le worker
    $("#viewport").on('keydown keyup mousemove', function (e) {
        // une demande de deplacement
        var moveRequest = {
            top: 0,
            left: 0
        };

        if ([37, 38, 39, 40].indexOf(e.which) != -1) {
            switch (e.which) { // ou e.keyCode
                case 37:
                    moveRequest.left = (e.type == "keydown") ? 1 : 0;
                    break;
                case 38:
                    moveRequest.top = (e.type == "keydown") ? 1 : 0;
                    break;
                case 39:
                    moveRequest.left = (e.type == "keydown") ? -1 : 0;
                    break;
                case 40:
                    moveRequest.top = (e.type == "keydown") ? -1 : 0;
                    break;
            }
        }

        if (e.type == "mousemove") {
            moveRequest.left = (e.offsetX > $(".player").first().position().left) ? -1 : 1;
            moveRequest.top = (e.offsetY > $(".player").first().position().top) ? -1 : 1;
        }

        worker.postMessage( moveRequest );
    });



    // event trigger sur les messages du worker
    worker.onmessage = function(event) {
        console.log("worker returned : " , event.data);
        let entity = event.data;
        if($("#"+ entity.id).length == 0){
            $('#map').append($('<div id="'+ entity.id +'" class="'+ entity.class +'">'));
        }
        $("#"+ entity.id).css('transform', 'translate(' + entity.x*32 + 'px,' + entity.y*32 + 'px)');
    };

    worker.onerror = function(error) {
        console.error("Worker error: " + error.message + "\n");
        throw error;
    };


})(jQuery);