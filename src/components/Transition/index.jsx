import './index.css';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import getRandInt from '../../utils/getRandInt';

class Circle {
    constructor(effect) {
        this.effect = effect;
        this.position = { x: 0, y: 0 };
        this.radius = 0;
        this.opacity = 1;
        this.hue = getRandInt(1, 360);
    }

    render() {
        this.effect.ctx.save()
        this.effect.ctx.globalAlpha = this.opacity + 0.5
        this.effect.ctx.fillStyle = `hsl(${this.hue}, 50%, 10%)`;
        this.effect.ctx.beginPath();
        this.effect.ctx.arc(this.position.x, this.position.y,
            this.radius, 0, 2 * Math.PI, false);
        this.effect.ctx.fill();
        this.effect.ctx.closePath();
        this.effect.ctx.restore();
    }

    update(deltaTime) {
        this.updatePosition(deltaTime);
        this.updateVisuals(deltaTime);
    }

    updatePosition(deltaTime) {
        if (!this.effect.click) return;
        this.position.x = this.effect.click.x;
        this.position.y = this.effect.click.y;
    }

    updateVisuals(deltaTime) {
        const maxSize = Math.max(this.effect.canvas.width, this.effect.canvas.height) * 2;
        const isCoveringScreen = this.radius >= maxSize;
        const deltaRadius = maxSize * 1.5 * deltaTime;

        if (!this.effect.navigated && isCoveringScreen) {
            this.effect.navigate(this.effect.link);
            this.effect.navigated = true;
        }

        if (!this.effect.navigated && this.effect.click) {
            this.radius = this.radius + deltaRadius;
        } else {
            this.position.x = this.effect.canvas.width;
            this.position.y = this.effect.canvas.height;
            this.radius = Math.max(this.radius - deltaRadius, 0);
            this.opacity = this.radius / maxSize;
        }

        if (this.radius === 0) {
            this.effect.navigating = false;
            this.effect.navigated = false;
            this.effect.click = null;
            this.opacity = 1;
        }

        this.hue = (this.hue + 50 * deltaTime) % 360;
    }
}

class Effect {
    constructor(canvas, ctx, navigate) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.navigate = navigate;
        this.navigating = false;
        this.navigated = false;
        this.click = null;
        this.circle = new Circle(this);
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas);
        window.addEventListener('click', this.setClickPosition, true);
    }

    resizeCanvas = () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setClickPosition = event => {
        const element = event.target.closest('[data-link]');
        if (element === null || this.navigating) return;
        this.link = element.dataset.link;
        this.navigating = true;
        this.click = { x: event.x, y: event.y };
        event.stopPropagation();
    }

    render(deltaTime) {
        this.renderCircle(deltaTime);
    }

    renderCircle(deltaTime) {
        this.circle.update(deltaTime);
        this.circle.render();
    }
}

function Transition() {
    const [isNavigating, setIsNavigating] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        const effect = new Effect(canvas, ctx, navigate);
        let lastTimestamp = 0;
        let animationFrameId = requestAnimationFrame(render);

        function render(timestamp) {
            const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.02);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            effect.render(deltaTime);
            setIsNavigating(effect.navigating);

            lastTimestamp = timestamp;
            animationFrameId = requestAnimationFrame(render);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return <canvas
        className='transition'
        style={{ display: isNavigating ? 'block' : 'none' }}
        ref={ref}
    ></canvas>
}

export default Transition;