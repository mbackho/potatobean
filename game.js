// Game logic for Potatobean
window.startPotatoGame = function startPotatoGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    let running = true;
    let score = 0;
    let frame = 0;
    let bullets = [];
    let bulletBaseSpeed = 2.2; // start slower
    let bulletSpeedGrowth = 0.0007; // speed up over time
    let gunBaseCooldown = 70;
    let gunCooldownVar = 60;
    // Improved gun spacing: guns move up/down and fire at different intervals
    let guns = [
        {y: 60, cooldown: 0, dir: 1},
        {y: 150, cooldown: 30, dir: -1},
        {y: 240, cooldown: 60, dir: 1}
    ];
    let potato = {x: 40, y: h/2, vy: 0, vx: 0, size: 40};
    let up = false, down = false, left = false, right = false;
    let img = new window.Image();
    img.src = 'potatobean.png';
    function reset() {
        running = true;
        score = 0;
        frame = 0;
        bullets = [];
        guns = [
            {y: 60, cooldown: 0, dir: 1},
            {y: 150, cooldown: 30, dir: -1},
            {y: 240, cooldown: 60, dir: 1}
        ];
        potato.y = h/2;
        potato.vy = 0;
        document.getElementById('gameOverMsg').style.display = 'none';
        loop();
    }
    window.restartGame = reset;
    function loop() {
        if (!running) return;
        ctx.clearRect(0,0,w,h);
        // Draw guns
        guns.forEach(gun => {
            ctx.fillStyle = '#555';
            ctx.fillRect(w-30, gun.y-15, 20, 30);
            ctx.fillStyle = '#888';
            ctx.fillRect(w-10, gun.y-5, 10, 10);
        });
        // Draw bullets
        ctx.fillStyle = '#f33';
        bullets.forEach(b => ctx.fillRect(b.x, b.y, 8, 4));
        // Draw potato
        if(img.complete) ctx.drawImage(img, potato.x, potato.y-potato.size/2, potato.size, potato.size);
        else {
            ctx.fillStyle = '#fc3';
            ctx.beginPath();
            ctx.arc(potato.x+potato.size/2, potato.y, potato.size/2, 0, 2*Math.PI);
            ctx.fill();
        }
        // Move potato
        potato.vy = 0; potato.vx = 0;
        if(up) potato.vy = -3;
        if(down) potato.vy = 3;
        if(left) potato.vx = -3;
        if(right) potato.vx = 3;
        potato.y += potato.vy;
        potato.x += potato.vx;
        // Clamp to left half of playfield
        if(potato.x < 0) potato.x = 0;
        if(potato.x > w/2 - potato.size) potato.x = w/2 - potato.size;
        if(potato.y < potato.size/2) potato.y = potato.size/2;
        if(potato.y > h-potato.size/2) potato.y = h-potato.size/2;
        // Move bullets (curved paths)
        // Increase speed every 1000 points
        let speedLevel = Math.floor(score / 1000);
        let currentBulletSpeed = bulletBaseSpeed + frame * bulletSpeedGrowth + speedLevel * 1.1;
        bullets.forEach(b => {
            b.x -= currentBulletSpeed;
            // Apply curve: sinusoidal or bezier-like
            if(b.curveType === 'sin') {
                b.y = b.baseY + Math.sin((b.x - b.startX) / b.waveLen) * b.amp;
            } else if(b.curveType === 'bezier') {
                let t = Math.max(0, Math.min(1, (b.startX - b.x) / (b.startX - 0)));
                b.y = (1-t)*(1-t)*b.baseY + 2*(1-t)*t*b.cpY + t*t*b.endY;
            }
        });
        bullets = bullets.filter(b => b.x > -10);
        // Fire bullets
        guns.forEach(gun => {
            // Move gun up/down
            gun.y += gun.dir * 1.2;
            if(gun.y < 30) { gun.y = 30; gun.dir = 1; }
            if(gun.y > h-30) { gun.y = h-30; gun.dir = -1; }
            if(gun.cooldown <= 0) {
                // Randomly choose curve type
                let curveType = Math.random() < 0.5 ? 'sin' : 'bezier';
                let bullet = {x: w-30, y: gun.y-2, startX: w-30, baseY: gun.y-2, curveType};
                if(curveType === 'sin') {
                    bullet.amp = 20 + Math.random()*30;
                    bullet.waveLen = 60 + Math.random()*60;
                } else {
                    bullet.cpY = gun.y-2 + (Math.random()-0.5)*100;
                    bullet.endY = 30 + Math.random()*(h-60);
                }
                bullets.push(bullet);
                // Decrease cooldown every 1000 points
                let cooldownLevel = Math.floor(score / 1000);
                let cooldown = Math.max(20, gunBaseCooldown - cooldownLevel * 10);
                let cooldownVar = Math.max(20, gunCooldownVar - cooldownLevel * 10);
                gun.cooldown = cooldown + Math.random() * cooldownVar;
            } else gun.cooldown--;
        });
        // Collision
        bullets.forEach(b => {
            if(b.x < potato.x+potato.size && b.x+8 > potato.x && b.y < potato.y+potato.size/2 && b.y+4 > potato.y-potato.size/2) {
                running = false;
                document.getElementById('gameOverMsg').style.display = 'block';
            }
        });
        // Score
        if(running) score++;
        ctx.fillStyle = '#ffe066';
        ctx.font = 'bold 18px Quicksand, Arial, sans-serif';
        ctx.fillText('Score: '+score, 10, 25);
        if(running) requestAnimationFrame(loop);
    }
    // Controls
    function key(e, d) {
        if(e.key === 'ArrowUp') up = d;
        if(e.key === 'ArrowDown') down = d;
        if(e.key === 'ArrowLeft') left = d;
        if(e.key === 'ArrowRight') right = d;
    }
    window.addEventListener('keydown', e => key(e, true));
    window.addEventListener('keyup', e => key(e, false));
    // Touch controls
    const touchUp = document.getElementById('touchUp');
    const touchDown = document.getElementById('touchDown');
    const touchLeft = document.getElementById('touchLeft');
    const touchRight = document.getElementById('touchRight');
    if(touchUp && touchDown && touchLeft && touchRight) {
        touchUp.addEventListener('touchstart', e => { up = true; e.preventDefault(); });
        touchUp.addEventListener('touchend', e => { up = false; e.preventDefault(); });
        touchDown.addEventListener('touchstart', e => { down = true; e.preventDefault(); });
        touchDown.addEventListener('touchend', e => { down = false; e.preventDefault(); });
        touchLeft.addEventListener('touchstart', e => { left = true; e.preventDefault(); });
        touchLeft.addEventListener('touchend', e => { left = false; e.preventDefault(); });
        touchRight.addEventListener('touchstart', e => { right = true; e.preventDefault(); });
        touchRight.addEventListener('touchend', e => { right = false; e.preventDefault(); });
    }
    // Swipe controls on canvas
    let swipeStartX = null, swipeStartY = null;
    canvas.addEventListener('touchstart', function(e) {
        if(e.touches.length === 1) {
            swipeStartX = e.touches[0].clientX;
            swipeStartY = e.touches[0].clientY;
        }
    });
    canvas.addEventListener('touchend', function(e) {
        if(swipeStartX === null || swipeStartY === null) return;
        let touch = e.changedTouches[0];
        let dx = touch.clientX - swipeStartX;
        let dy = touch.clientY - swipeStartY;
        let absDx = Math.abs(dx), absDy = Math.abs(dy);
        // Only consider as swipe if moved enough
        if(absDx > 30 || absDy > 30) {
            if(absDx > absDy) {
                // Horizontal swipe
                if(dx > 0) { right = true; setTimeout(()=>{right=false;}, 150); }
                else { left = true; setTimeout(()=>{left=false;}, 150); }
            } else {
                // Vertical swipe
                if(dy > 0) { down = true; setTimeout(()=>{down=false;}, 150); }
                else { up = true; setTimeout(()=>{up=false;}, 150); }
            }
        }
        swipeStartX = null; swipeStartY = null;
    });
    reset();
}
