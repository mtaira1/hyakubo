(() => {
  const photos = Array.from(document.querySelectorAll(".photo"));
  const stage = document.querySelector(".photo-stage");

  const ACTIVE_COUNT = 7;     // 同時に見える枚数
  const SCALE_MIN = 0.6;      // 最小サイズ
  const SCALE_MAX = 1.5;      // 最大サイズ
 const SPEED_MIN = 28;
const SPEED_MAX = 85;
  const MIN_DIST = 120;       // 重なり防止距離

  const state = new Map();
  let active = [];

  const rand = (a,b)=>Math.random()*(b-a)+a;
  const shuffle = a => a.sort(()=>Math.random()-0.5);

  function bounds() {
    return {
      w: stage.clientWidth,
      h: stage.clientHeight
    };
  }

  function spawn(photo) {
    const { w, h } = bounds();
    const scale = rand(SCALE_MIN, SCALE_MAX);

    let x, y, safe;
    for (let i=0;i<200;i++) {
      x = rand(0, w-200);
      y = rand(0, h-200);
      safe = active.every(p=>{
        const s = state.get(p);
        return Math.hypot(s.x-x, s.y-y) > MIN_DIST;
      });
      if (safe) break;
    }

    const angle = rand(0, Math.PI*2);
    const speed = rand(SPEED_MIN, SPEED_MAX);

    state.set(photo, {
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      scale
    });

    photo.style.setProperty("--s", scale);
    photo.classList.add("is-active");
  }

  function remove(photo) {
    photo.classList.remove("is-active");
    state.delete(photo);
  }

  function fill() {
    const inactive = photos.filter(p=>!active.includes(p));
    shuffle(inactive);
    while (active.length < ACTIVE_COUNT && inactive.length) {
      const p = inactive.pop();
      spawn(p);
      active.push(p);
    }
  }

  function swap() {
    const removeCount = 2;
    for (let i=0;i<removeCount;i++) {
      const p = active.shift();
      remove(p);
    }
    fill();
  }

  function tick() {
    const { w, h } = bounds();
    active.forEach(p=>{
      const s = state.get(p);
      s.x += s.vx*0.016;
      s.y += s.vy*0.016;

      if (s.x<0||s.x>w-200) s.vx*=-1;
      if (s.y<0||s.y>h-200) s.vy*=-1;

      p.style.setProperty("--x", `${s.x}px`);
      p.style.setProperty("--y", `${s.y}px`);
    });
    requestAnimationFrame(tick);
  }

  // 初期化
  shuffle(photos);
  active = [];
  fill();
  tick();
  setInterval(swap, 4000);
})();