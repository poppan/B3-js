(function () {
    // le sprite du player
    var player = $('.player');

    // une demande de deplacement
    var moveRequest = {
        top: 0,
        left: 0
    };
    var resetMoveRequest = function () {
        moveRequest = {
            top: 0,
            left: 0
        };
    }

    // un setTimeOut nommé
    var mousemoveTimeout;

    // event trigger pour alimenter le moverequest
    $("#viewport").on('keydown keyup mousemove', function (e) {

        clearTimeout(mousemoveTimeout);
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
            moveRequest.left = (e.offsetX > player.position().left) ? -1 : 1;
            moveRequest.top = (e.offsetY > player.position().top) ? -1 : 1;
            mousemoveTimeout = setTimeout(resetMoveRequest, 200);
        }
    });

    // le tick
    var gameTick = function () {
        var nextX = player.position().left - (moveRequest.left * 32);
        var nextY = player.position().top - (moveRequest.top * 32);
        player.css('transform', 'translate(' + nextX + 'px,' + nextY + 'px)');

    };

    window.setInterval(gameTick, 200);

})(jQuery);