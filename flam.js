// bezier.js

class BezierCurve {
    constructor() {
        this.canvas = document.getElementById('bezierCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Control points: P0, P1, P2, P3
        this.controlPoints = [
            { x: 100, y: 300, fixed: true },    // P0 - fixed
            { x: 200, y: 100, vx: 0, vy: 0 },   // P1 - dynamic
            { x: 400, y: 100, vx: 0, vy: 0 },   // P2 - dynamic
            { x: 500, y: 300, fixed: true }     // P3 - fixed
        ];
        
        // Spring physics parameters
        this.springStiffness = 0.1;
        this.damping = 0.95;
        
        // Mouse interaction
        this.mouse = { x: 0, y: 0, isDown: false, draggingPoint: null };
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start animation
        this.lastTime = 0;
        this.animate();
        
        // Setup sliders
        this.setupSliders();
    }
    
    resizeCanvas() {
        this.canvas.width = Math.min(900, window.innerWidth - 40);
        this.canvas.height = 600;
    }
    
    setupEventListeners() {
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            
            // If dragging a point, update its target
            if (this.mouse.isDown && this.mouse.draggingPoint !== null) {
                const point = this.controlPoints[this.mouse.draggingPoint];
                point.targetX = this.mouse.x;
                point.targetY = this.mouse.y;
            }
        });
        
        // Mouse down
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.isDown = true;
            this.checkPointDrag();
        });
        
        // Mouse up
        this.canvas.addEventListener('mouseup', () => {
            this.mouse.isDown = false;
            this.mouse.draggingPoint = null;
        });
        
        // Mouse leave
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.isDown = false;
            this.mouse.draggingPoint = null;
        });
    }
    
    setupSliders() {
        const stiffnessSlider = document.getElementById('stiffnessSlider');
        const dampingSlider = document.getElementById('dampingSlider');
        const resetBtn = document.getElementById('resetBtn');
        
        stiffnessSlider.addEventListener('input', (e) => {
            this.springStiffness = parseFloat(e.target.value);
        });
        
        dampingSlider.addEventListener('input', (e) => {
            this.damping = parseFloat(e.target.value);
        });
        
        resetBtn.addEventListener('click', () => {
            this.resetCurve();
        });
    }
    
    // Check if mouse is near a control point for dragging
    checkPointDrag() {
        const dragRadius = 20;
        for (let i = 1; i <= 2; i++) { // Only P1 and P2 are draggable
            const point = this.controlPoints[i];
            const dx = point.x - this.mouse.x;
            const dy = point.y - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < dragRadius) {
                this.mouse.draggingPoint = i;
                point.targetX = this.mouse.x;
                point.targetY = this.mouse.y;
                return;
            }
        }
    }
}
// Add these methods to the BezierCurve class

// Calculate point on Bézier curve at parameter t (0 to 1)
calculateBezierPoint(t) {
    const p0 = this.controlPoints[0];
    const p1 = this.controlPoints[1];
    const p2 = this.controlPoints[2];
    const p3 = this.controlPoints[3];
    
    // Cubic Bézier formula: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
    const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
    
    return { x, y };
}

// Calculate tangent vector at parameter t
calculateBezierTangent(t) {
    const p0 = this.controlPoints[0];
    const p1 = this.controlPoints[1];
    const p2 = this.controlPoints[2];
    const p3 = this.controlPoints[3];
    
    // Derivative formula: B'(t) = 3(1-t)²(P₁-P₀) + 6(1-t)t(P₂-P₁) + 3t²(P₃-P₂)
    const u = 1 - t;
    
    const dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
    const dy = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
    
    // Normalize the tangent vector
    const length = Math.sqrt(dx * dx + dy * dy);
    return {
        x: dx / (length || 1), // Avoid division by zero
        y: dy / (length || 1),
        length: length
    };
}