document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 4);
    
    // Renderer setup (alpha: true for transparent background)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x4A9EFF, 2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const orangeLight = new THREE.PointLight(0xFF5C2B, 1, 50);
    orangeLight.position.set(-5, 2, -2);
    scene.add(orangeLight);
    
    // GLTF Loader for animated character
    const loader = new THREE.GLTFLoader();
    let mixer;
    
    const modelUrl = 'assets/models/model.glb';
    
    let loadedModel;
    let targetBone = null;
    
    let mouseX = 0;
    let mouseY = 0;

    // Track mouse for bone rotation
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    loader.load(modelUrl, function(gltf) {
        const model = gltf.scene;
        loadedModel = model;
        
        // Position and scale to fit waist-up
        model.position.set(0, -3.2, 0);
        model.scale.set(3.2, 3.2, 3.2); 
        scene.add(model);

        // Find spine/neck/head bone to rotate
        model.traverse((child) => {
            if (child.isBone) {
                const name = child.name.toLowerCase();
                if (name.includes('neck') || name.includes('spine2') || name.includes('head')) {
                    if (!targetBone) targetBone = child;
                }
            }
        });
        
        // Setup idle animation
        const animations = gltf.animations;
        if (animations && animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            let idleAnim = animations.find(clip => clip.name.toLowerCase().includes('idle'));
            if (!idleAnim) idleAnim = animations[0];
            
            if (idleAnim) {
                const action = mixer.clipAction(idleAnim);
                action.play();
            }
        }
    }, undefined, function(error) {
        console.error('An error happened loading the GLTF model:', error);
    });
    
    // Animation Loop
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        if (mixer) {
            mixer.update(delta);
        } else if (loadedModel) {
            // Apply a subtle floating if there are no skeleton animations
            loadedModel.position.y = -3.2 + Math.sin(clock.elapsedTime * 1.5) * 0.05;
        }

        // Apply mouse tracking to bone
        if (targetBone) {
            // Lerp bone rotation towards cursor. 
            // We rotate after mixer updates so animation doesn't overwrite it immediately.
            const targetRotationX = mouseY * 0.4; 
            const targetRotationY = mouseX * 0.4;
            
            targetBone.rotation.x = THREE.MathUtils.lerp(targetBone.rotation.x, targetRotationX, 0.1);
            targetBone.rotation.y = THREE.MathUtils.lerp(targetBone.rotation.y, targetRotationY, 0.1);
        }
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle Window Resize
    window.addEventListener('resize', () => {
        if (container) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    });
});
