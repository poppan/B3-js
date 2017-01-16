
var player  = {
    top: 0,
    left:0
};
var moveRequest  = {
    top: 0,
    left:0
};
// le tick

var onmessage = function(event) {
    console.log(event.data);
    moveRequest = event.data
}

var gameTick = function () {
    var nextY = player.top - (moveRequest.top * 32);
    var nextX = player.left - (moveRequest.left * 32);
    player.top = nextY;
    player.left = nextX;
    postMessage(player);

    moveRequest  = {
        top: 0,
        left:0
    };
};

self.setInterval(gameTick, 200);