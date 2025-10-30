// ========== 📦 VARIABLES ==========
const root = "../media/updates/";
const server = {
  ip: "server.cprot.net",
  port: 25570,
};

const emojiPath = (name) => `../media/emojis/${name}.png`;

const emoji = {
  bee: emojiPath("bee"),
  apple: emojiPath("apple"),
  book: emojiPath("book"),
  coin: emojiPath("coin"),
  commandBlock: emojiPath("command_block"),
  cookie: emojiPath("cookie"),
  fox: emojiPath("fox"),
  gift: emojiPath("gift"),
  friends: emojiPath("friends"),
  foxSpin: 'https://media.tenor.com/C1iSz9K0l6EAAAAj/spin-spinning.gif'
};

const link = {
  mcUpdate12190: 'https://feedback.minecraft.net/hc/en-us/articles/37393460002957-Minecraft-Bedrock-Edition-1-21-90-Chase-the-Skies',
  trailer: 'https://www.youtube.com/watch?v=wJO_vIDZn-I'
}

const newsList = [
  {
    type: "image",
    src: "element1.png",
    text: `${setEmoji(emoji.gift)} Many rewards are expected this week!`
  },
  {
    type: "image",
    src: "element2.png",
    text: `The new Minecraft 1.21.90 update is now available! Check out the new changes ${setLink(link.mcUpdate12190, 'here')}`,
  },
  {
    type: "image",
    src: "element3.png",
    text: `${setEmoji(emoji.friends)} The community is growing quite rapidly, we appreciate your support and hope you enjoy being with us!`,
  },
  {
    type: "video",
    src: "element4.mp4",
    text: `${setEmoji(emoji.foxSpin, 30)} ${setLink(link.trailer, 'Check out the new trailer!')}`,
  },
];

let currentNews = 0;
let autoTimer = null;
let isTransitioning = false;
let newsIntervalSeconds = 15;

const newsMedia = document.getElementById("news-media");
const newsText = document.getElementById("news-text");
const prevBtn = document.getElementById("prevNews");
const nextBtn = document.getElementById("nextNews");
const startBtn = document.getElementById("playButton");

const settingsBtn = document.querySelector(".settings-btn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");
const soundToggle = document.getElementById("soundToggle");
const volumeControl = document.getElementById("volumeControl");
const speedControl = document.getElementById("speedControl");
const bgVideo = document.getElementById("bg-video");
const resetSettings = document.getElementById("resetSettings");

const progressBar = document.querySelector(".news-progress");
let progressAnimation = null;

// ========== ⚙️ CONFIGURACIÓN INICIAL ==========
loadSettings();

// ========== 🔁 EVENT LISTENERS ==========

// Navegación de noticias
prevBtn.addEventListener("click", () => prevNews());
nextBtn.addEventListener("click", () => nextNews());
startBtn.addEventListener("click", () => openMinecraft());

// Mostrar/Ocultar panel de configuración
settingsBtn.addEventListener("click", () => {
  settingsPanel.style.display = "flex";
});
closeSettings.addEventListener("click", () => {
  settingsPanel.style.display = "none";
});

// Cambios en configuración
soundToggle.addEventListener("change", () => {
  bgVideo.muted = !soundToggle.checked;
  saveSettings();
});
volumeControl.addEventListener("input", () => {
  bgVideo.volume = parseFloat(volumeControl.value);
  saveSettings();
});
speedControl.addEventListener("input", () => {
  newsIntervalSeconds = parseFloat(speedControl.value);
  saveSettings();
});

// Restaurar configuración
if (resetSettings) {
  resetSettings.addEventListener("click", () => {
    localStorage.removeItem("launcherSettings");
    loadSettings();
  });
}

// ========== 🚀 INICIALIZACIÓN ==========
newsMedia.style.opacity = 1;
newsText.style.opacity = 1;
updateNews();
backgroundSound();

// ========== 🧠 FUNCIONES ==========

function updateNews() {
  if (isTransitioning) return;
  isTransitioning = true;
  clearAutoTimer();
  resetProgressBar();

  const news = newsList[currentNews];

  Promise.all([fadeOut(newsMedia), fadeOut(newsText)]).then(() => {
    newsMedia.innerHTML = "";

    if (news.type === "image") {
      const img = document.createElement("img");
      img.src = root + news.src;
      img.alt = "loading...";
      newsMedia.appendChild(img);
      newsText.innerHTML = news.text;

      Promise.all([fadeIn(newsMedia), fadeIn(newsText)]).then(() => {
        isTransitioning = false;
        startAutoTimer(); // Solo una vez y después de fade
      });

    } else if (news.type === "video") {
      const vid = document.createElement("video");
      vid.src = root + news.src;
      vid.autoplay = true;
      vid.muted = true;
      vid.loop = false;
      vid.playsInline = true;
      vid.style.width = "100%";
      vid.style.height = "100%";

      vid.addEventListener("ended", () => nextNews());

      vid.addEventListener("loadedmetadata", () => {
        Promise.all([fadeIn(newsMedia), fadeIn(newsText)]).then(() => {
          isTransitioning = false;
          runProgressBar(vid.duration);
          autoTimer = setTimeout(() => nextNews(), vid.duration * 1000);
        });
      });

      newsMedia.appendChild(vid);
      newsText.innerHTML = news.text;
    }
  });
}

function prevNews() {
  if (isTransitioning) return;
  currentNews = (currentNews - 1 + newsList.length) % newsList.length;
  updateNews();
}

function nextNews() {
  if (isTransitioning) return;
  currentNews = (currentNews + 1) % newsList.length;
  updateNews();
}

function startAutoTimer() {
  clearAutoTimer();
  resetProgressBar();

  const duration = newsIntervalSeconds;
  runProgressBar(duration);
  autoTimer = setTimeout(() => nextNews(), duration * 1000);
}

function clearAutoTimer() {
  if (autoTimer) {
    clearTimeout(autoTimer);
    autoTimer = null;
  }
}

function fadeOut(element, duration = 300) {
  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = 0;
    setTimeout(resolve, duration);
  });
}

function fadeIn(element, duration = 300) {
  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = 1;
    setTimeout(resolve, duration);
  });
}

function backgroundSound() {
  const background = document.getElementsByClassName("background")[0];

  // Mute temporal para permitir autoplay
  background.muted = true;

  // Esperar un momento para evitar bloqueo de autoplay
  setTimeout(() => {
    const saved = localStorage.getItem("launcherSettings");

    if (saved) {
      const settings = JSON.parse(saved);
      background.muted = !settings.sound;
      background.volume = settings.volume;
    } else {
      // Si no hay configuración guardada, usar valores por defecto
      background.muted = false;
      background.volume = 1;
    }
  }, 100);
}

function saveSettings() {
  const settings = {
    sound: soundToggle.checked,
    volume: parseFloat(volumeControl.value),
    speed: parseFloat(speedControl.value),
  };
  localStorage.setItem("launcherSettings", JSON.stringify(settings));
}

function loadSettings() {
  const saved = localStorage.getItem("launcherSettings");
  if (saved) {
    const settings = JSON.parse(saved);
    soundToggle.checked = settings.sound;
    bgVideo.muted = !settings.sound;
    volumeControl.value = settings.volume;
    bgVideo.volume = settings.volume;
    speedControl.value = settings.speed;
    newsIntervalSeconds = settings.speed;
  } else {
    soundToggle.checked = true;
    bgVideo.muted = false;
    volumeControl.value = 1;
    bgVideo.volume = 1;
    speedControl.value = 15;
    newsIntervalSeconds = 15;
  }
}

function startAutoTimer() {
  clearAutoTimer();
  resetProgressBar();

  const news = newsList[currentNews];
  let duration = newsIntervalSeconds;

  // Si es video, usar duración del video
  if (news.type === "video") {
    const video = document.querySelector(".news-media video");
    if (video) {
      video.addEventListener("loadedmetadata", () => {
        duration = video.duration;
        runProgressBar(duration);
        autoTimer = setTimeout(() => nextNews(), duration * 1000);
      });
      return;
    }
  }

  runProgressBar(duration);
  autoTimer = setTimeout(() => nextNews(), duration * 1000);
}

function runProgressBar(duration) {
  progressBar.style.transition = "none";
  progressBar.style.width = "0%";

  // Usamos requestAnimationFrame para animar con más precisión
  const start = performance.now();

  function animate(time) {
    const elapsed = (time - start) / 1000; // en segundos
    const progress = Math.min(elapsed / duration, 1);
    progressBar.style.width = `${progress * 100}%`;

    if (progress < 1) {
      progressAnimation = requestAnimationFrame(animate);
    }
  }

  progressAnimation = requestAnimationFrame(animate);
}

function resetProgressBar() {
  if (progressAnimation) cancelAnimationFrame(progressAnimation);
  progressBar.style.width = "0%";
  progressBar.style.transition = "none";
}

function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

function openMinecraft() {
  const { ip, port } = server;
  const url = `minecraft://connect?serverUrl=${ip}&serverPort=${port}`;
  setTimeout(() => {
    window.open(url, '_blank');
    window.open(url, '_self');
    setTimeout(() => {
      startBtn.blur();
    }, 2000);
  }, 1000);
}

function setEmoji(emoji, size=20) {
  return `<img class='emoji' src='${emoji}' width='${size}px' alt='' style='top: 5px; position: relative;'>`;
}

function setLink(link, text) {
  return `<a class='link' onclick='copyToClipboard("${link}")'>${text}</a>`;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`Copiado al portapapeles: ${text}`);
  }).catch((err) => {
    console.error('Failed to copy: ', err);
  });
}
