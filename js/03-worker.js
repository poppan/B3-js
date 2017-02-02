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
    moveBy(moveRequest){
        this.x -= moveRequest.left;
        this.y -= moveRequest.top;

        this.x = Math.max(Math.min(this.x, 640/8), 0);
        this.y = Math.max(Math.min(this.y, 480/8), 0);


        if (moveRequest.left < 0) {
            this.bearing ='right';
        }
        if (moveRequest.left > 0) {
            this.bearing ='left';
        }
        if (moveRequest.top < 0) {
            this.bearing ='bottom';
        }
        if (moveRequest.top > 0) {
            this.bearing ='top';
        }
    }

    set bearing(bearing) {
        this.angle = bearing;
    }

    get bearing() {
        return (this.angle);
    }


}

// on etend la classe et on lui declare une nouvelle methode move qui le deplacera aleatoirement.
class Enemy extends Entity{
    moveBy(){
        this.x += Math.round(Math.random()*2) -1;
        this.y += Math.round(Math.random()*2) -1;

        this.x = Math.max(Math.min(this.x, 640/8), 0);
        this.y = Math.max(Math.min(this.y, 480/8), 0);
    }
}

// ---------------------------------------------------------------------------------------------------------------------
let moveRequest = {
    left: 0,
    top: 0
};

// on créée le tableau des entités
let entities = [];
// hop on ajoute le player
entities.push(new Entity('player', 5, 5));
// hop on ajoute des enemies dans le tableau
for (let i=0; i < 25; i++){
    entities.push(new Enemy('enemy', Math.round(Math.random()*640/8), Math.round(Math.random()*480/8)));
}

// le tick
onmessage = function (event) {
    //console.log(event.data);
    moveRequest = event.data;
    //gameTick();
};


let isNearby = function(entity) {
    switch(entity.class){
        case "player":
            break;
            return true;
        case "enemy":
            entity.isNearby = (Math.abs(entity.x - entities[0].x) <= 3 && Math.abs(entity.y - entities[0].y) <= 3);
            return entity.isNearby;
            break;
    }

};

let isOnPlayer = function(entity) {
    switch(entity.class){
        case "player":
            return true;
            break;
        case "enemy":
            return !(Math.abs(entity.x - entities[0].x) <= 1 && Math.abs(entity.y - entities[0].y) <= 1);
            break;
    }
};

let gameTick = function () {
    //console.log( moveRequest);

    for (let entity of entities){
        switch(entity.class){
            case "player":
                entity.moveBy(moveRequest);
                break;
            case "enemy":
                entity.moveBy();
                break;
        }
    }
    // highlight si proche
    entities.filter(isNearby);
    //supprime si sur le player
    entities = entities.filter(isOnPlayer);
    postMessage(entities);
};

self.setInterval(gameTick, 16);