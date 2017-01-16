var express = require('express');
var http = require('http');
var q = require('q');
var request = require('request');
var fs = require('fs');
var path = require('path');
var sharp = require('sharp');
var router = express.Router();

//var autolinks	= require('autolinks');

var conf = require('../conf');
var db = require('../db');

var hosts = conf.hosts;


/* UTIL */

var mkdirpSync = function (dirpath) {
    //var parts = dirpath.split(path.sep);
    var parts = dirpath.split('/');

    if (parts[0] == '') {
        parts.shift();
    }
    for (var i = 1; i <= parts.length; i++) {

        try {
            fs.mkdirSync('/' + path.join.apply(null, parts.slice(0, i)));
        } catch (e) {
            if (e.code != 'EEXIST') throw e;
        }
    }
}

/* GET one event with country // usually for json. */
router.get('/:ct([a-z]{2})/:id([0-9]+)/:slug', function (req, res) {

    var country = hosts['default'];
    for (var host in hosts) {
        //console.log(host);
        if (hosts[host].key == req.params.ct) {
            country = hosts[host];
        }
    }

    var e_id = req.params.id;

    if (e_id && !isNaN(parseInt(e_id)) && country && country.key) {
        //console.log(country.key);
        db.query('SELECT ct, id, h1, body, tags, img, dtstart, dtend, dow, lat, lng, loc, v_id, v_h1, addr, fb_img FROM ' + country.key + '_events where id = ? limit 1', [e_id])
            .then(function (results) {

                if (results[0]) {
                    var event = results[0];

                    event.lat = event.lat.toFixed(4);
                    event.lng = event.lng.toFixed(4);

                    /*        if ((event.dtend*1000) > Date.now() ){
                     event.live = 1;
                     }*/

                    /* mysql timestamp in second to js timestamp in ms */
                    event.dtstart = (new Date(event.dtstart * 1000)).toISOString();
                    event.dtend = (new Date(event.dtend * 1000)).toISOString();


                    event.url = country.url + "/events/" + event.id + "/" + conf.slugify(event.h1);
                    if (event.v_id) {
                        event.v_url = country.url + "/venues/" + event.v_id + "/" + conf.slugify(event.v_h1 + ' ' + event.addr);
                    }


                    if (req.xhr) {
                        res.writeHead(200, {
                            'Content-Type': 'application/json'
                        });

                        res.end(JSON.stringify({events: [event]}, null, 2));
                    } else {
                        //TODO : limit desc and keywords to 140chars
                        var data = {
                            site: {
                                countries: hosts,
                            },
                            page: {
                                keywords: event.h1 + (event.tags ? ", " + event.tags : "") + (event.v_h1 ? ", " + event.v_h1 : "") + (event.addr ? ", " + event.addr : ""),
                                description: event.body.substring(0, Math.min(event.body.length, 140)),
                                /*thumbnail:event.canonical,*/
                                h1: event.h1,
                                canonical: event.url,
                                country: country,
                                loc: event.loc,
                                lat: event.lat,
                                lng: event.lng
                            },
                            event: event
                        }
                        res.render('event', data);
                    }
                } else {
                    res.end('\n');
                }
            })
            .catch(function (error) {
                res.end('\n');
                // Handle any error from all above steps
            });
    } else {
        res.end('\n');
    }
});


/* GET one event. */
router.get('/:id([0-9]+)/:slug', function (req, res) {
    var country = hosts[req.headers.host] || hosts['default'];
    var e_id = req.params.id;


    if (e_id && !isNaN(parseInt(e_id)) && country && country.key) {
        //var funcs = [];
        //funcs.push();
        /* execute defered stuff */
        /* http://stackoverflow.com/questions/27044866/use-q-inside-a-loop */
        //q.all(funcs).then(function(results){
//  if (results[0][0] ) {
//  var event = results[0][0];
        db.query('SELECT ct, id, h1, body, tags, img, dtstart, dtend, dow, lat, lng, loc, v_id, v_h1, addr, fb_img FROM ' + country.key + '_events where id = ? limit 1', [e_id])
            .then(function (results) {


                if (results[0]) {
                    var event = results[0];
                    event.lat = event.lat.toFixed(4);
                    event.lng = event.lng.toFixed(4);

                    if ((event.dtend * 1000) > Date.now()) {
                        event.live = 1;
                    }

                    /* mysql timestamp in second to js timestamp in ms */
                    event.dtstart = (new Date(event.dtstart * 1000)).toISOString();
                    event.dtend = (new Date(event.dtend * 1000)).toISOString();


                    event.url = country.url + "/events/" + event.id + "/" + conf.slugify(event.h1);
                    if (event.v_id) {
                        event.v_url = country.url + "/venues/" + event.v_id + "/" + conf.slugify(event.v_h1 + ' ' + event.addr);

                    }


                    if (req.xhr) {
                        res.writeHead(200, {
                            'Content-Type': 'application/json'
                        });

                        res.end(JSON.stringify({events: [event]}, null, 2));
                    } else {
                        //TODO : limit desc and keywords to 140chars
                        var data = {
                            site: {
                                countries: hosts,
                            },
                            page: {
                                keywords: event.h1 + (event.tags ? ", " + event.tags : "") + (event.v_h1 ? ", " + event.v_h1 : "") + (event.addr ? ", " + event.addr : ""),
                                description: event.body.substring(0, Math.min(event.body.length, 140)),
                                /*thumbnail:event.canonical,*/
                                h1: event.h1,
                                canonical: event.url,
                                country: country,
                                loc: event.loc,
                                lat: event.lat,
                                lng: event.lng
                            },
                            event: event
                        }
                        res.render('event', data);
                    }
                } else {
                    res.end('\n');
                }
            })
            .catch(function (error) {
                res.end('\n');
                // Handle any error from all above steps
            })

    } else {
        res.end('\n');
    }
});

/* GET one event id(number) with no slug. */
router.get('/:id([0-9]+)/', function (req, res) {

    var country = hosts[req.headers.host] || hosts['default'];
    var e_id = req.params.id;

    if (e_id && !isNaN(parseInt(e_id)) && country && country.key) {
        db.query('SELECT ct, id, h1, body, tags, img, dtstart, dtend, dow, lat, lng, loc, v_id, v_h1, addr, fb_img FROM ' + country.key + '_events where id = ? limit 1', [e_id])
            .then(function (results) {
                if (results[0] && (conf.slugify(results[0].h1) != '')) {
                    var event = results[0];
                    event.url = country.url + "/events/" + event.id + "/" + conf.slugify(event.h1);

                    res.redirect(301, event.url);
                } else {
                    //TODO : should 404
                    /*          var err = new Error();
                     err.status = 404;
                     next(err);*/
                    res.end('\n');
                }
            })
            .catch(function (error) {
                res.end('\n');
                // Handle any error from all above steps
                //TODO : should 404
                //next(error);
            })

    } else {
        //TODO : should 404
        /*    var err = new Error();
         err.status = 404;
         next(err);*/
        res.end('\n');
    }
});

/* import events. */
router.get('/getFromExt', function (req, res) {
    var zonegeo = req.query.zonegeo || null;
    //patch uk/gb
    if (zonegeo == 'uk') {
        zonegeo = 'gb';
    }

    var country = null;
    for (var host in hosts) {
        if (hosts[host].key == zonegeo) {
            country = hosts[host];
        }
    }


    if (country) {
        var options = {
            host: 'import.swotee.com',
            path: '/events/swotee_export_json2/?zonegeo=' + zonegeo
        };
        //patch uk/gb
        if (zonegeo == 'gb') {
            var options = {
                host: 'import.swotee.com',
                path: '/events/swotee_export_json2/?zonegeo=uk'
            };
        }

        /*    var options = {
         host: 'localhost',
         path: '/test/test_import.json'
         };*/
        var reqImports = http.get(options, function (resImports) {

            var countryCheck = function (entry) {
                if (entry.ct == zonegeo) {
                    return [entry];
                } else {
                    return false;
                }
            }
            var fbExists = function (entry) {
                var ct = entry.ct || zonegeo;
                if (entry.fb_id) {
                    return db.query('SELECT id FROM ' + ct + '_events WHERE fb_id = ?', [entry.fb_id]);
                } else {
                    return false;
                }
            }
            var getVenue = function (entry) {
                var ct = entry.ct || zonegeo;
                if (entry.v_id) {
                    return db.query('SELECT ct, h1 as v_h1, addr, loc, lat, lng FROM ' + ct + '_venues WHERE id = ?', [entry.v_id]);
                } else {
                    if (!isNaN(parseFloat(entry.lat)) && !isNaN(parseFloat(entry.lng))) {
                        //find closest
                        var lat = parseFloat(entry.lat);
                        var lng = parseFloat(entry.lng);
                        var dist = 20;
                        var pad1 = (dist / 69);
                        var pad2 = dist / Math.abs(Math.cos((Math.PI / 180) * lat) * 69);
                        var latNE = lat + pad1;
                        var lngNE = lng + pad2;
                        var latSW = lat - pad1;
                        var lngSW = lng - pad2;
                        var conditions = ' where lat BETWEEN ' + latSW + ' AND ' + latNE + ' and lng BETWEEN ' + lngSW + ' AND ' + lngNE + '';
                        var query = 'SELECT loc FROM ' + ct + '_venues ' + conditions + ' order by ROUND((SQRT(POW(69.1 * (lat - ' + lat + '), 2) + POW(69.1 * (' + lng + ' - lng) * COS(lat / 57.3), 2))),4) asc limit 1';
                        return db.query(query)
                    } else {
                        return false;
                    }
                }
            }

            var makeImages = function (uri, imagePath, filename) {

                var d = q.defer();
                request.head(uri, function (err, res, body) {

                    var hires = sharp()
                        .resize(720, 720)
                        .max()
                        .toFormat(sharp.format.jpeg)
                        .on('error', function (err) {
                            console.log(filename, err);
                            d.reject(err);
                        });

                    var thumbnail = sharp()
                        .resize(80, 80)
                        .crop(sharp.gravity.center)
                        .toFormat(sharp.format.jpeg)
                        .on('error', function (err) {
                            console.log(filename, err);
                            d.reject(err);
                        });

                    //var hiresPath = imagePath +'hi/';
                    //var thumbnailsPath = imagePath +'tb/';

                    var hiresPath = imagePath + 'files/Events/hires/';
                    var thumbnailsPath = imagePath + 'files/Events/thumbnail/';

                    mkdirpSync(hiresPath);
                    mkdirpSync(thumbnailsPath);

                    var buffer = request(uri);

                    buffer.pipe(hires).pipe(fs.createWriteStream(hiresPath + '' + filename + '.jpg'))
                        .on('close', function (err) {
                            if (err) {
                                d.reject(err);
                            }
                        });

                    buffer.pipe(thumbnail).pipe(fs.createWriteStream(thumbnailsPath + '' + filename + '.jpg'))
                        .on('close', function (err) {
                            if (err) {
                                d.reject(err);
                            }
                            // if hires && tb then resolve with file extension
                            // TODO : hires.then(thumbnail).then(resolve)
                            d.resolve('jpg');
                        });


                });
                return d.promise;
            };

            var insertEntry = function (entry) {
                var d = q.defer();
                q.all([countryCheck(entry), getVenue(entry), fbExists(entry)])
                    .then(function (data) {
                        var entry = data[0][0];
                        var venue = data[1][0];
                        var event = data[2][0];
                        //console.log(e_id, venue);
                        //console.log(entry);

                        if (undefined != entry) {
                            // override entry location data with venue data

                            for (var key in venue) {
                                entry[key] = venue[key];
                            }

                            //e_id is swotee event id
                            if (undefined != event) {
                                var e_id = event['id'];
                                db.query('UPDATE ' + entry.ct + '_events SET ? WHERE fb_id = ?', [entry, entry.fb_id])
                                    .then(function (data) {
                                        //console.log('UPDATED ', entry.fb_id);
                                        d.resolve(entry.fb_id);
                                        try {
                                            //var outputPath = conf.paths['images']+ entry.ct +'/e/'; // add /e dir for events
                                            var outputPath = conf.paths['images'] + entry.ct + '/';
                                            makeImages(entry.fb_img, outputPath, e_id)
                                                .then(function (imgExt) {
                                                    db.query('UPDATE ' + entry.ct + '_events SET img = ? WHERE id = ?', [imgExt, e_id]);
                                                });

                                        } catch (err) {
                                            console.log(err);
                                            //d.reject(err);
                                        }

                                        //return entry.fb_id;
                                    });
                            } else {
                                db.query('INSERT INTO ' + entry.ct + '_events SET ?', entry)
                                    .then(function (data) {
                                        //console.log('INSERTED ', entry.fb_id, entry.fb_img);
                                        d.resolve(entry.fb_id);
                                        var e_id = data.insertId;
                                        try {
                                            //download('http://puteborgne.sexy/kubota/img/tractors/M.png', '/var/www/swotee-js/public/prout/'+ e_id +'.webp', function(err) {

                                            //var outputPath = conf.paths['images']+ entry.ct +'/e/'; // add /e dir for events
                                            var outputPath = conf.paths['images'] + entry.ct + '/';
                                            makeImages(entry.fb_img, outputPath, e_id)
                                                .then(function (imgExt) {
                                                    db.query('UPDATE ' + entry.ct + '_events SET img = ? WHERE id = ?', [imgExt, e_id]);
                                                });

                                        } catch (err) {
                                            console.log(err);
                                            //d.reject(err);
                                        }

                                        //return [entry.fb_id];
                                    });

                            }
                        }
                    });
                return d.promise;
            };


            /*
             download('https://www.google.com/images/srpr/logo3w.png', 'google.png', function(){
             console.log('done');
             });
             */
            if (resImports.statusCode == 200) {
                //console.log('STATUS: ' + resImports.statusCode);
                //console.log('HEADERS: ' + JSON.stringify(resImports.headers));
                var query = '';
                // Buffer the body entirely for processing as a whole.
                var bodyChunks = [];
                resImports
                    .on('data', function (chunk) {
                        // You can process streamed parts here...
                        bodyChunks.push(chunk);
                    })
                    .on('end', function () {
                        var body = Buffer.concat(bodyChunks);
                        //console.log('BODY: ' + JSON.parse(body));
                        // ...and/or process the entire body here.
                        var entries = JSON.parse(body);

                        var promises = [];

                        for (var i = 0; i < entries.length; i++) {
                            promises.push(insertEntry(entries[i]));
                        }

                        // all promises in promises array
                        q.all(promises)
                            .then(function (data) {

                                console.log(JSON.stringify(data));
                                //res.end("LOL");
                                //$returnUrl = 'http://import.swotee.com/events/swotee_validation/?r='.urlencode(json_encode($insertedArray, JSON_FORCE_OBJECT));
                                var returnUrl = 'http://import.swotee.com/events/swotee_validation/?r=' + encodeURIComponent(JSON.stringify(data));
                                /*var returnUrl = 'http://puteborgne.sexy/swotee/test_imp.php?r='+ encodeURIComponent(JSON.stringify(data));*/
                                //res.end(returnUrl);
                                var options = {
                                    host: 'import.swotee.com',
                                    path: '/events/swotee_validation/?r=' + encodeURIComponent(JSON.stringify(data))
                                };
                                http.get(options, function () {
                                    res.end(JSON.stringify(data));
                                });
                            });
                    });
            } else {
                res.end('\n');
            }
        });
    } else {
        res.end('\n');
    }
});

router.get('/', function (req, res, next) {
    var country = hosts[req.headers.host] || hosts['default'];
    var events = {};


    //console.log(country);
    if (country && country.key) {
        db.query('SELECT ct, id, h1, body, tags, img, dtstart, dtend, dow, lat, lng, loc, v_id, v_h1, addr, fb_img FROM ' + country.key + '_events where CHAR_LENGTH(body)>140 and dtstart < UNIX_TIMESTAMP(DATE_ADD(NOW(), INTERVAL 8 DAY)) and dtend > UNIX_TIMESTAMP(DATE_ADD(NOW(), INTERVAL 1 DAY)) order by dtend asc')
            .then(function (results) {
                events = results;
                //console.log(events);

                for (var i = 0; i < events.length; i++) {
                    events[i].ct = country.key;
                    events[i].url = country.url + "/events/" + events[i].id + "/" + conf.slugify(events[i].h1);
                    events[i].dtstart = (new Date(events[i].dtstart * 1000)).toISOString();
                    events[i].dtend = (new Date(events[i].dtend * 1000)).toISOString();
                }

                var data = {
                    site: {
                        countries: hosts,
                    },
                    page: {
                        /*
                         keywords:event.keywords,
                         description:event.description,
                         thumbnail:event.canonical,
                         */
                        h1: 'This week events',

                        country: country,

                        lat: country.lat,
                        lng: country.lng
                    },
                    events: events,

                }
                res.render('events', data);
            });
    } else {
        res.render('events');
    }
});

module.exports = router;
