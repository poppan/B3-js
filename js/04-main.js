(function () {
    //-- FIREBASE
    // Initialize Firebase
    let config = {
        apiKey: "AIzaSyC99m083bi3ST6Cuu7GJP2QOM2dk-G234U",
        authDomain: "b3-js-b50d5.firebaseapp.com",
        databaseURL: "https://b3-js-b50d5.firebaseio.com",
        storageBucket: "b3-js-b50d5.appspot.com",
        messagingSenderId: "568707431220"
    };
    let mainFirebaseApp = firebase.initializeApp(config);

    //--  worker
    let worker = new Worker("js/04-worker.js");

    //--  event trigger pour alimenter le worker -----------------------------------------------------------------------
    let moveRequestTimeout;
    $("#viewport").on('keydown keyup mousemove', function (e) {
        // une demande de deplacement
        // si une demande de reinitialisation de deplacement avec delai avait été lancée on la stoppe
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
            // essaie
            try {
                moveRequest.left = (e.offsetX > $(".player").first().position().left) ? -1 : 1;
                moveRequest.top = (e.offsetY > $(".player").first().position().top) ? -1 : 1;
                // si une erreur on la traite
            } catch (exception) {
                console.error("mousemove exception", exception);
                // au final on execute
            } finally {
                // on defini un deplacement avec delai
                moveRequestTimeout = setTimeout(function () {
                    worker.postMessage({
                        top: 0,
                        left: 0
                    });
                }, 100);
            }
        }
        // on envoie l'object moveRequest au worker
        worker.postMessage(moveRequest);
    });


    let entities = [];


    //-- event trigger sur les messages retour du worker au travers de l'evenement "message" ---------------------------
    worker.onmessage = function (event) {
        // l'evenement est retourné, pour recup l'object associe on appelle event.data
        entities = event.data;


        /*
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
         */


        for (let entity of entities) {
            if (entity.class == "player") {
                entity.ts = Date.now();
                mainFirebaseApp.database().ref('players/' + entity.id)
                    .set(entity)
                    .then(function (e) {
                    });
            }
        }

    };

    worker.onerror = function (error) {
        console.error("Worker error: " + error.message + "\n");
        throw error;
    };

    mainFirebaseApp.database().ref('players/').orderByChild("ts").limitToLast(2)
        .on('value', function (snapshot) {

            let fbPlayers = snapshot.val();

            /*
            // pour mapper un object dans un tableau

            // approche boucle
            let ghosts = [];
            for (let prop in fbPlayers) {
                let ghost = fbPlayers[prop];
                ghost.class = "ghost";
                ghosts.push(ghost);
            }

             */
            // ou via assignation en ES6
            for (let prop in fbPlayers) {
                fbPlayers[prop].class = "ghost";
            }
            let ghosts = Object.keys(fbPlayers).map(key => fbPlayers[key]);

            let all =  entities.concat(ghosts);
            for (let entity of all) {
                let currentEntity = $("#" + entity.id);
                if (currentEntity.length == 0) {
                    $('#map').append($('<div id="' + entity.id + '" class="' + entity.class + '">'));
                }
                currentEntity
                    .css('transform', 'translate(' + entity.x * 8 + 'px,' + entity.y * 8 + 'px)')
                    .removeClass('left right top bottom nearby')
                    .addClass(entity.angle)
                    .addClass((entity.isNearby) ? 'nearby' : '');

            }
        });

})(jQuery);