import './index.css';
import { useRef, useEffect } from 'react';
import getRandInt from '../../utils/getRandInt';
import explosion1Sound from './assets/explosion-1.mp3';
import explosion2Sound from './assets/explosion-2.mp3';
import explosion3Sound from './assets/explosion-3.mp3';

class Sparkle {
    constructor(effect) {
        this.effect = effect;
        this.ctx = effect.ctx[0];
        this.position = { ...effect.mouse };
        this.velocity = {
            x: getRandInt(-20, 20),
            y: getRandInt(100, 200)
        }
        this.outerRadius = getRandInt(4, 6);
        this.innerRadius = getRandInt(1, 3);
        this.spikes = getRandInt(4, 8);
        this.hue = getRandInt(30, 50);
        this.opacity = 1;
    }

    render() {
        let x = this.position.x;
        let y = this.position.y;
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / this.spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(this.position.x, this.position.y - this.outerRadius);
        for (let i = 0; i < this.spikes; i++) {
            x = this.position.x + Math.cos(rot) * this.outerRadius;
            y = this.position.y + Math.sin(rot) * this.outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = this.position.x + Math.cos(rot) * this.innerRadius;
            y = this.position.y + Math.sin(rot) * this.innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        this.ctx.lineTo(this.position.x, this.position.y - this.outerRadius);
        this.ctx.closePath();
        this.ctx.fillStyle = `hsl(${this.hue}, 100%, 50%, ${this.opacity})`;
        this.ctx.fill();
    }

    update(deltaTime) {
        this.updatePosition(deltaTime);
        this.updateVisuals(deltaTime);
    }

    updatePosition(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
    }

    updateVisuals(deltaTime) {
        this.opacity = Math.max(this.opacity - 1 * deltaTime, 0);
    }
}

class Confetti {
    constructor(effect) {
        this.effect = effect;
        this.ctx = effect.ctx[1];
        this.position = { ...effect.mouse };
        this.velocity = {
            x: getRandInt(-500, 500),
            y: getRandInt(-500, 100)
        }
        this.radius = getRandInt(4, 8);
        this.hue = getRandInt(1, 360);
        this.gravity = 1000;
    }

    render() {
        this.ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.closePath();
    }

    update(deltaTime) {
        this.updatePosition(deltaTime);
        this.updateVisuals(deltaTime);
    }

    updatePosition(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.y += this.gravity * deltaTime;
    }

    updateVisuals(deltaTime) {
        this.radius = Math.max(this.radius - 5 * deltaTime, 0);
        this.hue += 80 * deltaTime;
    }
}

class Effect {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.sparklesCount = 3;
        this.confettisCount = 30;
        this.sparkles = [];
        this.confettis = [];
        this.mouse = { x: 0, y: 0 };
        this.isMouseAway = true;
        this.isAudioEnabled = false;
        this.sounds = [explosion1Sound, explosion2Sound, explosion3Sound];
        this.soundBtn = document.querySelector('[data-sound]');
        this.resizeCanvas();
        setInterval(() => !this.isMouseAway && this.createSparkles(), 100);
        window.addEventListener('resize', this.resizeCanvas);
        this.canvas[0].addEventListener('click', this.createConfettis);
        this.canvas[0].addEventListener('mousemove', this.setMousePosition);
        this.canvas[0].addEventListener('mouseenter', this.setIsMouseAway);
        this.canvas[0].addEventListener('mouseleave', this.setIsMouseAway);
    }

    resizeCanvas = () => {
        for (const canvas of this.canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    createSparkles() {
        for (let i = 0; i < this.sparklesCount; i++) {
            this.sparkles.push(new Sparkle(this));
        }
    }

    createConfettis = () => {
        for (let i = 0; i < this.confettisCount; i++) {
            this.confettis.push(new Confetti(this));
        }

        if (this.isAudioEnabled) {
            const soundsIndex = getRandInt(0, this.sounds.length - 1);
            const audio = new Audio(this.sounds[soundsIndex]);
            audio.volume = 0.1;
            audio.play();
        }
    }

    setMousePosition = ({ x, y }) => {
        this.mouse = { x, y };
        this.createSparkles();
    }

    setIsMouseAway = ({ type }) => {
        this.isMouseAway = type === 'mouseleave';
    }

    render(deltaTime) {
        this.renderSparkles(deltaTime);
        this.renderConfettis(deltaTime);
        this.renderSound();
    }

    renderSparkles(deltaTime) {
        for (const sparkle of this.sparkles) {
            sparkle.render();
            sparkle.update(deltaTime);
        }
        this.sparkles = this.sparkles
            .filter(sparkle => sparkle.opacity > 0);
    }

    renderConfettis(deltaTime) {
        for (const confetti of this.confettis) {
            confetti.render();
            confetti.update(deltaTime);
        }
        this.confettis = this.confettis
            .filter(confetti => confetti.radius > 0);
    }

    renderSound() {
        this.isAudioEnabled = JSON.parse(this.soundBtn.dataset.sound);
    }
}

function MagicWand() {
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
            ctx2.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return <>
        <canvas className='magic-wand__2' ref={ref2}></canvas>
        <canvas className='magic-wand__1' ref={ref1} ></canvas>
    </>
}

export default MagicWand;