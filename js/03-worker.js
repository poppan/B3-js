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

        this.x = Math.max(Math.min(this.x, 30), 0);
        this.y = Math.max(Math.min(this.y, 30), 0);


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

        this.x = Math.max(Math.min(this.x, 30), 0);
        this.y = Math.max(Math.min(this.y, 30), 0);
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
for (let i=0; i < 10; i++){
    entities.push(new Enemy('enemy', 5, 5));
}

// le tick
onmessage = function (event) {
    //console.log(event.data);
    moveRequest = event.data
};


let isNearby = function(entity) {
    entity.isNearby = (Math.abs(entity.x - entities[0].x) <= 3 && Math.abs(entity.y - entities[0].y) <= 3);
    return entity.isNearby;
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
    entities.filter(isNearby);

    postMessage(entities);

    moveRequest = {
        top: 0,
        left: 0
    };
};

self.setInterval(gameTick, 100);