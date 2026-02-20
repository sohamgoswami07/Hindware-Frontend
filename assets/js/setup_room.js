get_url_params = function (index, qd) {
    qd = qd || {};
    if (location.search) location.search.substr(1).split("&").forEach(function (item) {
        var s = item.split("="),
            k = s[0],
            v = s[1] && decodeURIComponent(s[1]); //  null-coalescing / short-circuit
        //(k in qd) ? qd[k].push(v) : qd[k] = [v]
        (qd[k] = qd[k] || []).push(v) // null-coalescing / short-circuit
    })
    if ( index ) {
        return qd[index]
    }
    return qd;
}
let room_id = makeSingle(get_url_params('room_id') || 'bathroom_large');
let sprites = {};
let selection = {};
let selected_meshes = {};

function get_sprite_size() {
    return Math.max((1024 - window.outerWidth)/14, 0) + 3;
}

function isSupportPDF() {
    if ( navigator.pdfViewerEnabled ) {
        return true;
    }
    var hasPDFViewer = false;
    try {
        var pdf =
            navigator.mimeTypes &&
            navigator.mimeTypes["application/pdf"]
                ? navigator.mimeTypes["application/pdf"].enabledPlugin
                : 0;
        if (pdf) { return true; };
    } catch (e) {
        if (navigator.mimeTypes["application/pdf"] != undefined) {
            return true;
        }
    }
    return false;
}

$( document ).ready(function() { 
    initFunction('renderCanvas', room_id, function(scene) {
        let s = window.p.data.variable_meshes;
        for ( const [k, g] of Object.entries(s) ) {
            console.log("Loading variable surface", g.default)
            let m = scene.getMeshByName(g.default)
            m.isPickable = true;
            m.is_pickable = true;
            m.name = k;
            sprites[k] = g
            sprites[k].id = k;
            window.p.setSprite(k, g.surface_points, g.size);
        }
        var timer;
        $( "#renderCanvas" ).on('mousemove keypress touchstart', function(){
            window.p.pickMesh(function(name) {
                console.debug("Picked mesh: " +  name);
                clearTimeout(timer);
                window.p.showSprites();
                timer = setTimeout(function(){
                    window.p.hideSprites();
                }, 1500);
            }, function() {
                console.debug("Not hit any pickable mesh");
            });
        });
        $( '#renderCanvas').on("click", function() {
            window.p.pickMesh(function(name) {
                console.debug("Picked mesh: " +  name);
                //getProductCategories(name)
            }, function() {
                console.debug("Not hit any pickable mesh");
            });
            window.p.pickSprite(function(name) {
                console.log("Picked sprite: " +  name);
                getProductCategories(name);
                $( ".nav-open .downbtn" ).click();
            }, function() {
                console.debug("Not hit any sprite");
            });
        });
        if ( window.scene_loaded && typeof ( window.scene_loaded ) == 'function' ) {
            window.scene_loaded();
        }
        apply_selected_from_url();
    }).then((p) => {
        window.p = p;
        p.sceneToRender = p.scene;
    });
    $('#startbtn').on('click', function() {
        $('#startcover').toggleClass('hidesection');
    });
});
function post_interaction(params, stage, rid, callbackFunc, errorFunc) {
    rid = rid || room_id;
    params = params || {};
    stage = stage || ( params['category_name'] ? 'viewed' : 'visited');
    let HEADERS = getCookie('authentication');
    params["customer_id"] = getCookie('customer_id');
    params["room_id"] = rid;
    params["stage"] = stage;
    params["_async"] = (stage == 'shortlisted' ? false : true);
    if ( params.category_name && params.product_id ) {
        selection[params.category_id] = params;
        selected_meshes[params.category_id] = params.mesh_id;
    }
    // Only POST to backend if a real API URL is configured
    if ( dave_url ) {
        ajaxRequestWithData(
            dave_url + "/object/interaction",
            'POST', HEADERS, JSON.stringify(params), callbackFunc, errorFunc
        );
    } else {
        console.info("[Demo Mode] post_interaction skipped — no API URL configured.", params);
        if ( callbackFunc && typeof(callbackFunc) == 'function' ) { callbackFunc({}); }
    }
    if ( typeof(gtag) != 'undefined' ) {
        gtag('event', 'click', {
            'room_id': room_id,
            'event_category': 'product_view--' + rid,
            'event_label': rid + '--' + (params.category_name || '') + '--' + (params.product_id || '')
        });
    }
}
function get_product_wishlist(callbackFunc, errorFunc) {
    let rid = room_id;
    let stage = 'shortlisted'
    let HEADERS = getCookie('authentication');
    params = {
        "customer_id": getCookie('customer_id'),
        "room_id": rid,
        "stage": stage,
        "_action": "object_list",
        "_over": "category_name",
        "_fresh": true
    }
    ajaxRequestWithData(
        dave_url + "/pivot/interaction/category_name",
        'GET', HEADERS, params, callbackFunc, errorFunc
    )
}

function add_product_wishlist(params, callbackFunc, errorFunc) {
    post_interaction(params, 'shortlisted', callbackFunc, errorFunc);
}

function remove_product_wishlist(interaction_id, callbackFunc, errorFunc) {
    let HEADERS = getCookie('authentication');
    ajaxRequestWithData(
        dave_url + "/object/interaction/" + interaction_id,
        'DELETE', HEADERS, JSON.stringify({}), callbackFunc, errorFunc
    )
}
function add_room_wishlist(callbackFunc, errorFunc) {
    let HEADERS = getCookie('authentication');
    let rid = room_id;
    take_snapshots(function(img) {;
        ajaxRequestWithData(
            dave_url + "/object/wishlist",
            'POST', HEADERS, JSON.stringify({
                "room_id": rid,
                "selection": selection,
                "customer_id": getCookie('customer_id')
            }), callbackFunc, errorFunc
        )
    });
}
function get_room_wishlist(callbackFunc, errorFunc) {
    let HEADERS = getCookie('authentication');
    let rid = room_id;
    ajaxRequestWithData(
        dave_url + "/objects/wishlist",
        'GET', HEADERS, {
            "room_id": rid,
        }, callbackFunc, errorFunc
    )
}

function delete_room_wishlist(wishlist_id, callbackFunc, errorFunc) {
    let HEADERS = getCookie('authentication');
    ajaxRequestWithData(
        dave_url + "/object/wishlist/" + wishlist_id,
        'DELETE', HEADERS, JSON.stringify({}), callbackFunc, errorFunc
    )
}

function apply_room_wishlist(sel, callbackFunc, errorFunc) {
    selc = Object.assign({}, (sel || selection));
    for (let k in sel) {
        let s = selc[k];
        p.switchMeshes(k, k+"/"+s.mesh_id);
    }
}

function apply_selected(sel, callbackFunc, errorFunc) {
    selc = Object.assign({}, (sel || selected_meshes));
    let n = 0;
    for (let k in sel) {
        let s = selc[k];
        n++;
        if ( n >= sel.length ) {
            p.switchMeshes(k, k+"/"+s, callbackFunc);
        } else {
            p.switchMeshes(k, k+"/"+s);
        }
    }
}

function apply_selected_from_url(callbackFunc, errorFunc) {
    sel = get_url_params();
    delete sel.room_id;
    apply_selected(sel, callbackFunc, errorFunc);
}

function create_copy_url() {
    let url = document.location.href
    if (window.URLSearchParams !== undefined ) {
        var searchParams = new URLSearchParams(window.location.search)
        Object.entries(selected_meshes).map(function(k, v) {
            searchParams.set(k[0], k[1]);
            return true;
        });
        url = document.location.origin + window.location.pathname + '?' + searchParams.toString();
    }
    return url
}

