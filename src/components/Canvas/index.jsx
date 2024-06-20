import './index.css';
import { useRef, useEffect } from 'react';
import getRandInt from '../../utils/getRandInt';
import tomImage from '../../assets/tom.webp';

class Speck {
    constructor(effect) {
        this.effect = effect;
        this.position = {
            x: getRandInt(0, this.effect.canvas.width),
            y: getRandInt(0, this.effect.canvas.height),
            z: getRandInt(1, 3)
        };
        this.velocity = {
            x: getRandInt(-150, 150),
            y: getRandInt(-150, 150)
        };
        this.radius = this.position.z;
        this.opacity = this.position.z / 3;
        this.hue = getRandInt(1, 360);
    }

    render() {
        this.effect.ctx.save()
        this.effect.ctx.fillStyle = `hsla(${this.hue}, 80%, 80%, ${this.opacity})`;
        this.effect.ctx.beginPath();
        this.effect.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        this.effect.ctx.fill();
        this.effect.ctx.closePath();
        this.effect.ctx.restore();
    }

    update(deltaTime) {
        this.updatePosition(deltaTime);
        this.updateVisuals(deltaTime);
    }

    updatePosition(deltaTime) {
        this.velocity.x = this.effect.mouse.x - this.effect.canvas.width / 2;
        this.velocity.y = this.effect.mouse.y - this.effect.canvas.height / 2;
        this.position.x += this.velocity.x / 30 * this.position.z * deltaTime;
        this.position.y += this.velocity.y / 30 * this.position.z * deltaTime;

        if (this.position.x > this.effect.canvas.width) {
            this.position.x = 0;
        } else if (this.position.x <= 0) {
            this.position.x = this.effect.canvas.width;
        }

        if (this.position.y > this.effect.canvas.height) {
            this.position.y = 0;
        } else if (this.position.y <= 0) {
            this.position.y = this.effect.canvas.height;
        }
    }

    updateVisuals(deltaTime) {
        this.hue = (this.hue + 100 * deltaTime) % 360;
    }
}

class Trailer {
    constructor(effect) {
        this.effect = effect;
        this.position = {
            x: effect.mouse.x,
            y: effect.mouse.y
        };
        this.velocity = {
            x: getRandInt(-150, 150),
            y: getRandInt(-150, 150)
        };
        this.size = getRandInt(1, 5);
        this.hue = getRandInt(1, 360);
    }

    render() {
        this.effect.ctx.save()
        this.effect.ctx.fillStyle = `hsl(${this.hue}, 80%, 80%)`;
        this.effect.ctx.beginPath();
        this.effect.ctx.rect(this.position.x, this.position.y, this.size, this.size);
        this.effect.ctx.fill();
        this.effect.ctx.restore();
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
        this.size = Math.max(this.size - 2 * deltaTime, 0);
    }
}

class Ripple {
    constructor(effect, index) {
        this.effect = effect;
        this.index = index;
        this.position = {
            x: effect.mouse.x,
            y: effect.mouse.y
        };
        this.maxRadius = 50 + index * 20;
        this.radius = 0;
        this.growth = 50 + index * 50;
        this.color = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color');
    }

    render() {
        this.effect.ctx.save()
        this.effect.ctx.globalAlpha = 1 - this.radius / this.maxRadius;
        this.effect.ctx.strokeStyle = this.color;
        this.effect.ctx.lineWidth = 2 * (1 + this.index);
        this.effect.ctx.beginPath();
        this.effect.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        this.effect.ctx.stroke();
        this.effect.ctx.restore();
    }

    update(deltaTime) {
        this.updateVisuals(deltaTime);
    }

    updateVisuals(deltaTime) {
        this.radius += this.growth * deltaTime;
    }
}

class Effect {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.specksCount = 100;
        this.trailersCount = 5;
        this.ripplesCount = 3;
        this.specks = [];
        this.trailers = [];
        this.ripples = [];
        this.mouse = { x: 0, y: 0 };
        this.resizeCanvas();
        this.setImage();
        window.addEventListener('resize', this.resizeCanvas);
        window.addEventListener('scroll', this.scrollCanvas);
        window.addEventListener('keydown', this.handleKeys);
        window.addEventListener('mousemove', this.setMousePosition);
        window.addEventListener('click', this.createRipples);
    }

    resizeCanvas = () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createSpecks();
    }

    scrollCanvas = () => {
        // TODO: Create an effect on scroll.
    }

    handleKeys = event => {
        if (event.key === ' ') {
            event.preventDefault();
            this.toggleImage();
        }
    }

    setImage() {
        if (localStorage.getItem('bgEnabled') === 'true') {
            const storedImage = localStorage.getItem('bgImage');
            this.canvas.style.backgroundImage = `radial-gradient(`
                + `circle at bottom left, hsl(0, 0%, 10%, 0.8), `
                + `hsl(0, 0%, 0%) 70%), url(${storedImage ?? tomImage})`;
        } else {
            this.canvas.style.backgroundImage = 'none';
        }
    }

    toggleImage() {
        localStorage.setItem(
            'bgEnabled',
            localStorage.getItem('bgEnabled') !== 'true'
        );
        this.setImage();
    }

    setMousePosition = ({ x, y }) => {
        this.mouse = { x, y };
        this.createTrailers();
    }

    createSpecks = () => {
        this.specks = [];
        for (let i = 0; i < this.specksCount; i++) {
            this.specks.push(new Speck(this));
        }
    }

    createTrailers = () => {
        for (let i = 0; i < this.trailersCount; i++) {
            this.trailers.push(new Trailer(this));
        }
    }

    createRipples = () => {
        for (let i = 0; i < this.ripplesCount; i++) {
            this.ripples.push(new Ripple(this, i));
        }
    }

    render(deltaTime) {
        this.renderSpecks(deltaTime);
        this.renderTrailers(deltaTime);
        this.renderRipples(deltaTime);
    }

    renderSpecks(deltaTime) {
        for (const speck of this.specks) {
            speck.render();
            speck.update(deltaTime);
        }
    }

    renderTrailers(deltaTime) {
        for (const trailer of this.trailers) {
            trailer.render();
            trailer.update(deltaTime);
        }
        this.trailers = this.trailers
            .filter(trailer => trailer.size > 0);
    }

    renderRipples(deltaTime) {
        for (const ripple of this.ripples) {
            ripple.render();
            ripple.update(deltaTime);
        }
        this.ripples = this.ripples
            .filter(ripple => ripple.radius <= ripple.maxRadius);
    }
}

function Canvas() {
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

        return () => {
            window.removeEventListener('resize', effect.resizeCanvas);
            window.removeEventListener('scroll', effect.scrollCanvas);
            window.removeEventListener('keydown', effect.handleKeys);
            window.removeEventListener('mousemove', effect.setMousePosition);
            window.removeEventListener('click', effect.createRipples);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas className='canvas' ref={ref}></canvas>
}

export default Canvas;