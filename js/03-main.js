(function () {
    //--  worker
    let worker = new Worker("js/03-worker.js");

    let moveRequestTimeout;
    //--  event trigger pour alimenter le worker
    $("#viewport").on('keydown keyup mousemove', function (e) {
        // une demande de deplacement

        clearTimeout(moveRequestTimeout);

        let moveRequest = {
            top: 0,
            left: 0
        };

        if (e.type == "keydown" || e.type == "keyup") {
            console.log(e.type);
            console.log(moveRequest);
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
        }
        if (e.type == "mousemove") {
            try {
                moveRequest.left = (e.offsetX > $(".player").first().position().left) ? -1 : 1;
                moveRequest.top = (e.offsetY > $(".player").first().position().top) ? -1 : 1;
            } catch (exception) {
                console.error("mousemove exception", exception);
            } finally {
                moveRequestTimeout = setTimeout(function () {
                    worker.postMessage({
                        top: 0,
                        left: 0
                    });
                }, 100);
            }
        }
        // on envoie un object au worker
        worker.postMessage(moveRequest);
    });


    //-- event trigger sur les messages retour du worker au travers de l'evenement "message"
    worker.onmessage = function (event) {
        // l'evenement est retourné, pour recup l'object associe on appelle event.data
        let message = event.data;
//console.log(message);
        // on peut utiliser plusieurs approches pour itérer (boucles)
        // -- FOR
        //le classique => for(let i=0; i< max; i++) { i }

        // -- FOR-OF
        // pour recup les *valeurs* d'un array ou d'une liste => for (let valeur of tableau) { valeur }
        // pour recup les *propriétés* d'un object => for (let nomPropriété of Object.keys(monObjet)) { nomPropriété }
        // pour recup les valeur de *propriétés* d'un object => for (let nomPropriété of Object.keys(monObjet)) { monObjet[nomPropriété] }

        // -- FOR-IN => que pour les objects
        // pour recup les *propriétés* d'un object => for (let nomPropriété in monObjet) { nomPropriété }
        // pour recup les valeur de *propriétés* d'un object =>   for (let nomPropriété in monObjet) { monObjet[nomPropriété] }

        for (let entity of message) {
            if ($("#" + entity.id).length == 0) {
                $('#map').append($('<div id="' + entity.id + '" class="' + entity.class + '">'));
            }
            $("#" + entity.id).removeClass('left right top bottom nearby');
            $("#" + entity.id).addClass(entity.angle);
            $("#" + entity.id).addClass((entity.isNearby) ? 'nearby' : '');
            $("#" + entity.id).css('transform', 'translate(' + entity.x * 8 + 'px,' + entity.y * 8 + 'px)');
        }
    };

    worker.onerror = function (error) {
        console.error("Worker error: " + error.message + "\n");
        throw error;
    };


})(jQuery);