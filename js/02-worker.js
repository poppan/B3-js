class Entity {

    constructor(className, posX, posY) {
        this.class = className;
        this.position = [posX, posY];
        this.id = "Entity" + Math.round(Math.random() * 65000);
    }

    set position(position) {
        this.x = position[0];
        this.y = position[1];
    }

    get position() {
        return ([this.x, this.y]);
    }

/*
    set bearing(bearing) {
        this.angle = bearing;
    }

    get bearing() {
        return (this.angle);
    }
*/

}

let player = new Entity('player', 0, 0);

let moveRequest = {
    left: 0,
    top: 0
};

// le tick
onmessage = function (event) {
    //console.log(event.data);
    moveRequest = event.data
};

let gameTick = function () {
    console.log(player, moveRequest);
    let nextX = player.position[0] - moveRequest.left;
    let nextY = player.position[1] - moveRequest.top;


    player.position = [nextX, nextY];
    postMessage(player);

    moveRequest = {
        top: 0,
        left: 0
    };
};

self.setInterval(gameTick, 100);