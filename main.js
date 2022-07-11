// IIFE
(() => {
    // Source: https://github.com/bbecquet/Leaflet.RotatedMarker

    //create map in leaflet and tie it to the div called 'theMap'
    let map = L.map('theMap').setView([42, -60], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let geoJSONLayer = null;

    const runFetch = () => {
        fetch('https://opensky-network.org/api/states/all', {
            //Source: https://stackoverflow.com/questions/45781924/how-to-pass-credentials-through-a-fetch-request
                method: 'GET',
                credentials: 'same-origin',
                redirect: 'follow',
                agent: null,
                headers: {
                    "Content-Type": "text/plain",
                    'Authorization': 'Basic ' + btoa('minth1123:NSH59aYm!pgA4XB'),
                },
                timeout: 5000
        })
        .then(response => response.json())
        .then(data => {
            var planeIcon = L.icon({
                iconUrl: 'plane2.png',
                iconSize:     [38, 38], // size of the icon
                iconAnchor:   [25, 16], // point of the icon which will correspond to marker's location
                popupAnchor:  [-5, -10] // point from which the popup should open relative to the iconAnchor
            });

            let newState = [];
            newState = data.states.filter( (state) => state[2] === "Canada")
                                    .map( (state) => {
                                        return{
                                            icao: state[0],
                                            callSign: state[1],
                                            baroAltitude: state[7],
                                            onGround: state[8],
                                            velocity: state[9],
                                            trueTrack: state[10],
                                            verticalRate: state[11],
                                            geoAltitude: state[13],
                                            longitude: state[5],
                                            latitude: state[6]
                                        }
                                    })

            let geojsonFeature = (state) => {
                return state.map((data)=>{
                    return {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "properties": {
                                    "Call Sign": data.callSign,
                                    "Baro Altitude": data.baroAltitude,
                                    "On Ground": data.onGround,
                                    "Velocity": data.velocity,
                                    "True Track": data.trueTrack,
                                    "Vertical Rate": data.verticalRate,
                                    "Geo Altitude": data.geoAltitude,
                                    "ICAO": data.icao
                                },
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [data.longitude, data.latitude]
                                }
                            }
                        ]
                    }
                });
            };

            //Remove markers if they exist
            if(geoJSONLayer !== null){
                geoJSONLayer.remove(map);
            };

            //Add markers to the map
            geoJSONLayer = L.geoJSON(geojsonFeature(newState),{
                pointToLayer: (geJsonPoint, latlng) => { 
                    return L.marker(latlng, {rotationAngle: geJsonPoint.properties["True Track"], icon:planeIcon})
                    .bindPopup("Call Sign: " + geJsonPoint.properties["Call Sign"] + 
                                        "<br>Baro Altitude: " + geJsonPoint.properties["Baro Altitude"] + 
                                        "<br>On Ground: " + geJsonPoint.properties["On Ground"] + 
                                        "<br>Velocity: " + geJsonPoint.properties["Velocity"] + 
                                        "<br>True Track: " + geJsonPoint.properties["True Track"] +
                                        "<br>Vertical Rate: " + geJsonPoint.properties["Vertical Rate"] +
                                        "<br>Geo Altitude: " + geJsonPoint.properties["Geo Altitude"]);
                }
            }).addTo(map)

        }) //end fetch
    } // end runFetch

    runFetch();
    setInterval(runFetch, 4000);
})() // end IIFE