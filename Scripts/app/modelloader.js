var container, stats;
var camera, scene1, scene2, renderer, objects, controls, axis, object, grids, mesh, clock, currentShape = 0;
var SCALE = .02;
var objects = [];
var mouseX = 0;                                               // Mouse X pos relative to window centre
var mouseY = 0;
var windowCentreX = window.innerWidth / 2;                    // Window centre (X pos)
var windowCentreY = window.innerHeight / 2;
var isDrawing = false;
var dragControls;
var currentCommand = null, first = new THREE.Vector3(), next = new THREE.Vector3(), radius = null, center = new THREE.Vector3(), startAngle = null, endAngle = null, text = null, width = null, height = null, depth = null, selected, selected2;
var font_loader = new THREE.FontLoader();
var gEditor = null
var gui;

con();
var initPromise = new Promise(function (resolve, reject) {
    fontpromise.then(function () {
        init();
        resolve();
    });
});
window.addEventListener('loadModel', function (e) {
    initPromise.then(function () {
        loadModel(e.detail);
    });
});
function con() {
    scene1 = new THREE.Scene();
    container = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer();
    camera = new THREE.PerspectiveCamera(50, $(window).width() / $(window).height(), 1, 2000);
    camera.position.set(2, 4, 5);
}
// init scene

function set_params()
{
    if ( gui ) gui.destroy();
    gui = new dat.GUI();
    if(selected == null)
        return;
    switch(selected.geometry.type)
    {
        case "CircleGeometry":
            var params = {
                radius: parseFloat(radius)
            };
            gui.add( params, 'radius', 0.1, 20 ).step( 0.1 ).name( 'radius' ).onChange( function ( value ) {
                center.set(selected.position.x,selected.position.y,selected.position.z)
                radius = value;
                isDrawing = true
                draw_circle(false)
                for(x in objects)
                {
                    if(objects[x] == selected)
                    {
                        objects.splice(x, 1)
                        break;
                    }
                }
                scene1.remove(selected)
            } ).onFinishChange(function(value){  
                isDrawing = false
                draw_circle()
            });
        break;
        case "BoxGeometry":
            var params = {
                width: parseFloat(width),
                height: parseFloat(height),
                depth: parseFloat(depth)
            };
            gui.add( params, 'width', 0.1, 20 ).step( 0.1 ).name( 'width' ).onChange( function ( value ) {
                center.set(selected.position.x,selected.position.y,selected.position.z)
                width = value;
                isDrawing = true
                draw_cube(false)
                for(x in objects)
                {
                    if(objects[x] == selected)
                    {
                        objects.splice(x, 1)
                        break;
                    }
                }
                scene1.remove(selected)
            } ).onFinishChange(function(value){  
                isDrawing = false
                draw_cube()
            });
            gui.add( params, 'height', 0.1, 20 ).step( 0.1 ).name( 'height' ).onChange( function ( value ) {
                center.set(selected.position.x,selected.position.y,selected.position.z)
                height = value;
                isDrawing = true
                draw_cube(false)
                for(x in objects)
                {
                    if(objects[x] == selected)
                    {
                        objects.splice(x, 1)
                        break;
                    }
                }
                scene1.remove(selected)
            } ).onFinishChange(function(value){  
                isDrawing = false
                draw_cube()
            });
            gui.add( params, 'depth', 0.1, 20 ).step( 0.1 ).name( 'depth' ).onChange( function ( value ) {
                center.set(selected.position.x,selected.position.y,selected.position.z)
                depth = value;
                isDrawing = true
                draw_cube(false)
                for(x in objects)
                {
                    if(objects[x] == selected)
                    {
                        objects.splice(x, 1)
                        break;
                    }
                }
                scene1.remove(selected)
            } ).onFinishChange(function(value){  
                isDrawing = false
                draw_cube()
            });
        break;
        case "SphereGeometry":
            var params = {
                radius: parseFloat(radius)
            };
            gui.add( params, 'radius', 0.1, 20 ).step( 0.1 ).name( 'radius' ).onChange( function ( value ) {
                center.set(selected.position.x,selected.position.y,selected.position.z)
                radius = value;
                isDrawing = true
                draw_sphere(false)
                for(x in objects)
                {
                    if(objects[x] == selected)
                    {
                        objects.splice(x, 1)
                        break;
                    }
                }
                scene1.remove(selected)
            } ).onFinishChange(function(value){  
                isDrawing = false
                draw_sphere()
            });
        break;
        case "CylinderGeometry":
            var params = {
                radius: parseFloat(radius),
                height: parseFloat(height)
            };
            gui.add( params, 'radius', 0.1, 20 ).step( 0.1 ).name( 'radius' ).onChange( function ( value ) {
                center.set(selected.position.x,selected.position.y,selected.position.z)
                radius = value;
                isDrawing = true
                draw_cylinder(false)
                for(x in objects)
                {
                    if(objects[x] == selected)
                    {
                        objects.splice(x, 1)
                        break;
                    }
                }
                scene1.remove(selected)
            } ).onFinishChange(function(value){  
                isDrawing = false
                draw_cylinder()
            });
            gui.add( params, 'height', 0.1, 20 ).step( 0.1 ).name( 'height' ).onChange( function ( value ) {
                center.set(selected.position.x,selected.position.y,selected.position.z)
                height = value;
                isDrawing = true
                draw_cylinder(false)
                for(x in objects)
                {
                    if(objects[x] == selected)
                    {
                        objects.splice(x, 1)
                        break;
                    }
                }
                scene1.remove(selected)
            } ).onFinishChange(function(value){  
                isDrawing = false
                draw_cylinder()
            });
        break;
        case "TextGeometry":
        break;
    }
}

var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
};
var onError = function (xhr) {
};

/*document.getElementById('layoutPanel').addEventListener('SlideComplete', function () {
    render();
});*/

function init() {
    if (!$(container).is(':visible')) {
        setTimeout(init, 1500);
        return;
    }

    onWindowResize();

    container.scene = scene1;
    scene1.fog = new THREE.FogExp2(0x000000, 0.1);
    // Lights
    scene1.add(new THREE.AmbientLight(0xcccccc));
    var directionalLight = new THREE.DirectionalLight(0xeeeeee);
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random();
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    scene1.add(directionalLight);

    clock = new THREE.Clock();

    //Axis

    axes = buildAxes(6);
    scene1.add(axes);

    grids = new THREE.Object3D();
    gridX = new THREE.GridHelper(20, 50);
    gridY = new THREE.GridHelper(20, 50);
    gridZ = new THREE.GridHelper(20, 50);
    // gridY.rotateX(Math.PI / 2);
    // gridZ.rotateZ(Math.PI / 2);
    grids.add(gridX);
    // grids.add(gridY);
    // grids.add(gridZ);
    scene1.add(grids);

    // Renderer

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize($(window).width(), $(window).height());
    container.appendChild(renderer.domElement);
    // Stats
    stats = new Stats();
    container.appendChild(stats.dom);
    // Controls
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;


    dragControls = new THREE.DragControls(objects, camera, renderer.domElement);
    dragControls.addEventListener('dragstart', function (event) { controls.enabled = false; });
    dragControls.addEventListener('dragend', function (event) { controls.enabled = true; });

    // window.addEventListener('resize', onWindowResize, false);

    render();
    animate();
}


//
function onWindowResize(event) {
    renderer.setSize($(window).width(), $(window).height());
    camera.aspect = $(window).width() / $(window).height();
    camera.updateProjectionMatrix();
}
//
var t = 0;
function animate() {
    if (object != undefined) {
        object.rotation.y = mouseX * 0.005;
        object.rotation.x = mouseY * 0.005;
    }

    requestAnimationFrame(animate);
    render();
    controls.update();
}

//
function render() {
    for (var i in labels) {
        labels[i].lookAt(camera.position);
    }
    controls.update();
    if(isDrawing)
    {
        if(scene2 != null)
        {
            renderer.render(scene2, camera);
            delete scene2;
        }
    }
    else
    {
        renderer.render(scene1, camera);
    }
}


var geometry = new THREE.BoxGeometry( 40, 40, 40 );

function draw_line(_add = true) {
    // if (mesh != null) { scene1.remove(mesh) }
    // var object = new loader.parse(jsoncontent);
  
    var linematerial = new THREE.LineBasicMaterial({ color: 0xffffff });
    var linegeometry = new THREE.Geometry();
 
    linegeometry.vertices.push(first);
    linegeometry.vertices.push(next);

    var line = new THREE.Line(linegeometry, linematerial);

    if( _add )
    {
        scene1.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene1.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene1.add(directionalLight);
        objects.push(line);
        for(i in objects)
        {
            scene1.add(objects[i]);
        }
        scene1.add(axes);
        scene1.add(grids);
        scene1.add(line);
    }
    else
    {
        scene2 = new THREE.Scene;
        scene2.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene2.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene2.add(directionalLight);

        //Axis

        scene2.add(axes);

        scene2.add(grids);
        for(i in objects)
        {
            scene2.add(objects[i]);
        }
        scene2.add(line);
    }
    
}
function draw_circle(_add = true) {
    var geometry = new THREE.CircleGeometry( radius, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    var circle = new THREE.Mesh( geometry, material );
    circle.translateX(center.x)
    circle.translateY(center.y)
    circle.translateZ(center.z)
    circle.rotateX(3*Math.PI/2)
    if( _add )
    {
        scene1.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene1.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene1.add(directionalLight);

        objects.push(circle);
        for(i in objects)
        {
            scene1.add(objects[i]);
        }
        scene1.add(axes);
        scene1.add(grids);
        scene1.add(circle);
        selected = circle
    }
    else
    {
        scene2 = new THREE.Scene;
        scene2.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene2.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene2.add(directionalLight);

        //Axis

        scene2.add(axes);

        scene2.add(grids);
        for(i in objects)
        {
            scene2.add(objects[i]);
        }
        scene2.add(circle);
    }
}
function draw_arc(_add = true) {
    var geometry = new THREE.CircleGeometry( radius, 32 , startAngle*Math.PI/180, endAngle*Math.PI/180);
    var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    var circle = new THREE.Mesh( geometry, material );
    circle.translateX(center.x)
    circle.translateY(center.y)
    circle.translateZ(center.z)
    if( _add )
    {
        scene1.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene1.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene1.add(directionalLight);

        objects.push(circle);
        for(i in objects)
        {
            scene1.add(objects[i]);
        }
        scene1.add(axes);
        scene1.add(grids);
        scene1.add(circle);
    }
    else
    {
        scene2 = new THREE.Scene;
        scene2.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene2.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene2.add(directionalLight);

        //Axis

        scene2.add(axes);

        scene2.add(grids);
        for(i in objects)
        {
            scene2.add(objects[i]);
        }
        scene2.add(circle);
    }
}
function draw_point( _add = true ) {
    var dotGeometry = new THREE.Geometry();
    dotGeometry.vertices.push(center);
    var dotMaterial = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false } );
    var dot = new THREE.Points( dotGeometry, dotMaterial );

    if( _add )
    {
        scene1.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene1.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene1.add(directionalLight);
        objects.push(dot);
        for(i in objects)
        {
            scene1.add(objects[i]);
        }
        scene1.add(axes);
        scene1.add(grids);
        scene1.add(dot);
    }
    else
    {
        scene2 = new THREE.Scene;
        scene2.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene2.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene2.add(directionalLight);

        //Axis

        scene2.add(axes);

        scene2.add(grids);
        for(i in objects)
        {
            scene2.add(objects[i]);
        }
        scene2.add(dot);
    }
}
function draw_cube(_add = true) {
    var geometry = new THREE.BoxGeometry( width, height, depth );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    var cube = new THREE.Mesh( geometry, material );
    cube.translateX(center.x)
    cube.translateY(center.y)
    cube.translateZ(center.z)
    if( _add )
    {
        scene1.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene1.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene1.add(directionalLight);

        objects.push(cube);
        for(i in objects)
        {
            scene1.add(objects[i]);
        }
        scene1.add(axes);
        scene1.add(grids);
        scene1.add(cube);
        selected = cube
    }
    else
    {
        scene2 = new THREE.Scene;
        scene2.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene2.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene2.add(directionalLight);

        //Axis

        scene2.add(axes);

        scene2.add(grids);
        for(i in objects)
        {
            scene2.add(objects[i]);
        }
        scene2.add(cube);
    }
}
function draw_sphere(_add = true) {
    var geometry = new THREE.SphereGeometry( radius, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.translateX(center.x)
    sphere.translateY(center.y)
    sphere.translateZ(center.z)
    if( _add )
    {
        scene1.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene1.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene1.add(directionalLight);

        objects.push(sphere);
        for(i in objects)
        {
            scene1.add(objects[i]);
        }
        scene1.add(axes);
        scene1.add(grids);
        scene1.add(sphere);
        selected = sphere
    }
    else
    {
        scene2 = new THREE.Scene;
        scene2.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene2.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene2.add(directionalLight);

        //Axis

        scene2.add(axes);

        scene2.add(grids);
        for(i in objects)
        {
            scene2.add(objects[i]);
        }
        scene2.add(sphere);
    }
}
function draw_cylinder(_add = true) {
    var geometry = new THREE.CylinderGeometry( radius, radius, height, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.translateX(center.x)
    cylinder.translateY(center.y)
    cylinder.translateZ(center.z)
    if( _add )
    {
        scene1.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene1.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene1.add(directionalLight);

        objects.push(cylinder);
        for(i in objects)
        {
            scene1.add(objects[i]);
        }
        scene1.add(axes);
        scene1.add(grids);
        scene1.add(cylinder);
        selected = cylinder
    }
    else
    {
        scene2 = new THREE.Scene;
        scene2.fog = new THREE.FogExp2(0x000000, 0.12);
        // Lights
        scene2.add(new THREE.AmbientLight(0xcccccc));
        var directionalLight = new THREE.DirectionalLight(0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random();
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene2.add(directionalLight);

        //Axis

        scene2.add(axes);

        scene2.add(grids);
        for(i in objects)
        {
            scene2.add(objects[i]);
        }
        scene2.add(cylinder);
    }
}
function draw_text(_add = true) {
    font_loader.load( './Scripts/fonts/helvetiker_regular.typeface.json', function ( font ) {
        var textGeo = new THREE.TextGeometry( text, {
            font: font,
            size: 1,
            height: 0.1,
            curveSegments: 32,
            bevelEnabled: false,
            bevelThickness: 0.1,
            bevelSize: 0.8,
            bevelSegments: 0.5
        } );
        
        var material = [
            new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
            new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
        ];
        var textMesh = new THREE.Mesh( textGeo, material );
        textMesh.translateX(first.x)
        textMesh.translateY(first.y)
        textMesh.translateZ(first.z)
        objects.push(textMesh);
        scene1.add( textMesh );
    } );
}
function ops_scale(_add = true) {
    selected.scale.set(radius,radius,radius);
    selected = null
}
function ops_rotate(_add = true) {
    selected.rotateX(endAngle[0]);
    selected.rotateY(endAngle[1]);
    selected.rotateZ(endAngle[2]);
    selected = null
}
function ops_translate(_add = true) {
    selected.translateX(next[0]);
    selected.translateY(next[1]);
    selected.translateZ(next[2]);
    selected = null
}
function ops_center(_add = true) {
    selected.position.set(center[0], center[1], center[2])
    selected = null
}
function ops_mirror(_add = true) {
    var mS = (new THREE.Matrix4()).identity();
    //set -1 to the corresponding axis
    var geometry = selected.geometry.clone()
    switch(radius)
    {
        case 'X': case'x':
            mS.elements[10] = -1;
        break;
        case 'Y': case'y':
            mS.elements[5] = -1;
        break;
        case 'Z': case'z':
            mS.elements[0] = -1;
        break;
        default:
        mS.elements[0] = -1;
        mS.elements[5] = -1;
        mS.elements[10] = -1;
    }

    geometry.applyMatrix(mS);
    geometry.verticesNeedUpdate = true;
    geometry.normalsNeedUpdate = true;
    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    var material = new THREE.MeshBasicMaterial( {color: 0xeeeeee} );
    var mirrored = new THREE.Mesh( geometry, material );
    objects.push(mirrored)
    scene1.add(mirrored)
}
function ops_union(_add = true) {
    const sBSP = new ThreeBSP(selected);
    const bBSP = new ThreeBSP(selected2);
    
    const uni = bBSP.union(sBSP);
    const newMesh = uni.toMesh();
    newMesh.material = selected.material
    for(x in objects)
    {
        if(objects[x] == selected)
        {
            objects.splice(x, 1)
            break;
        }
    }
    for(x in objects)
    {
        if(objects[x] == selected2)
        {
            objects.splice(x, 1)
            break;
        }
    }
    scene1.remove(selected)
    scene1.remove(selected2)
    objects.push(newMesh)
    scene1.add(newMesh);
}
function ops_intersect(_add = true) {
    const sBSP = new ThreeBSP(selected);
    const bBSP = new ThreeBSP(selected2);
    
    const intersct = bBSP.intersect(sBSP);
    const newMesh = intersct.toMesh();
    newMesh.material = selected.material
    for(x in objects)
    {
        if(objects[x] == selected)
        {
            objects.splice(x, 1)
            break;
        }
    }
    for(x in objects)
    {
        if(objects[x] == selected2)
        {
            objects.splice(x, 1)
            break;
        }
    }
    scene1.remove(selected)
    scene1.remove(selected2)
    objects.push(newMesh)
    scene1.add(newMesh);
}
function ops_difference(_add = true) {
    const sBSP = new ThreeBSP(selected);
    const bBSP = new ThreeBSP(selected2);
    
    const sub = sBSP.subtract(bBSP);
    const newMesh = sub.toMesh();
    newMesh.material = selected.material
    for(x in objects)
    {
        if(objects[x] == selected)
        {
            objects.splice(x, 1)
            break;
        }
    }
    for(x in objects)
    {
        if(objects[x] == selected2)
        {
            objects.splice(x, 1)
            break;
        }
    }
    scene1.remove(selected)
    scene1.remove(selected2)
    objects.push(newMesh)
    scene1.add(newMesh);
}
function ops_linear_extrude()
{
    var extrudeSettings = {
        steps: 32,
        amount: height,
        bevelEnabled: false,
        bevelThickness: 1,
        bevelSize: 1,
        bevelSegments: 1
    };
    var shape = new THREE.Shape(selected.geometry.vertices);
    var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var mesh = new THREE.Mesh( geometry, material ) ;
    objects.push(mesh)
    scene1.add( mesh );
}
function ops_rotate_extrude()
{
    var geometry = new THREE.LatheGeometry( selected.geometry.vertices );
    var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    var lathe = new THREE.Mesh( geometry, material );
    objects.push(lathe)
    scene1.add( lathe );
}

$( document ).ready(function() {
    $('#2d-cad').click(function() {
        scene1.remove(axes)
        axes = buildPlaneAxes(6);
        scene1.add(axes);
        
        // delete camera
        camera = new THREE.PerspectiveCamera(50, $(window).width() / $(window).height(), 1, 2000);
        // camera.setViewOffset( $(window).width(), $(window).height(), 0,  0, $(window).width(), $(window).height() );
        camera.position.set(0, 6, 0);
        
        controls.dispose()
        delete controls
        controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        
        dragControls.dispose()
        delete dragControls
        dragControls = new THREE.DragControls(objects, camera, renderer.domElement);
        dragControls.addEventListener('dragstart', function (event) { controls.enabled = false; });
        dragControls.addEventListener('dragend', function (event) { controls.enabled = true; });

        $('button').removeClass('active')
        $(this).addClass('active')
    })
    $('#3d-cad').click(function() {
        scene1.remove(axes)
        axes = buildAxes(6);
        scene1.add(axes);
        
        camera = new THREE.PerspectiveCamera(50, $(window).width() / $(window).height(), 1, 2000);
        camera.position.set(2, 4, 5);
        
        controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        delete dragControls
        dragControls = new THREE.DragControls(objects, camera, renderer.domElement);
        dragControls.addEventListener('dragstart', function (event) { controls.enabled = false; });
        dragControls.addEventListener('dragend', function (event) { controls.enabled = true; });

        $('button').removeClass('active')
        $(this).addClass('active')
    })
    $('#simulation').click(function() {
        $('button').removeClass('active')
        $(this).addClass('active')
        document.location.href = "simulation.html"
    })
})
function loadModel(jsoncontent) {
    var loader = new THREE.AssimpJSONLoader();
    // if (object != null) { scene1.remove(object) }
    if (mesh != null) { scene1.remove(mesh) }
    var json = JSON.parse( jsoncontent );

    var object = new loader.parse(json);
    var meshes = object.children
    for(i in meshes)
    {
        objects.push(meshes[i].rotateX(Math.PI));
        scene1.add(meshes[i]);
        render()
    }
    // object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
    // object.scale.multiplyScalar(SCALE);

    //     object.position.x = 0;
    //     object.position.y = 0;
    //     object.position.z = 0;
  
    // object.castShadow = true;
    // object.receiveShadow = true;

    
    

    //var animate = function () {
    //    requestAnimationFrame(animate);

    //    object.rotation.x += 0.1;
    //    object.rotation.y += 0.1;

    //    renderer.render(scene1, camera);
    //};
    animate();
}

function loadSTL(stlpath) {
    var loader = new THREE.STLLoader();
    loader.load(stlpath, function (geometry) {
        console.log('loaded')
        if (mesh != null) { scene1.remove(mesh) }
        if (object != null) { scene1.remove(object) }
        var material = new THREE.MeshNormalMaterial();
        mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(0.1, 0.1, 0.1);
        objects.push(mesh)
        scene1.add(mesh);
        // render();
        animate();
    });
}
function parseSTL(data) {
    var loader = new THREE.STLLoader();
    geometry = loader.parse(data);
    if(geometry)
    {
        console.log('loaded')
        if (mesh != null) { scene1.remove(mesh) }
        if (object != null) { scene1.remove(object) }
        var material = new THREE.MeshNormalMaterial();
        mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(0.1, 0.1, 0.1);
        objects.push(mesh)
        scene1.add(mesh);
        // render();
        animate();
    }
}
function loadDAE(filepath) {
    var loader = new THREE.ColladaLoader();
    loader.load(filepath, function loadCollada(collada) {
        var model = collada.scene;
        model.scale = 0.1;
        model.updateMatrix();
        objects.push(model)
        scene1.add(model);
        // render();
        animate();
    });


    //// instantiate a loader
    //var loader = new THREE.ColladaLoader();

    //loader.load(
    //    // resource URL
    //    './DAEFile/File.dae',
    //    // Function when resource is loaded
    //    function (collada) {
    //        scene.add(collada.scene);
    //    },
    //    // Function called when download progresses
    //    function (xhr) {
    //        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    //    }
    //);
}
function parseDAE(data) {
    var loader = new THREE.ColladaLoader();
    var collada = loader.parse(data);
    if(collada) {
        var model = collada.scene;
        var meshes = model.children
        for(i in meshes)
        {
            if(meshes[i].type=="Mesh")
            {
                meshes[i].scale = 0.1;
                meshes[i].updateMatrix();
                objects.push(meshes[i])
                scene1.add(meshes[i]);
            }
            else{
                var children = meshes[i].children
                for(j in children)
                {   
                    if(children[j].type=="Mesh")
                    {
                        children[j].scale = 0.1;
                        children[j].updateMatrix();
                        objects.push(children[j])
                        scene1.add(children[j]);
                    }
                }
            }
        }
        // render();
        animate();
    }


    //// instantiate a loader
    //var loader = new THREE.ColladaLoader();

    //loader.load(
    //    // resource URL
    //    './DAEFile/File.dae',
    //    // Function when resource is loaded
    //    function (collada) {
    //        scene.add(collada.scene);
    //    },
    //    // Function called when download progresses
    //    function (xhr) {
    //        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    //    }
    //);
}

// var uploader = new ss.SimpleUpload(
//     {
//         button: $('#uploadModel'), // file upload button
//         url: '/upload', // server side handler
//         name: 'files', // upload parameter name        
//         responseType: 'json',
//         allowedExtensions: ["json", "stl", "DAE"],
//         method: 'POST',
//         dropzone: $('body'),
//         onComplete: function (filename, response, btn) {
//             if (!response) {
//                 alert(filename + 'upload failed');
//                 return false;
//             }
//             filepath = response.filepath
//             if (filename.toUpperCase().indexOf("STL") >= 0) {
//                 loadSTL(filepath);
//                 btn.innerText = filename;
//             }
//             else if (filename.toUpperCase().indexOf("JSON") >= 0) {
//                 loadModel(JSON.parse(response.filepath));
//                 btn.innerText = filename;
//             }
//             else if (filename.toUpperCase().indexOf("DAE") >= 0) {
//                 loadDAE(filepath);
//                 btn.innerText = filename;
//             }
//             // do something with response...
//         }
//     }
// );
function buildPlaneAxes(length) {
    size = length || 1;

    
    var geometry = new THREE.Object3D();
    geometry.add(buildAxis('x', size, 0xff0000));
    geometry.add(buildAxis('y', size, 0x00ff00));
    
        //geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));


    return geometry;
    
    //return new THREE.AxisHelper(length);

}
$('#newline').click(function(){
    drawline();
});
$('#newcircle').click(function(){
    drawcircle();
});
function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.
    var file = files[0]
    var filename = file.name
    
    // files is a FileList of File objects. List some properties.
    var output = [];

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            if (filename.toUpperCase().indexOf("STL") >= 0) {
                parseSTL(evt.target.result);
                // btn.innerText = filename;
            }
            else if (filename.toUpperCase().indexOf("JSON") >= 0) {
                loadModel(evt.target.result);
                // btn.innerText = filename;
            }
            else if (filename.toUpperCase().indexOf("DAE") >= 0) {
                parseDAE(evt.target.result);
                // btn.innerText = filename;
            }
        }
        };
    
        var blob = file.slice();
        reader.readAsBinaryString(blob);
          
  }

  function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }
var dropZone = document.getElementById('canvas');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileSelect, false);