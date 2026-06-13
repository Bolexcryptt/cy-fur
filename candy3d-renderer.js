// Simple Three.js-based 3D renderer for the candy board
class Candy3DRenderer {
    constructor() {
        this.candyMeshes = {};
        this.particles = [];
        this.enabled = false;

        const container = document.getElementById('canvas-container');
        this.container = container;

        // Scene, camera, renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 18);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.display = 'block';
        container.appendChild(this.renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 0.6);
        dir.position.set(5, 10, 7);
        this.scene.add(dir);

        this.gridSpacing = 1.6;
        this.lerp = 0.18;

        this._onResize = this._onResize.bind(this);
        window.addEventListener('resize', this._onResize);

        this._lastTime = performance.now();
        this._tick = this._tick.bind(this);
        requestAnimationFrame(this._tick);
    }

    _onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    indexToGridPosition(index) {
        const col = index % BOARD_COLS;
        const row = Math.floor(index / BOARD_COLS);
        const centerCol = (BOARD_COLS - 1) / 2;
        const centerRow = (BOARD_ROWS - 1) / 2;
        const x = (col - centerCol) * this.gridSpacing;
        const y = (centerRow - row) * this.gridSpacing;
        const z = 0;
        return { x, y, z };
    }

    addCandyToBoard(index, color) {
        if (this.candyMeshes[index]) return;

        const geometry = new THREE.BoxGeometry(1.2, 1.2, 0.8);
        const material = new THREE.MeshStandardMaterial({ color: COLOR_MAP[color] || 0xffffff, flatShading: true });
        const mesh = new THREE.Mesh(geometry, material);
        const pos = this.indexToGridPosition(index);
        mesh.position.set(pos.x, pos.y, pos.z);
        mesh.scale.set(0.9, 0.9, 0.9);
        mesh.userData = { target: mesh.position.clone(), index, color };
        this.scene.add(mesh);
        this.candyMeshes[index] = mesh;
    }

    removeCandyMesh(index) {
        const mesh = this.candyMeshes[index];
        if (!mesh) return;
        this.scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
        delete this.candyMeshes[index];
    }

    updateCandyPosition(index, pos) {
        const mesh = this.candyMeshes[index];
        if (!mesh) return;
        mesh.userData.target.set(pos.x, pos.y, pos.z);
    }

    selectCandy(index) {
        Object.keys(this.candyMeshes).forEach(k => {
            const m = this.candyMeshes[k];
            m.scale.set(0.9, 0.9, 0.9);
        });
        const mesh = this.candyMeshes[index];
        if (!mesh) return;
        mesh.scale.set(1.15, 1.15, 1.15);
    }

    createShatterEffect(index) {
        // Shatter effect disabled: renderer will simply remove the candy mesh.
        return;
    }

    show() {
        this.enabled = true;
        this.container.style.display = 'block';
        this.renderer.domElement.style.pointerEvents = 'none';
    }

    hide() {
        this.enabled = false;
        this.container.style.display = 'none';
    }

    _tick(now) {
        const dt = (now - this._lastTime) / 1000;
        this._lastTime = now;

        // animate candy meshes toward targets
        Object.values(this.candyMeshes).forEach(mesh => {
            mesh.position.lerp(mesh.userData.target, this.lerp);
            // gentle rotation for juice
            mesh.rotation.x += 0.001;
            mesh.rotation.y += 0.003;
        });

        // animate particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p && p.isLight) {
                p.life -= dt;
                p.light.intensity = Math.max(0, p.life / 0.18) * 1.2;
                if (p.life <= 0) {
                    this.scene.remove(p.light);
                    this.particles.splice(i, 1);
                }
                continue;
            }

            if (p && p.userData && p.userData.isFlash) {
                p.userData.life -= dt;
                p.material.opacity = Math.max(0, p.userData.life / 0.18) * 0.85;
                if (p.userData.life <= 0) {
                    this.scene.remove(p);
                    if (p.geometry) p.geometry.dispose();
                    if (p.material) p.material.dispose();
                    this.particles.splice(i, 1);
                }
                continue;
            }

            p.userData.life -= dt;
            // gravity
            p.userData.vel.y -= 9.8 * dt;
            p.position.addScaledVector(p.userData.vel, dt);
            p.userData.vel.multiplyScalar(0.985);
            // angular motion
            if (p.userData.angVel) {
                p.rotation.x += p.userData.angVel.x * dt;
                p.rotation.y += p.userData.angVel.y * dt;
                p.rotation.z += p.userData.angVel.z * dt;
            }
            p.material.opacity = Math.max(0, p.userData.life / 1.0);
            if (p.userData.life <= 0) {
                this.scene.remove(p);
                if (p.geometry) p.geometry.dispose();
                if (p.material) p.material.dispose();
                this.particles.splice(i, 1);
            }
        }

        if (this.enabled) {
            this.renderer.render(this.scene, this.camera);
        }

        requestAnimationFrame(this._tick);
    }
}

// Export to global scope for older code expecting it
window.Candy3DRenderer = Candy3DRenderer;
