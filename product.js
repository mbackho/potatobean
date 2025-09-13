// Gravity simulation for Potatobean Products page
window.startGravitySim = function startGravitySim() {
    const canvas = document.getElementById('gravityCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    // Three bodies with random positions and velocities
    function randBody(color) {
        // Keep bodies away from the very edge
        let margin = 80;
        let x = margin + Math.random() * (w - 2 * margin);
        let y = margin + Math.random() * (h - 2 * margin);
        // Random velocity between -2 and 2
        let vx = (Math.random() - 0.5) * 4;
        let vy = (Math.random() - 0.5) * 4;
        return {x, y, vx, vy, m: 18, color};
    }
    let bodies = [
        randBody('#ffe066'),
        randBody('#f33'),
        randBody('#3af')
    ];
    const G = 1.58;
    function step() {
        // Calculate forces
        for(let i=0;i<3;i++) {
            let fx = 0, fy = 0;
            for(let j=0;j<3;j++) if(i!==j) {
                let dx = bodies[j].x - bodies[i].x;
                let dy = bodies[j].y - bodies[i].y;
                let distSq = dx*dx + dy*dy;
                if (distSq < 1e-4) distSq = 1e-4; // Prevent division by zero
                let dist = Math.sqrt(distSq);
                // Always attract: direction is from i to j
                let force = G * bodies[i].m * bodies[j].m / distSq;
                fx += force * (dx/dist);
                fy += force * (dy/dist);
            }
            bodies[i].vx += fx / bodies[i].m;
            bodies[i].vy += fy / bodies[i].m;
        }
        // Update positions
        for(let i=0;i<3;i++) {
            bodies[i].x += bodies[i].vx;
            bodies[i].y += bodies[i].vy;
        }
    }
    function getBounds() {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for(let i=0;i<3;i++) {
            minX = Math.min(minX, bodies[i].x - bodies[i].m);
            minY = Math.min(minY, bodies[i].y - bodies[i].m);
            maxX = Math.max(maxX, bodies[i].x + bodies[i].m);
            maxY = Math.max(maxY, bodies[i].y + bodies[i].m);
        }
        return {minX, minY, maxX, maxY};
    }
    function draw() {
        ctx.clearRect(0,0,w,h);
        // Calculate zoom and pan
        let bounds = getBounds();
        let margin = 40;
        let bx = bounds.minX - margin, by = bounds.minY - margin;
        let bw = (bounds.maxX - bounds.minX) + 2*margin;
        let bh = (bounds.maxY - bounds.minY) + 2*margin;
        let scale = Math.min(w / bw, h / bh, 1.2); // never zoom in too much
        // Centering
        let cx = (bounds.minX + bounds.maxX) / 2;
        let cy = (bounds.minY + bounds.maxY) / 2;
        ctx.save();
        ctx.translate(w/2, h/2);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);
        // Draw bodies
        for(let i=0;i<3;i++) {
            ctx.beginPath();
            ctx.arc(bodies[i].x, bodies[i].y, bodies[i].m, 0, 2*Math.PI);
            ctx.fillStyle = bodies[i].color;
            ctx.shadowColor = bodies[i].color;
            ctx.shadowBlur = 16;
            ctx.fill();
            ctx.shadowBlur = 0;
            // Draw velocity vector for debug
            ctx.beginPath();
            ctx.moveTo(bodies[i].x, bodies[i].y);
            ctx.lineTo(bodies[i].x + bodies[i].vx*8, bodies[i].y + bodies[i].vy*8);
            ctx.strokeStyle = '#fff8';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Draw velocity text
            ctx.save();
            ctx.font = 'bold 15px Quicksand, Arial, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000b';
            ctx.lineWidth = 4;
            let vx = bodies[i].vx.toFixed(2);
            let vy = bodies[i].vy.toFixed(2);
            let label = `vx: ${vx}, vy: ${vy}`;
            let tx = bodies[i].x + bodies[i].m + 8;
            let ty = bodies[i].y - bodies[i].m - 8;
            ctx.strokeText(label, tx, ty);
            ctx.fillText(label, tx, ty);
            ctx.restore();
        }
        ctx.restore();
    }
    function loop() {
        step();
        draw();
        requestAnimationFrame(loop);
    }
    loop();
}
