import './index.css';
import { useRef, useEffect } from 'react';
import getRandInt from '../../utils/getRandInt';
import backgroundImage from '../../assets/background.webp';

class Speck {
    constructor(effect) {
        this.effect = effect;
        this.position = {
            x: getRandInt(0, this.effect.canvas.width),
            y: getRandInt(0, this.effect.canvas.height),
            z: getRandInt(1, 3)
        };
        this.velocity = {
            x: 0,
            y: 300
        };
        this.radius = this.position.z;
        this.lightness = this.position.z / 3 * 100;
    }

    render() {
        this.effect.ctx.save();
        this.effect.ctx.fillStyle = `hsl(0, 0%, ${this.lightness}%)`;
        this.effect.ctx.beginPath();
        this.effect.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        this.effect.ctx.fill();
        this.effect.ctx.closePath();
        this.effect.ctx.restore();
    }

    update(deltaTime) {
        this.updatePosition(deltaTime);
    }

    updatePosition(deltaTime) {
        this.velocity.x = this.effect.mouse.x - this.effect.canvas.width / 2;
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
        this.lightness = getRandInt(1, 100);
    }

    render() {
        this.effect.ctx.save()
        this.effect.ctx.fillStyle = `hsl(0, 0%, ${this.lightness}%)`;
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

class Background {
    constructor(effect) {
        this.effect = effect;
        this.position = { x: 50, y: 50 };
        this.setImage();
    }

    setImage(imageURL) {
        if (imageURL) localStorage.setItem('bgImage', imageURL);

        if (localStorage.getItem('bgEnabled') === 'true') {
            this.image = localStorage.getItem('bgImage') ?? backgroundImage;
            this.position = { x: 50, y: 50 };
            this.setPosition();
            this.setOpacity();
            this.setSize();

            this.effect.canvas.style.backgroundImage = `radial-gradient(`
                + `circle at bottom left, hsl(0, 0%, 10%, ${this.opacity}), `
                + `hsl(0, 0%, 0%) 70%), url(${this.image})`;
        } else {
            this.effect.canvas.style.backgroundImage = 'none';
        }
    }

    removeImage() {
        localStorage.removeItem('bgImage');
        this.setImage();
    }

    setPosition() {
        const backgroundPosition = `${this.position.x}% ${this.position.y}%`;
        this.effect.canvas.style.backgroundPosition = backgroundPosition;
    }

    setOpacity() {
        const hour = new Date().getHours();
        const darkness = 1 - Math.sin(Math.PI * hour / 24);
        this.opacity = darkness * 0.8 + 0.1;
    }

    setSize() {
        const image = new Image();
        image.onload = () => {
            this.width = image.width;
            this.height = image.height;
        };
        image.src = this.image;
    }

    toggle() {
        const isBgEnabled = localStorage.getItem('bgEnabled') === 'true';
        localStorage.setItem('bgEnabled', !isBgEnabled);
        this.setImage();
    }

    update(deltaTime) {
        this.updatePosition(deltaTime);
    }

    updatePosition(deltaTime) {
        if (this.effect.keys.has('w') !== this.effect.keys.has('s')) {
            const widthDiff = this.width - this.effect.canvas.width;
            const heightDiff = this.height - this.effect.canvas.height;
            const axis = widthDiff > heightDiff ? 'x' : 'y';

            this.position[axis] = this.effect.keys.has('w')
                ? Math.max(this.position[axis] - 100 * deltaTime, 0)
                : Math.min(this.position[axis] + 100 * deltaTime, 100);

            this.setPosition();
        }
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
        this.keys = new Set();
        this.background = new Background(this);
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas);
        window.addEventListener('scroll', this.scrollCanvas);
        window.addEventListener('paste', this.handlePaste);
        window.addEventListener('keydown', this.handleKeys);
        window.addEventListener('keyup', this.handleKeys);
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

    handlePaste = event => {
        event.preventDefault();

        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text');
        const imageURLRegex = /(http(s?):)([%/.\w-])*\.(?:jpg|jpeg|gif|png|webp|jfif)/;

        if (pastedText.match(imageURLRegex)) {
            this.background.setImage(pastedText);
        } else {
            const app = document.querySelector('.app');
            const keyframes = [
                { transform: 'translate(1px, 1px) rotate(0deg) scale(1.02)' },
                { transform: 'translate(-1px, -2px) rotate(-1deg) scale(1.04)' },
                { transform: 'translate(-3px, 0px) rotate(1deg) scale(1.06)' },
                { transform: 'translate(3px, 2px) rotate(0deg) scale(1.08)' },
                { transform: 'translate(1px, -1px) rotate(1deg) scale(1.1)' },
                { transform: 'translate(-1px, 2px) rotate(-1deg) scale(1.1)' },
                { transform: 'translate(-3px, 1px) rotate(0deg) scale(1.1)' },
                { transform: 'translate(3px, 1px) rotate(-1deg) scale(1.1)' },
                { transform: 'translate(-1px, -1px) rotate(1deg) scale(1.09)' },
                { transform: 'translate(1px, 2px) rotate(0deg) scale(1.07)' },
                { transform: 'translate(1px, -2px) rotate(-1deg) scale(1.03) ' }
            ];
            const timing = { duration: 500 };
            app.animate(keyframes, timing);
        }
    }

    handleKeys = event => {
        this.setKeys(event);

        if (event.type === 'keydown') {
            if (event.key === ' ') {
                event.preventDefault();
                this.background.toggle();
            } else if (event.key === 'Escape') {
                this.background.removeImage();
            }
        }
    }

    setKeys = event => {
        const key = event.key.toLowerCase();
        this.keys[event.type === 'keydown' ? 'add' : 'delete'](key);
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
        this.renderBackground(deltaTime);
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

    renderBackground(deltaTime) {
        this.background.update(deltaTime);
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
            window.removeEventListener('paste', effect.handlePaste);
            window.removeEventListener('keydown', effect.handleKeys);
            window.removeEventListener('keyup', effect.handleKeys);
            window.removeEventListener('mousemove', effect.setMousePosition);
            window.removeEventListener('click', effect.createRipples);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas className='canvas' ref={ref}></canvas>
}

export default Canvas;