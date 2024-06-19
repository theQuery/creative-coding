import './index.css';
import { useRef, useEffect } from 'react';
import getRandInt from '../../utils/getRandInt';

const PARTICLES = 10;
const SPEED = 10;
const REACH = 200;

class Particle {
    constructor(effect) {
        this.effect = effect;
        this.canvas = effect.canvas;
        this.ctx = effect.ctx;
        const note = String.fromCharCode(65 + getRandInt(0, 6));
        const pitch = getRandInt(1, 7);
        this.audio = import(`./assets/${note}${pitch}.mp3`);
        this.radius = (8 - pitch) * 10;
        this.shadow = this.radius / 2;
        this.hue = getRandInt(1, 360);
        this.x = getRandInt(this.radius, this.canvas.width - this.radius);
        this.y = getRandInt(this.radius, this.canvas.height - this.radius);
        this.speedX = (getRandInt(0, 1)
            ? getRandInt(10, 40) : getRandInt(-10, -40)) * SPEED;
        this.speedY = (getRandInt(0, 1)
            ? getRandInt(10, 40) : getRandInt(-10, -40)) * SPEED;
    }

    render() {
        this.ctx.save();
        this.ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
        this.ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
        this.ctx.shadowBlur = this.shadow;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    }

    update(deltaTime) {
        this.updatePosition(deltaTime);
        this.updateVisuals(deltaTime);
    }

    updatePosition(deltaTime) {
        const x = this.x + this.speedX * deltaTime;
        const y = this.y + this.speedY * deltaTime;
        const maxInlineBorder = Math.min(x, this.canvas.width - this.radius);
        const maxBlockBorder = Math.min(y, this.canvas.height - this.radius);
        this.x = Math.max(this.radius, maxInlineBorder);
        this.y = Math.max(this.radius, maxBlockBorder);

        const negX = this.x - this.radius;
        const posX = this.x + this.radius;
        const negY = this.y - this.radius;
        const posY = this.y + this.radius;
        const isAtInlineBorder = negX <= 0 || posX >= this.canvas.width;
        const isAtBlockBorder = negY <= 0 || posY >= this.canvas.height;

        if (isAtInlineBorder) {
            this.speedX *= -1;
        };

        if (isAtBlockBorder) {
            this.speedY *= -1;
        };

        if (isAtInlineBorder || isAtBlockBorder) {
            if (this.effect.isAudioEnabled) {
                this.audio.then(audio => new Audio(audio.default).play());
            }

            this.shadow = this.radius;
            this.hue += 90;
        }
    }

    updateVisuals(deltaTime) {
        this.hue = (this.hue + 10 * deltaTime) % 360;
        const minShadow = this.radius / 2;
        const dimmedShadow = this.shadow - this.radius * deltaTime;
        this.shadow = Math.max(minShadow, dimmedShadow);
    }
}

class Effect {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.frequency = PARTICLES;
        this.particles = [];
        this.isAudioEnabled = false;
        this.soundBtn = document.querySelector('[data-sound]');
        this.resizeCanvas();
        this.createParticles();
        window.addEventListener('resize', this.resizeCanvas);
    }

    resizeCanvas = () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        for (let i = 0; i < this.frequency; i++) {
            this.particles.push(new Particle(this));
        }
    }

    render(deltaTime) {
        this.renderLines();
        this.renderParticles(deltaTime);
        this.renderSound();
    }

    renderLines() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i; j < this.particles.length; j++) {
                const pA = this.particles[i];
                const pB = this.particles[j];
                const distanceX = pA.x - pB.x;
                const distanceY = pA.y - pB.y;
                const originDistance = Math.hypot(distanceX, distanceY);
                const borderDistance = originDistance - pA.radius - pB.radius;
                const isWithinReach = borderDistance <= REACH && pA !== pB;

                if (!isWithinReach) continue;

                const gradient = this.ctx.createLinearGradient(
                    pA.x + pA.radius, pA.y + pA.radius,
                    pB.x - pB.radius, pB.y - pB.radius
                );

                gradient.addColorStop(0, `hsl(${pA.hue}, 100%, 50%)`);
                gradient.addColorStop(1, `hsl(${pB.hue}, 100%, 50%)`);

                this.ctx.save();
                this.ctx.globalAlpha = 1 - borderDistance / REACH;
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 5;
                this.ctx.beginPath();
                this.ctx.moveTo(pA.x, pA.y);
                this.ctx.lineTo(pB.x, pB.y);
                this.ctx.stroke();
                this.ctx.restore();
            }
        }
    }

    renderParticles(deltaTime) {
        for (const particle of this.particles) {
            particle.render();
            particle.update(deltaTime);
        }
    }

    renderSound() {
        this.isAudioEnabled = JSON.parse(this.soundBtn.dataset.sound);
    }
}

function PianoOrbs() {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        const effect = new Effect(canvas, ctx);
        let lastTimestamp = 0;
        let animationFrameId = requestAnimationFrame(render);

        function render(timestamp) {
            const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.02);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            effect.render(deltaTime);

            lastTimestamp = timestamp;
            animationFrameId = requestAnimationFrame(render);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return <canvas className='piano-orbs' ref={ref}></canvas>
}

export default PianoOrbs;