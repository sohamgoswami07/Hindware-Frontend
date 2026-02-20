
function load_scene(elementId) {
    this.canvas = document.getElementById(elementId);
    let loadp = this;
    this.startRenderLoop = function (engine, canvas) {
        engine.runRenderLoop(function () {
            if ( loadp.autoRotate ) {
                loadp.camera.rotation.set(
                    loadp.camera.rotation._x, loadp.camera.rotation._y + 0.004, loadp.camera.rotation._z
                );
            }
            if ( loadp.camera && loadp.data && loadp.data.azimuthal_boundary && loadp.camera.rotation._x < loadp.data.azimuthal_boundary ) {
                loadp.camera.rotation.set(
                    loadp.data.azimuthal_boundary, loadp.camera.rotation._y, loadp.camera.rotation._z
                );
            }
            if (loadp.scene && loadp.scene.activeCamera) {
                loadp.scene.render();
            }
        });
    }
    this.engine = null;
    this.scene = null;
    this.camera = null
    this.sceneToRender = null;
    this.createDefaultEngine = function() { 
        loadp.engine = new BABYLON.Engine(loadp.canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); 
        loadp.engine.displayLoadingUI()
        return loadp.engine;
    };
    this.load_room = function (room_id, data, onLoadFunc) {
        room_id = room_id || 'bathroom_large';
        loadp.room_id = room_id;
        data = data || {};
        textures = data.textures || {};
        collider = data.collider || {
            height: 40,
            width: 100,
            depth: 60
        };
        data.camera_position = data.camera_position || [20, 20, 0];
        data.camera_target = data.camera_target || [0, 20, 0];
        loadp.data = data;
        loadp.scene = new BABYLON.Scene(engine);
        // Set up the camera
        loadp.camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(data.camera_position[0],
            data.camera_position[1], data.camera_position[2]
        ), loadp.scene);
        loadp.camera.setTarget(
            new BABYLON.Vector3(
                data.camera_target[0], data.camera_target[1], data.camera_target[2]
            )
        );
        loadp.camera.attachControl(loadp.canvas, true);
        // Fine tune the controls
        loadp.camera.inputs.attached.touch.singleFingerRotate = true;
        loadp.camera.inputs.attached.mouse.touchEnabled = true;
        loadp.camera.inputs.attached.touch.touchAngularSensibility = 10000;
        loadp.camera.inputs.attached.touch.touchMoveSensibility = 100;
        loadp.camera.fov = loadp.data.fov || 0.65;
        loadp.camera.inertia = loadp.data.inertia || 0.8;
        camera.invertRotation = true;
        console.log('camerainverted')
        //set up the room collider to avoid going out of the room
        loadp.camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);   // this is required for the collider to work
        if ( typeof(collider) == 'string' ) {
            loadp.collider = collider;
        } else {
            collider.sideOrientation = BABYLON.Mesh.BACKSIDE
            loadp.collider = BABYLON.MeshBuilder.CreateBox("collider_box", collider, loadp.scene);
        }
        if (data.collider_position) {
            // Required if the centre of the room does not correspond with the centre of the collider
            loadp.collider.position.set(data.collider_position[0], data.collider_position[1], data.collider_position[2])
            loadp.collider.isVisible = false;
        }
        loadp.scene.collisionsEnabled = true
        // White colour instead of the usual babylon colour
        loadp.scene.clearColor = new BABYLON.Color3(1, 1, 1);
        loadp.reflective_meshes = data.reflective_meshes;
        if (loadp.data.loader_dome) {
            loadp.loader_dome = new BABYLON.PhotoDome(
                "loader",
                loadp.data.loader_dome,
                {
                    useDirectMapping: true,
                    autoPlay: true,
                    loop: true,
                    clickToPlay: true
                },
                scene
            );
            loadp.loader_dome.isPickable = false;
            loadp.engine.hideLoadingUI();
            let f = function() {
                if ( loadp.interactive_loaded ) {
                    delete loadp.loader_timer;
                    loadp.showInteractive();
                } else {
                    loadp.loader_timer = setTimeout(f, 500);
                }
            }
            loadp.loader_timer = setTimeout(f, 5000);
        }
        loadp.room = new BABYLON.SceneLoader.Append(
            "/assets/glb/",
            room_id + ".glb",
            loadp.scene,
            function(scene) {
                scene.meshes.map(function(m) {
                    m.isPickable = false; m.checkCollisions = false; 
                    if ( loadp.data.loader_dome ) {
                        if ( m.name != 'loader_mesh' ){
                            m.isVisible = false;
                        }
                    }
                    if (m.material) {
                        m.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
                        m.material.emissiveIntensity = loadp.data.ambient_intensity || 1;
                    }
                });
                // Required to prevent going out of room
                if ( typeof ( loadp.collider ) == 'string' ) {
                    loadp.collider = loadp.scene.getMeshByName(loadp.collider);
                }
                loadp.collider.checkCollisions = true;
                loadp.collider.isVisible = false;
                loadp.camera.checkCollisions = true;
                if (onLoadFunc && typeof( onLoadFunc ) == 'function' ) {
                    onLoadFunc(scene)
                }
                loadp.interactive_loaded = true;
                if ( !loadp.data.loader_dome ) {
                    loadp.engine.hideLoadingUI()
                } else {
                    loadp.hideSprites();
                }
                // Add HDR for reflective surfaces
                if ( loadp.data.hdr ) {
                    loadp.hdrTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData(
                        loadp.data.hdr, loadp.scene
                    );
                    //loadp.scene.environmentTexture = loadp.hdrTexture;
                }
                // For all the custom textures, e.g. with alpha or metallic etc.
                for (let [k, tk] of Object.entries(textures)) {
                    loadp.doMaterial(k, tk);
                }
                // Working on the mirror
                try {
                    loadp.createMirror(loadp.reflective_meshes, loadp.data.mirror_plane_distance, loadp.data.mirror_plane_normals, true);
                } catch(e) {
                    console.error(e);
                }
                // Make the collider invisible
                loadp.collider.isVisible = false;
                // Add the exterior dome for setting up the exteriors
                if (loadp.data.dome) {
                    loadp.dome = new BABYLON.PhotoDome(
                        "exterior",
                        "/assets/img/" + (loadp.data.dome || 'forest.jpg'),
                        {
                            useDirectMapping: false,
                        },
                        scene
                    );
                    if ( loadp.loader_dome ) {
                        loadp.dome.setEnabled(false);
                    }
                    loadp.dome.isPickable = false;
                    loadp.dome.is_pickable = false;
                }
            }
        );
        // Adding the sprites
        loadp.spriteManager = new BABYLON.SpriteManager("teleporter", 'assets/img/tag.png', 20, {width: 128, height: 128}, loadp.scene);
        loadp.spriteManager.isPickable = true;
        loadp.spriteManager.is_pickable = true;
        return loadp.scene;
    };
    this.resetCamera = function(position, target) {
        position = position || loadp.data.camera_position
        target = target || loadp.data.camera_target
        loadp.autoRotate = false;
        loadp.camera.position.set(position[0], position[1], position[2])
        loadp.camera.setTarget(
            new BABYLON.Vector3(
                target[0], target[1], target[2]
            )
        );
    }
    this.doMaterial = function(k, tk, m) {
        m = m || loadp.scene.getMeshByName(k);
        if ( tk.dispose ) {
            m.dispose();
        } else {
            if (tk.alpha) {
                m.material = new BABYLON.StandardMaterial('material_' + k, loadp.scene);
                m.hasVertexAlpha = true;
                m.material.alpha = 0.1;
                if ( loadp.hdrTexture ) {
                    m.material.reflectionTexture = loadp.hdrTexture;
                }
            }
            for ( k1 of ['emissiveIntensity', 'specularIntensity', 'metallic', 'roughness'] ) {
                if ( tk[k1] ) {
                    m.material[k1] = tk[k1];
                }
            }
            if ( tk.glossy && loadp.hdrTexture ) {
                m.material.reflectionTexture = loadp.hdrTexture;
            }
            for ( k1 of ['albedoColor', 'metallicReflectanceColor'] ) {
                if ( tk[k1] ) {
                    m.material[k1] = new BABYLON.Color3(tk[k1][0], tk[k1][1], tk[k1][2]);
                }
            }
            if ( tk.visibility != undefined ) {
                m.visibility = tk.visibility;
            }
            if (tk.rename) {
                m.name = tk.rename;
                m.id = tk.rename;
            }
        }
    }
    this.makeRotationAnimation = function() {
        loadp.camera.rotation.set(loadp.camera.rotation._x, loadp.camera.rotation._y + 0.1, loadp.camera.rotation._z);
    }
    this.setSprite = function(name, position, size, width, height) {
        let s = new BABYLON.Sprite("sprite_" + name, loadp.spriteManager)
        s.isPickable = true;
        s.is_pickable = true;
        s.position.x = position[0];
        s.position.y = position[1];
        s.position.z = position[2];
        s.width = width || size || 2;
        s.height = height || size || 2;
    }
    this.getRayCast = function() {
        let pp1 = loadp.scene.pick(loadp.scene.pointerX, loadp.scene.pointerY);
        let pp = pp1.pickedPoint;
        console.log(pp1.pickedMesh.name);
        console.log(`{x: ${pp._x}, y: ${pp._y}, z: ${pp._z}}`);
        return pp._x, pp._y, pp._x
    }
    this.pickMesh = function( hitFunc, notHitFunc ) {
        let pp1 = loadp.scene.pick(loadp.scene.pointerX, loadp.scene.pointerY);
        if (pp1.hit) {
            let pp = pp1.pickedPoint;
            console.log(`Picked Mesh: {x: ${pp._x}, y: ${pp._y}, z: ${pp._z}}`);
            pp = pp1.pickedMesh.name;
            console.log('Picked', pp);
            if ( hitFunc && typeof(hitFunc) == 'function' ) {
                hitFunc(pp)
            }
        } else {
            if ( notHitFunc && typeof(notHitFunc) == 'function' ) {
                notHitFunc()
            }
        }
    }
    this.focusOnMesh = function(mesh_id, camera_position, look_at) {
        this.camera.position = new BABYLON.Vector3(camera_position[0], camera_position[1], camera_position[2]);
        if (!look_at) {
            this.camera.setTarget(this.scene.getMeshByName(mesh_id).position);
        } else {
            this.camera.setTarget(new BABYLON.Vector3(look_at[0], look_at[1], look_at[2]));
        }
    }
    this.pickSprite = function( hitFunc, notHitFunc ) {
        let pp = loadp.scene.pickSprite(loadp.scene.pointerX, loadp.scene.pointerY);
        console.debug("Trying to pick sprite", pp);
        if (pp.hit) {
            console.log('Picked', pp.pickedSprite.name);
            if ( hitFunc && typeof(hitFunc) == 'function' ) {
                hitFunc(pp.pickedSprite.name.split('_').slice(1).join('_'))
            }
        } else {
            if ( notHitFunc && typeof(notHitFunc) == 'function' ) {
                notHitFunc()
            }
        }
    }
    this.createMirror = function(reflective_meshes, distance, normals, hide) {
        loadp.mirrors = [];
        let r = loadp.scene.getMeshByName('__root__');
        new BABYLON.SceneLoader.ImportMesh(null,
            "/assets/glb/",
            room_id + "_mirror.glb",
            loadp.scene,
            function(mesh) {
                try {
                    let root = mesh[0];
                    root.getChildMeshes().forEach(m1 => {
                        let k = m1.name;
                        let glass = loadp.scene.getMeshByName(k);
                        glass.computeWorldMatrix(true);
                        var glass_worldMatrix = glass.getWorldMatrix();

                        //Obtain normals for plane and assign one of them as the normal
                        var glass_vertexData = glass.getVerticesData("normal");
                        var glassNormal = new BABYLON.Vector3(glass_vertexData[0], glass_vertexData[1], glass_vertexData[2]);
                        //Use worldMatrix to transform normal into its current value
                        glassNormal = new BABYLON.Vector3.TransformNormal(glassNormal, glass_worldMatrix)

                        //Create reflecting surface for mirror surface
                        var reflector = new BABYLON.Plane.FromPositionAndNormal(glass.position, glassNormal.scale(-1));
                        if ( distance !== undefined && distance !== null ) {
                            reflector.d = distance 
                        }
                        if ( normals !== undefined && normals !== null ) {
                            reflector.normal.set(normals[0], normals[1], normals[2]);
                        }
                        //Create the mirror material
                        var mirrorMaterial = new BABYLON.StandardMaterial("material_mirror_" + k, loadp.scene);
                        mirrorMaterial.reflectionTexture = new BABYLON.MirrorTexture("texture_mirror_" + k, 1024, loadp.scene, true);
                        mirrorMaterial.reflectionTexture.mirrorPlane = reflector;
                        mirrorMaterial.reflectionTexture.renderList = reflective_meshes.map(function(m) {return loadp.scene.getMeshByName(m)});
                        mirrorMaterial.reflectionTexture.level = 1;
                        //mirrorMaterial.diffuseColor = new BABYLON.Color3( 0.3, 0.3, 0.3 );
                        glass.material = mirrorMaterial;
                        loadp.mirrors.push(glass);
                        if ( hide && loadp.loader_dome ) {
                            m1.isVisible = false;
                        }
                        m1.parent = r;
                        m1.isPickable = false;
                        m1.is_pickable = false;
                    });
                    root.dispose();
                } catch(e) {
                    console.log(e);
                }
            }
        );

		//Ensure working with new values for glass by computing and obtaining its worldMatrix

    }
    this.createSkyBox = function() {
        loadp.hideSprites();
        let pfov = loadp.camera.fov; 
        loadp.camera.fov = Math.PI/2;
        //cameraB.minZ = 0.01;
        const rotations = [
            [0, 0],
            [0, Math.PI/2],
            [0, Math.PI],
            [0, -Math.PI/2],
            [Math.PI/2, Math.PI],
            [-Math.PI/2, Math.PI]
        ]
        const names = ['px', 'nz', 'nx', 'pz', 'ny', 'py'];
        f = function(i) {
            if (i >= rotations.length ) {
                loadp.camera.fov = pfov;
                loadp.resetCamera();
                return
            }
            loadp.camera.rotation.set(rotations[i][0], rotations[i][1], 0);
            setTimeout(function() {
                BABYLON.Tools.CreateScreenshotUsingRenderTarget(loadp.engine, loadp.camera, {width: 2048, height: 2048}, function(data) {
                    var link = document.createElement('a');
                    link.href = data; //`data:image/jpeg;base64,${data}`;
                    link.target = '_blank';
                    link.download = room_id + '_' + names[i] + '.jpg';
                    link.click();
                    link.remove();
                    loadp.resetCamera();
                    setTimeout(function() {
                        f(i+1);
                    }, 1000);
                },  'image/jpeg', null, true);
            }, 1000);
        }
        loadp.resetCamera();
        f(0);
    }
    this.startAutoRotate = function() {
        loadp.resetCamera(loadp.data.room_centre, loadp.data.autorotate_target);
        loadp.autoRotate = true;
    }

    this.stopAutoRotate = function() {
        loadp.autoRotate = false;
    }
    canvas.addEventListener("click", function(event) {
        if (loadp.autoRotate == true) {
            loadp.autoRotate = false;
            console.debug('autorotate_turned_off')
        } else{
            console.debug('autorotate_off')
        }
    });
    this.showSprites = function(png) {
        loadp.spriteManager.sprites.map(function(m) {
            let c = BABYLON.Vector3.Project(m.position,
                BABYLON.Matrix.Identity(),
                loadp.scene.getTransformMatrix(),
                loadp.camera.viewport.toGlobal(
                    engine.getRenderWidth(),
                    engine.getRenderHeight()
                )
            )
            if ( png && typeof(png) == 'function' ) {
                m.isVisible = false;
                png(c.x, c.y);
            } else {
                m.isVisible = true;
            }
        });
    }
    this.showInteractive = function() {
        if ( !loadp.loader_dome ) {
            return;
        }
        loadp.scene.getMeshByName('__root__').getChildren().map(function(m_) { m_.isVisible = true; });
        if ( loadp.dome ) {
            loadp.dome.setEnabled(true);
        }
        loadp.loader_dome.isVisible = false;
        loadp.loader_dome.dispose();
        loadp.showSprites();
        delete loadp.loader_dome;
    }
    this.hideSprites = function() {
        loadp.spriteManager.sprites.map(function(m) {m.isVisible = false});
    }
    this.switchMeshes = function(mesh1, mesh2, onLoadFunc) {
        console.log("Switching between " + mesh1 + " and " + mesh2)
        let m = loadp.scene.getMeshByName(mesh1);
        let r = loadp.scene.getMeshByName('__root__');
        BABYLON.SceneLoader.ImportMesh(null, "/assets/glb/" +loadp.room_id +'/', mesh2 + '.glb', loadp.scene, function(mesh) {
            let root = mesh[0];
            //body is our actual player mesh
            root.getChildMeshes().forEach(m1 => {
                let mn = m1.name.split('.')[0]
                let ms = loadp.scene.getMeshesById(mn);
                if ( mesh2.indexOf(mn) < 0 ) {
                    if ( ms.length > 1 ) {
                        ms = ms.slice(0, -1);
                    }
                    for ( let k of ms ) {
                        k.dispose();
                    }
                    m1.name = mn;
                    m1.id = mn;
                    m1.isPickable = false;
                } else {
                    if ( ms.length > 1 ) {
                        ms = ms.slice(0, -1);
                        for ( let k of ms ) {
                            k.dispose();
                        }
                    }
                    m1.isPickable = true;
                    m1.name = mesh1;
                }
                m1.parent = r;
                m1.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
                m1.material.emissiveIntensity = loadp.data.ambient_intensity || 1;
                m1.checkCollisions = false;
                if ( loadp.data.textures[m1.name] ) {
                    loadp.doMaterial(m1.name, loadp.data.textures[m1.name], m1);
                }
            });
            root.dispose();
            if (m) {
                m.dispose();
            }
            loadp.mirrors.map(function(m_) { m_.material.reflectionTexture.renderList = loadp.reflective_meshes.map(function(m__){return loadp.scene.getMeshByName(m__)})});
            if ( onLoadFunc && typeof(onLoadFunc) == 'function' ) {
                onLoadFunc();
            }
        });
    }
    return loadp;
}

window.initFunction = async function(elementId, room_id, onLoadFunc) {
    room_id = room_id || 'bathroom_large';
    let p = load_scene(elementId);
    var asyncEngineCreation = async function() {
        try {
            return p.createDefaultEngine();
        } catch(e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return p.createDefaultEngine();
        }
    }
    window.engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    p.startRenderLoop(engine, canvas);
    fetch('/assets/json/room_maps.json').then((response) => response.json()).then(function(data) {
        window.scene = p.load_room(room_id, data[room_id], onLoadFunc);
    });
    return p;
};
window.addEventListener("resize", function () {
    window.engine.resize();
});
BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
    document.getElementById("loader").style.display = "block";
};
BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function(){
    document.getElementById("loader").style.display = "none";
    document.getElementById("loader2").style.display = "none";
    console.log("scene is now loaded");
}



    
    
