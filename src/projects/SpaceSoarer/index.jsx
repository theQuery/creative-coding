import './index.css';
import { useRef, useEffect } from 'react';
import getRandInt from '../../utils/getRandInt';
import ambianceSound from './assets/ambiance.mp3';

let audioCtx;

class Star {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.originX = canvas.width / 2;
        this.originY = canvas.height / 2;
        this.maxDistance = Math.hypot(0 - this.canvas.width, 0 - this.canvas.height);
        this.x = getRandInt(0, canvas.width);
        this.y = getRandInt(0, canvas.height);
        this.velocity = 50;
        this.momentum = 0;
        this.radius = getRandInt(1, 2);
        this.hue = getRandInt(1, 360);
        this.opacity = this.getOpacity();
    }

    getOpacity() {
        const distanceX = this.x - this.originX;
        const distanceY = this.y - this.originY;
        const distance = Math.hypot(distanceX, distanceY);
        const opacity = 1 - Math.cos(180 / this.maxDistance * distance * Math.PI / 180);

        return opacity;
    }

    render() {
        this.ctx.save();
        this.ctx.fillStyle = `hsl(${this.hue}, 100%, 95%, ${this.opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    }

    update(deltaTime, keys) {
        this.updatePosition(deltaTime, keys);
        this.updateVisuals(deltaTime);
    }

    updatePosition(deltaTime, keys) {
        if (keys.includes('w')) {
            this.momentum = this.velocity;
        }

        const isOutsideCanvas = this.x > this.canvas.width || this.x < 0
            || this.y > this.canvas.height || this.y < 0;

        if (isOutsideCanvas) {
            const radius = 200;
            this.x = this.canvas.width / 2 + getRandInt(-radius, radius);
            this.y = this.canvas.height / 2 + getRandInt(-radius, radius);
        } else {
            const displacementX = this.x - this.originX;
            const displacementY = this.y - this.originY;

            if (this.momentum) {
                const speed = keys.includes('w') && keys.includes('shift') ? 3 : 1;
                const momentumUsed = this.velocity + 1 - this.momentum;
                this.x += displacementX / momentumUsed * speed * deltaTime;
                this.y += displacementY / momentumUsed * speed * deltaTime;
            } else {
                this.x += displacementX / this.velocity * deltaTime;
                this.y += displacementY / this.velocity * deltaTime;
            }
        }

        this.momentum = Math.max(this.momentum - 1 * 20 * deltaTime, 0);
    }

    updateVisuals(deltaTime) {
        this.opacity = this.getOpacity();
    }
}

class Effect {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.starsCount = 500;
        this.stars = [];
        this.keys = [];
        this.resizeCanvas();
        this.createAudio();
        this.createStars();
        this.soundBtn = document.querySelector('[data-sound]');
        window.addEventListener('resize', this.resizeCanvas);
        window.addEventListener('keydown', this.setKeys);
        window.addEventListener('keyup', this.setKeys);
    }

    resizeCanvas = () => {
        for (const canvas of this.canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        this.createStars();
    }

    setKeys = (event) => {
        const key = event.key.toLowerCase();

        if (event.type === 'keydown') {
            this.keys.push(key);
        } else {
            this.keys = this.keys.filter(k => k !== key);
        }

        this.setSound();
    }

    setSound(isSoundEnabled) {
        if (!this.audioNode) return this.createAudio();
        if (!isSoundEnabled) return;

        if (this.keys.includes('w') && this.keys.includes('shift')) {
            this.setBoostingSound();
        } else if (this.keys.includes('w')) {
            this.setSoaringSound();
        } else {
            this.setHoveringSound();
        }
    }

    setBoostingSound() {
        this.audioNode.playbackRate.value = 1.04;
        this.gainNode.gain.value = 1;
    }

    setSoaringSound() {
        this.audioNode.playbackRate.value = 1.02;
        this.gainNode.gain.value = 0.5;
    }

    setHoveringSound() {
        this.audioNode.playbackRate.value = 1;
        this.gainNode.gain.value = 0.2;
    }

    createAudio() {
        if (this.audioNode !== undefined) return;

        this.audioNode = null;
        audioCtx = new AudioContext();

        const setAudio = (buffer) => {
            const gainNode = audioCtx.createGain();
            gainNode.connect(audioCtx.destination);

            const audioNode = audioCtx.createBufferSource();
            audioNode.buffer = buffer;
            audioNode.loop = true;
            audioNode.connect(gainNode);

            this.audioCtx = audioCtx;
            this.gainNode = gainNode;
            this.audioNode = audioNode;
        }

        fetch(ambianceSound, { mode: 'cors' })
            .then(response => response.arrayBuffer())
            .then(buffer => audioCtx.decodeAudioData(buffer, setAudio));
    }

    toggleAudio = isSoundEnabled => {
        if (!this.audioNode) return this.createAudio();

        try {
            this.setSound();
            this.audioNode.start();
        } catch {
            if (isSoundEnabled) {
                this.setSound(isSoundEnabled);
            } else {
                this.gainNode.gain.value = 0;
            }
        }
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.starsCount; i++) {
            this.stars.push(new Star(this.canvas[1], this.ctx[1]));
        }
    }

    render(deltaTime) {
        this.renderStars(deltaTime);
        this.renderSound();
    }

    renderStars(deltaTime) {
        for (const star of this.stars) {
            star.render();
            star.update(deltaTime, this.keys);
        }
    }

    renderSound() {
        const isSoundEnabled = JSON.parse(this.soundBtn.dataset.sound);
        this.toggleAudio(isSoundEnabled);
    }
}

function SpaceSoarer() {
    const ref1 = useRef(null);
    const ref2 = useRef(null);

    useEffect(() => {
        const canvas1 = ref1.current;
        const canvas2 = ref2.current;
        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');
        const effect = new Effect([canvas1, canvas2], [ctx1, ctx2]);
        let lastTimestamp = 0;
        let animationFrameId = requestAnimationFrame(render);

        function render(timestamp) {
            resetCanvas1();
            resetCanvas2();

            const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.02);
            effect.render(deltaTime);

            lastTimestamp = timestamp;
            animationFrameId = requestAnimationFrame(render);
        }

        function resetCanvas1() {
            ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
        }

        function resetCanvas2() {
            const gradient = ctx2.createRadialGradient(
                canvas2.width / 2, canvas2.height / 2, 0,
                canvas2.width / 2, canvas2.height / 2, canvas2.width / 2
            );
            gradient.addColorStop(0, 'hsla(220, 100%, 1%, 0.5)');
            gradient.addColorStop(1, 'hsla(220, 100%, 5%, 0.3)');
            ctx2.fillStyle = gradient;
            ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
        }

        return () => {
            audioCtx.close();
            cancelAnimationFrame(animationFrameId);
        }
    }, []);

    return <>
        <canvas className='space-soarer__2' ref={ref2}></canvas>
        <canvas className='space-soarer__1' ref={ref1} ></canvas>
    </>
}

export default SpaceSoarer;