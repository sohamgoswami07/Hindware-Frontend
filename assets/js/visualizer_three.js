let controls, camera, frontCamera, backCamera, renderer, scene, camPoint;
var manager = new THREE.LoadingManager();
manager.objects = []
manager.onStart = function ( url ) {
    manager.objects.push(url);
};
manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    $( ".loader-span" ).show();
    $( ".loader-span" ).text(Math.round(100*itemsLoaded/itemsTotal) + '%')
}
manager.onLoad = function () {
    if (manager.objects.length > 0 ) {
        manager.objects.splice(0,1);
    }
    if ( manager.objects.length <= 0 ) {
        if ( init ) {
            resize_canvas();
        }
        $( ".loader-span" ).hide();
        $( ".loader" ).hide();
        show_sprites();
    }
};
const loader = new THREE.FBXLoader(manager);
var spriteMap = new THREE.TextureLoader(manager).load('assets/img/tag.png');
var spriteMapSelected = new THREE.TextureLoader(manager).load('assets/img/otag.png');

function zoom() {
    return init.controls.target.distanceTo( init.controls.object.position );
}

function resize_canvas( cont ) {
    cont = cont || $( ".canvasContainer" );
    init.camera.aspect = cont.innerWidth() / cont.innerHeight();
    init.camera.updateProjectionMatrix();
    init.renderer.setSize( cont.innerWidth(), cont.innerHeight() );
    init.controls.update();
}

function to_room_name(room) {
    return room;
}
function load_material(room, material) {
    room_name = to_room_name(room)
    material = material || {}
    material.sprite = new THREE.SpriteMaterial({
        map: spriteMap,
    });
    material.spriteSelected = new THREE.SpriteMaterial({
        map: spriteMapSelected,
    });
    material.base = new THREE.MeshLambertMaterial({
        map: new THREE.TextureLoader(manager).load("assets/tex/" + room_name + "/wall.jpg"),
        combine: THREE.MixOperation,
        side: THREE.DoubleSide,
    });
    material.prop = new THREE.MeshLambertMaterial({
        map: new THREE.TextureLoader(manager).load("assets/tex/" + room_name + "/props.jpg"),
        combine: THREE.MixOperation,
        side: THREE.DoubleSide,
    });
    material.outside_view = new THREE.MeshLambertMaterial({
        map: new THREE.TextureLoader(manager).load("assets/tex/" + room_name + "/bg.jpg"),
        combine: THREE.MixOperation,
        side: THREE.DoubleSide
    });
    material.floor = new THREE.MeshLambertMaterial({
        map: new THREE.TextureLoader(manager).load("assets/tex/" + room_name + "/floor.jpg"),
        combine: THREE.MixOperation,
        side: THREE.DoubleSide,
    });
    return material
}
function hide_sprites(surfaces, rid) {
    for( let k in surfaces[rid] ) {
        let o = init.scene.getObjectByName(k + '_sprite');
        if ( o ) {
            o.visible = false;
        }
    }
}
function show_sprites(surfaces, rid) {
    for( let k in surfaces[rid] ) {
        let o = init.scene.getObjectByName(k + '_sprite');
        if ( o ) {
            o.visible = true;
        }
    }
}

function change_sprite(surfaces, rid, cs) {
    for( let k in surfaces[rid] ) {
        let o = init.scene.getObjectByName(k + '_sprite');
        if ( o ) {
            o.material = material.sprite;
        }     
    }
    let o = init.scene.getObjectByName(cs + '_sprite');
    if ( o ) {
        o.material = material.spriteSelected;
    }
}
function do_select_surface(selected) {
    console.log("Selected object");
    console.log(selected);
    current_surface = selected;
    update_selected_area( selected );
    setCookie("object_id", selected);
    change_sprite(selected);
    camAnimation.apply(null, surfaces[current_room][selected]["cam"]);
    $( "#search" ).val("");
    if ( !shown_category_help ) {
        open_filters();
        helpOverlay.addLabelTo($( '#inspiration-side' ).find('img').first(), "STEP 2: NOW SELECT A DESIGN CATEGORY", "bottomright", 1, 200, null);
        setTimeout(function() {
            helpOverlay.remove();
        }, 10000);
        shown_category_help = true;
        helps["shown_category_help"] = shown_category_help;
        setCookie("helps", helps);
    }
    update_customer({'selected_surfaces': selected, "_async": true}, headersfromcookie);
    if ( surfaces[current_room][current_surface].allowed_product ) {
        let ap = surfaces[current_room][current_surface].allowed_product;
        let name = design_categories[ap].name || toTitleCase(ap);
        let level = design_categories[ap].level || "design_category";
        if ( options[level] != toQueryType(name) ) {
            swal({
                title: "Specialized surface",
                text: "This surface has very specialized designs applicable!",
                icon: "warning",
                buttons: {
                    cancel: true,
                    confirm: "Load relevant designs!"
                }
            }).then(
                function(isConfirm) {
                    if (isConfirm ) {
                        $( "#" + ap ).click();
                    }
                }
            );
        }
    }
}


class sceneSetup {
    constructor(FOV, near, far, x, y, z, ambientColor,imgCam, room_cameras) {

        this.container = document.getElementById("canvas");
        this.scene = new THREE.Scene();
        this.addingCube();
        this.cameras(FOV, near, far, x, y, z);
        this.imgCamera(imgCam);
        this.ambientLight(ambientColor);
        this.render();
        this.room_cameras = room_cameras
        self = this;
    }
    cameras(FOV, near, far, x, y, z) {
        //console.log(this.container);
        this.camera = new THREE.PerspectiveCamera(FOV, this.container.offsetWidth / this.container.offsetHeight, near, far);
        this.camera.position.set(x, y, z);
        this.scene.add(this.camera);
        this.rendering();
    }
    imgCamera(getInfo){
        let _c = getInfo;

        for(let i=0;i < _c.length ;i++){
            this.rendCam = new THREE.PerspectiveCamera(50, this.container.offsetWidth / this.container.offsetHeight, 10, 5000000); 
            this.rendCam.position.set(_c[i].x ,_c[i].y , _c[i].z );
            this.rendCam.name = _c[i].name;
            this.rendCam.lookAt(new THREE.Vector3(_c[i].lX ,_c[i].lY , _c[i].lZ));
            this.scene.add(this.rendCam);
            console.log(this.rendCam);
        }
    }
    rendering() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0xffffff);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.container.appendChild(this.renderer.domElement);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        for (k of ['minDistance', 'maxDistance', 'minPolarAngle', 'maxPolarAngle', 'minAzimuthAngle', 'maxAzimuthAngle', 'boundaries'] ) {
            this.controls[k] = this.room_cameras[current_room][k]
        }
        this.controls.noPan = true;
        this.renderer.domElement.addEventListener('mousedown', this.onDocumentMouseDown, false);
    }
    onDocumentMouseDown(event) {
        event.preventDefault();

        mouse.x = (event.layerX / self.container.offsetWidth) * 2 - 1;
        mouse.y = - (event.layerY / self.container.offsetHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, self.camera);
        let intersects = raycaster.intersectObjects(objects);
        for ( k in intersects ) {
            let s = intersects[k]
            console.log(s);
            let SELECTED = s.object.name;
            if ( s.object.position.distanceTo(s.point) <= get_sprite_size() ) {
                do_select_surface(SELECTED.substring(0, SELECTED.length - 7));
                break;
            }
        }
    }
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
    }
    render() {
        this.animate();
    }
    addSprite(scal, posX, posY, posZ, name) {
        this.sprite = new THREE.Sprite(material.sprite);
        this.sprite.name = name;
        this.sprite.scale.set(scal, scal, 1);
        this.sprite.position.set(posX, posY, posZ);
        this.scene.add(this.sprite);
        objects.push(this.sprite);
    }
    addingCube() {
        this.geo = new THREE.BoxBufferGeometry(0, 0, 0);
        this.mat = material.cube;
        this.camPoint = new THREE.Mesh(this.geo, this.mat);
        this.scene.add(this.camPoint);
        this.camPoint.position.set(0, 0, 0);
        this.camPoint.visible = false;
    }
    ambientLight(ambientColor) {
        this.light = new THREE.AmbientLight(0xffc18d);
        this.light = new THREE.AmbientLight(0xffffff);
        this.scene.add(this.light);
        let rn = to_room_name(current_room, current_lighting);
        if (rn == "office")  {
            this.directionalLight = new THREE.DirectionalLight( 0xffffff, 0.05 );
        } else {
            this.directionalLight = new THREE.DirectionalLight( 0xffffff, 0.0001 );
        }
        this.directionalLight.castShadow = true;
        this.scene.add( this.directionalLight );
    }
}

$( document ).ready(function() {
    room_camers
    init = new sceneSetup(50, 1, 50000, room_cameras[current_room].x, room_cameras[current_room].y, room_cameras[current_room].z, 0xffff00, _imgCam);
});
