const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({ canvas });
const fov = 50;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 500;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const loader = new THREE.TextureLoader();
const TABLE_THICKNESS = 0.2;
const TABLE_LEG_THICKNESS = 0.04;
const TABLE_TOP_RADIUS = 4;
const TABLE_BOTTOM_RADIUS = 3.8;
const TABLE_LEG_HEIGHT = 3;
const TABLE_LEG_BEVEL_SIZE = 0.1;
const KITCHEN_HEIGHT = 20;
const KITCHEN_WIDTH = 30;
const KITCHEN_DEPTH = 30;

camera.position.set(5, 5, 25);
renderer.setSize(window.innerWidth, window.innerHeight, false);

const scene = new THREE.Scene();
const kitchen = new THREE.Object3D();
scene.add(kitchen);

const controls = new THREE.OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();

{
    const color = 0xffffff;
    const intensity = 1.2;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
}

{
    const color = 0xd3ddff;
    const intensity = 0.3;
    const light = new THREE.PointLight(color, intensity);
    light.position.set(0, 9, 0);
    scene.add(light);
}

function getCabinet(boxWidth, boxHeight, boxDepth, bevelSize) {
    const shape = new THREE.Shape();

    shape.moveTo(-boxWidth / 2, 0);
    shape.lineTo(-boxWidth / 2, boxHeight);
    shape.lineTo(boxWidth / 2, boxHeight);
    shape.lineTo(boxWidth / 2, 0);

    let extrudeSettings = {
        steps: 2,
        depth: boxDepth,
        bevelEnabled: true,
        bevelThickness: 0.2,
        bevelSize,
        bevelSegments: 1
    };

    const materialOptions = { color: 0xffffff };
    const boxGeometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);

    const boxMaterial = new THREE.MeshStandardMaterial(materialOptions);

    const cube = new THREE.Mesh(boxGeometry, boxMaterial);

    return cube;
}

function getCabinetHandle() {
    class CustomSinCurve extends THREE.Curve {
        constructor(scale) {
            super();
            this.scale = scale;
        }
        getPoint(t) {
            const tx = t * 4;
            const ty = 0;
            const tz = Math.sin(t * Math.PI);
            return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
        }
    }

    const path = new CustomSinCurve(1);
    const tubularSegments = 20;
    const radius = 0.3;
    const radialSegments = 100;
    const closed = false;
    const geometry = new THREE.TubeBufferGeometry(
        path,
        tubularSegments,
        radius,
        radialSegments,
        closed
    );
    const material = new THREE.MeshPhysicalMaterial({
        side: THREE.DoubleSide,
        clearcoat: 0.3,
        clearcoatRoughness: 0.3,
        roughness: 1,
        metalness: 1,
        emissive: 0x555555,
        color: 0x0
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.scale.set(0.3, 0.3, 0.3);

    return mesh;
}

function getMicrowave(boxWidth, boxHeight, boxDepth) {
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const materials = [
        new THREE.MeshStandardMaterial({
            color: 0x0
        }),
        new THREE.MeshStandardMaterial({
            color: 0x0
        }),
        new THREE.MeshStandardMaterial({
            color: 0x0
        }),
        new THREE.MeshStandardMaterial({
            color: 0x0
        }),
        new THREE.MeshStandardMaterial({
            map: loader.load("https://i.imgur.com/A3k1h1T.png")
        }),
        new THREE.MeshStandardMaterial({
            color: 0x0
        })
    ];

    const cube = new THREE.Mesh(geometry, materials);

    return cube;
}

function getCooker(boxWidth, boxHeight, boxDepth) {
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const materials = [
        new THREE.MeshStandardMaterial({
            color: 0x0
        }),
        new THREE.MeshStandardMaterial({
            color: 0x0
        }),
        new THREE.MeshStandardMaterial({
            map: loader.load("https://i.imgur.com/6KI8QAl.jpg")
        }),
        new THREE.MeshStandardMaterial({
            color: 0x0
        }),
        new THREE.MeshStandardMaterial({
            color: 0x0
        }),
        new THREE.MeshStandardMaterial({
            color: 0x0
        })
    ];

    const cube = new THREE.Mesh(geometry, materials);

    return cube;
}

{
    const boxWidth = KITCHEN_WIDTH;
    const boxHeight = KITCHEN_HEIGHT;
    const boxDepth = KITCHEN_DEPTH;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const materials = [
        new THREE.MeshStandardMaterial({
            map: loader.load("https://i.imgur.com/BYkSbFC.png"),
            side: THREE.BackSide
        }),
        new THREE.MeshStandardMaterial({
            map: loader.load("https://i.imgur.com/BYkSbFC.png"),
            side: THREE.BackSide
        }),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.BackSide
        }),
        new THREE.MeshStandardMaterial({
            map: loader.load("https://i.imgur.com/aJue6AS.jpg"),
            side: THREE.BackSide
        }),
        new THREE.MeshStandardMaterial({
            map: loader.load("https://i.imgur.com/BYkSbFC.png"),
            side: THREE.BackSide
        }),
        new THREE.MeshStandardMaterial({
            map: loader.load("https://i.imgur.com/BYkSbFC.png"),
            side: THREE.BackSide
        })
    ];

    materials.forEach(({ map }, i) => {
        if (i === 2) {
            return;
        }

        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;

        if (i !== 3) {
            map.repeat.set(2.5, 5);
        }
    });

    const cube = new THREE.Mesh(geometry, materials);
    kitchen.add(cube);
}

const table = new THREE.Object3D();

{
    const tableTopGeo = new THREE.CylinderBufferGeometry(
        TABLE_TOP_RADIUS,
        TABLE_BOTTOM_RADIUS,
        TABLE_THICKNESS,
        100
    );
    const tableTopMaterialOptions = {
        normalMap: loader.load("https://i.imgur.com/O40BDgy.jpg"),
        map: loader.load("https://i.imgur.com/N5MXdLa.jpg"),
        roughnessMap: loader.load("https://i.imgur.com/NI5CFkk.jpg"),
        aoMap: loader.load("https://i.imgur.com/c1iRiPn.jpg"),
        alphaMap: loader.load("https://i.imgur.com/7HHAKNR.png")
    };
    const tableTopMaterial = new THREE.MeshStandardMaterial(
        tableTopMaterialOptions
    );

    tableTopMaterial.wrapS = THREE.RepeatWrapping;
    tableTopMaterial.wrapT = THREE.RepeatWrapping;

    const tableTop = new THREE.Mesh(tableTopGeo, tableTopMaterial);
    tableTop.position.set(0, 0, 0);
    table.add(tableTop);
}

function getTableLeg(thickness, bevelSize) {
    const height = 0.2,
        width = 0.2;

    let shape = new THREE.Shape();
    shape.moveTo(-width / 2, -height / 2);
    shape.lineTo(-width / 2, height / 2);
    shape.lineTo(width, height / 2);
    shape.lineTo(width, -height / 2);
    shape.moveTo(-width / 2, -height / 2);

    const extrudeSettings = {
        steps: 2,
        depth: 0,
        bevelEnabled: true,
        bevelThickness: thickness,
        bevelSize,
        bevelOffset: 0,
        bevelSegments: 100
    };

    const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
    const tableLegMaterial = new THREE.MeshStandardMaterial({
        normalMap: loader.load("https://i.imgur.com/O40BDgy.jpg"),
        map: loader.load("https://i.imgur.com/N5MXdLa.jpg"),
        roughnessMap: loader.load("https://i.imgur.com/NI5CFkk.jpg")
    });

    const tableLeg = new THREE.Mesh(geometry, tableLegMaterial);
    tableLeg.rotation.x = Math.PI * 0.5;

    return tableLeg;
}

const tableLeg1 = getTableLeg(TABLE_LEG_HEIGHT, TABLE_LEG_BEVEL_SIZE);
const tableLeg2 = getTableLeg(TABLE_LEG_HEIGHT, TABLE_LEG_BEVEL_SIZE);
const tableLeg3 = getTableLeg(TABLE_LEG_HEIGHT, TABLE_LEG_BEVEL_SIZE);
const tableLeg4 = getTableLeg(TABLE_LEG_HEIGHT, TABLE_LEG_BEVEL_SIZE);
const tableLegOffset = 2;
tableLeg1.position.set(
    -tableLegOffset,
    -TABLE_LEG_HEIGHT - TABLE_THICKNESS / 2,
    tableLegOffset
);
tableLeg2.position.set(
    tableLegOffset,
    -TABLE_LEG_HEIGHT - TABLE_THICKNESS / 2,
    tableLegOffset
);
tableLeg3.position.set(
    -tableLegOffset,
    -TABLE_LEG_HEIGHT - TABLE_THICKNESS / 2,
    -tableLegOffset
);
tableLeg4.position.set(
    tableLegOffset,
    -TABLE_LEG_HEIGHT - TABLE_THICKNESS / 2,
    -tableLegOffset
);

table.add(tableLeg1, tableLeg2, tableLeg3, tableLeg4);

table.position.set(
    KITCHEN_WIDTH / 2 - TABLE_TOP_RADIUS,
    -KITCHEN_HEIGHT / 2 + (TABLE_LEG_HEIGHT + TABLE_LEG_THICKNESS) * 2,
    -5
);

const vase = new THREE.Object3D();

{
    const points = [];

    for (let i = 0; i < 10; i++) {
        points.push(new THREE.Vector2(Math.sin(i * 0.1) + 0.8, i));
    }

    const geometry = new THREE.LatheBufferGeometry(points, 100);
    const material = new THREE.MeshStandardMaterial({
        color: 0x85ddff,
        opacity: 0.5,
        transparent: true,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.3, 0.3, 0.3);
    mesh.position.set(
        KITCHEN_WIDTH / 2 - TABLE_TOP_RADIUS,
        table.position.y,
        -5
    );

    vase.add(mesh);
}

{
    const points = [];

    for (let i = 0; i < 10; i++) {
        points.push(new THREE.Vector2(Math.sin(i * 0.2) + 2, i * 0.4));
    }

    const geometry = new THREE.LatheBufferGeometry(points, 100);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.6, 0.6, 0.6);
    mesh.position.set(0, 10.1, 0);
    mesh.rotation.x = Math.PI;

    scene.add(mesh);
}

{
    const geometry = new THREE.CircleBufferGeometry(0.8, 100);
    const material = new THREE.MeshStandardMaterial({
        color: 0x85ddff,
        opacity: 0.5,
        transparent: true,
        segments: 100,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.3, 0.3, 0.3);
    mesh.position.set(
        KITCHEN_WIDTH / 2 - TABLE_TOP_RADIUS,
        table.position.y + 0.1,
        -5
    );
    mesh.rotation.x = Math.PI / 2;
    vase.add(mesh);
}

function getExtractorFan(widthTop, widthBottom) {
    const geometry = new THREE.CylinderBufferGeometry(
        widthTop,
        widthBottom,
        2,
        4,
        1,
        true
    );

    const material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        color: 0xcccccc
    });

    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

const boxWidth = 8;
const boxHeight = 5;
const boxDepth = 3;
const bevelSize = 0.5;

const cabinet1 = new THREE.Object3D();
const cabinet2 = new THREE.Object3D();
const cabinet3 = new THREE.Object3D();

const cabinetInstance1 = getCabinet(boxWidth, boxHeight, boxDepth, bevelSize);
const cabinetInstance2 = getCabinet(boxWidth, boxHeight, boxDepth, bevelSize);
const cabinetInstance3 = getCabinet(
    30 - bevelSize * 2,
    boxHeight * 1.2,
    boxDepth,
    bevelSize
);

cabinetInstance1.position.set(
    -KITCHEN_WIDTH / 2 + boxWidth / 2 + bevelSize,
    KITCHEN_HEIGHT / 2 - 8,
    -KITCHEN_DEPTH / 2
);

cabinetInstance2.position.set(
    cabinetInstance1.position.x + boxWidth + bevelSize * 2,
    cabinetInstance1.position.y,
    cabinetInstance1.position.z
);

cabinetInstance3.position.set(
    -KITCHEN_WIDTH / 2 + 15,
    -KITCHEN_HEIGHT / 2 + bevelSize,
    cabinetInstance1.position.z
);

cabinet1.add(cabinetInstance1);
cabinet2.add(cabinetInstance2);
cabinet3.add(cabinetInstance3);

const cabinet1Handle = getCabinetHandle();
cabinet1Handle.position.set(
    cabinetInstance1.position.x - 0.4,
    cabinetInstance1.position.y + 0.8,
    cabinetInstance1.position.z + boxDepth + 0.2
);
cabinet1.add(cabinet1Handle);

const cabinet2Handle = getCabinetHandle();
cabinet2Handle.position.set(
    cabinetInstance2.position.x - 0.4,
    cabinetInstance2.position.y + 0.8,
    cabinetInstance2.position.z + boxDepth + 0.2
);
cabinet2.add(cabinet2Handle);

const cooker = getCooker(boxDepth, 0.34, 3.4);

cooker.position.set(
    KITCHEN_WIDTH / 2 - boxDepth / 2 - 2,
    -KITCHEN_HEIGHT / 2 + boxHeight * 1.2 + bevelSize * 2 + 0.17,
    -KITCHEN_DEPTH / 2 + boxDepth / 2
);
scene.add(cooker);

const microwave = getMicrowave(6, 3.5, 2.5);
microwave.position.set(
    -KITCHEN_WIDTH / 2 + 3,
    -KITCHEN_HEIGHT / 2 + bevelSize * 2 + boxHeight * 1.2 + 1.75,
    cabinetInstance3.position.z + 1.5
);

const extractorFan = getExtractorFan(1.4, 3);
extractorFan.rotation.y = Math.PI / 4;
extractorFan.position.set(
    KITCHEN_WIDTH / 2 - boxDepth / 2 - 2,
    5,
    -KITCHEN_DEPTH / 2 + 2.1
);

{
    const boxWidth = 1.5;
    const boxHeight = 4;
    const boxDepth = 3;
    const geometry = new THREE.BoxGeometry(2, 4, 2);
    const material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        color: 0xcccccc
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
        KITCHEN_WIDTH / 2 - boxDepth / 2 - 2,
        8,
        -KITCHEN_DEPTH / 2 + 2.1
    );
    scene.add(mesh);
}

scene.add(extractorFan);
scene.add(microwave);
scene.add(table);
scene.add(vase);
scene.add(cabinet1);
scene.add(cabinet2);
scene.add(cabinet3);

function render() {
    requestAnimationFrame(render);

    renderer.render(scene, camera);
}

render();
