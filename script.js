let songs;
let audio = new Audio();
const SVGs = "images/svg/";
let volumeRange;

async function getMusicData() {
  let response = await fetch('music/music.json');
  let data = await response.json();
  return data.folders;
}

function playMusic(music) {
  audio.src = music;
  audio.load();
  audio.play(music);
  start.src = `${SVGs}pause.svg`;
}

function currentAudioName(src) {
  return decodeURI(src.split("/music/")[1]).split(".mp3")[0];
}

function secondsToMinuteSeconds(seconds) {
  let rsec = `${seconds % 60}`;
  let min = `${(seconds - Number(rsec)) / 60}`;

  if (rsec == "NaN" || min == "NaN") {
    return "00:00";
  }

  return `${min.padStart(2, "0")}:${rsec.padStart(2, "0")}`;
}

function shorten(str) {
  if (str.length > 50) {
    let newStr = str.substring(0, 50);
    return newStr + "....";
  } else {
    return str;
  }
}

function capitalize(title){
  if(title.length>0){
    let trimTitle = title.trim();
    let capital = `${trimTitle[0].toUpperCase()}${trimTitle.slice(1)}`
    return capital;
  }
}

async function main() {
  // Fetching the song folders from the JSON file
  let songFolders = await getMusicData();

  // Displaying the folders
  for (const folder of songFolders) {
    let songDiv = document.querySelector(".songs");
    let html = `            
      <div data-folder="${folder.name}" class="play-card">
        <div class="songImg">
          <img src="music/${folder.name}/${folder.cover}" alt="playlist-image" />
        </div>
        <div class="songDetails">
          <div class="songTitle">
            <h3>${folder.title}</h3>
          </div>
          <div class="lyrics">
            <p>${folder.description}</p>
          </div>
        </div>
      </div>`;
    songDiv.innerHTML += html;
  }

  // Loading the songs from the first folder
  let selectFolder = songFolders[0];
  songs = selectFolder.songs.map(song => `music/${selectFolder.name}/${song}`);
  audio.src = songs[0];

  // Playlist click events
  Array.from(document.querySelectorAll(".play-card")).forEach((card) => {
    card.addEventListener("click", async () => {
      selectFolder = songFolders.find(folder => folder.name === card.getAttribute("data-folder"));
      songs = selectFolder.songs.map(song => `music/${selectFolder.name}/${song}`);
      audio.src = songs[0];

      // Listing the songs in the songList
      let songList = document.querySelector(".songList");
      songList.innerHTML = "";
      let fragment = document.createDocumentFragment();

      for (const song of songs) {      
        let songName = decodeURIComponent(song.split(`music/${selectFolder.name}/`)[1]);
        console.log(song.split(`music/${selectFolder.name}/`)[1])

        let songCard = document.createElement("div");
        songCard.className = "song-card";

        songCard.innerHTML = `
          <div class="music-logo">
            <img src="${SVGs}music_icon.svg" alt="" class="invert" />
          </div>
          <div class="info-flex">
            <span id="music-name">${capitalize(shorten(songName))}</span>
            <p>Bishal</p>
          </div>
          <div class="play-song">
            <button class='play-btn'>
              <img data-music="${song}" src="${SVGs}play-song.svg" alt="playbutton" class="invert" />
            </button>
          </div>
        `;
        fragment.appendChild(songCard);
      }
      songList.appendChild(fragment);

      // Adding event listeners to play buttons
      let playButton = document.querySelectorAll(".play-btn");
      Array.from(playButton).forEach((button) => {
        button.addEventListener("click", (e) => {
          let selectedMusic = e.target.getAttribute("data-music");
          playMusic(selectedMusic);
          start.src = `${SVGs}pause.svg`;
        });
      });

      // Updating the seekbar
      audio.addEventListener("loadeddata", () => {
        const duration = secondsToMinuteSeconds(Math.round(audio.duration));
        document.querySelector(".timing").innerText = `00:00 / ${duration}`;
        document.querySelector(".circle").style.left = `0%`;
      });

      // Pausing the music
      let playLogo = document.getElementById("start");
      if (audio.paused) {
        playLogo.src = `${SVGs}play.svg`;
      }
    });
  });

  // Initial listing of the songs in the songList
  let songList = document.querySelector(".songList");
  let fragment = document.createDocumentFragment();

  for (const song of songs) {
    let songName = decodeURIComponent(song.split(`music/${selectFolder.name}/`)[1]);
    let songCard = document.createElement("div");
    songCard.className = "song-card";

    songCard.innerHTML = `
      <div class="music-logo">
        <img src="${SVGs}music_icon.svg" alt="" class="invert" />
      </div>
      <div class="info-flex">
        <span id="music-name">${capitalize(shorten(songName))}</span>
        <p>Bishal</p>
      </div>
      <div class="play-song">
        <button class='play-btn'>
          <img data-music="${song}" src="${SVGs}play-song.svg" alt="playbutton" class="invert" />
        </button>
      </div>
    `;
    fragment.appendChild(songCard);
  }
  songList.appendChild(fragment);

  // Playing the first song
  let playButton = document.querySelectorAll(".play-btn");
  Array.from(playButton).forEach((button) => {
    button.addEventListener("click", (e) => {
      let selectedMusic = e.target.getAttribute("data-music");
      playMusic(selectedMusic);
      start.src = `${SVGs}pause.svg`;
    });
  });

  // Handling audio events
  audio.addEventListener("loadeddata", () => {
    let title = currentAudioName(audio.currentSrc).split('/')[1];
    document.getElementById("song-title").innerText = capitalize(title);
    const duration = secondsToMinuteSeconds(Math.round(audio.duration));
    let cTime = "";

    audio.addEventListener("timeupdate", () => {
      cTime = secondsToMinuteSeconds(Math.round(audio.currentTime));
      document.querySelector(".timing").innerText = `${cTime} / ${duration}`;
    });
    document.querySelector(".timing").innerText = `00:00 / ${duration}`;
  });

  // Adding events to play, next, and previous buttons
  start.addEventListener("click", () => {
    if (audio.paused) {
      audio.play(audio.currentSrc);
      start.src = `${SVGs}pause.svg`;
    } else {
      audio.pause();
      start.src = `${SVGs}play.svg`;
    }

    
    
  });


  next.addEventListener("click", () => {
    let currentSrc = decodeURIComponent(audio.currentSrc.split('/music/')[1]);
    let index = songs.findIndex(song => song.includes(currentSrc));
   
    if (index < songs.length - 1) {
      audio.src = songs[index + 1];
      playMusic(audio.src);
    }
  });
  
  previous.addEventListener("click", () => {
    let currentSrc = decodeURIComponent(audio.currentSrc.split('/music/')[1]);
    let index = songs.findIndex(song => song.includes(currentSrc));
    if (index > 0) {
      audio.src = songs[index - 1];
      playMusic(audio.src);
    }
  });
  

  // Updating the seekbar
  audio.addEventListener("loadeddata", () => {
    let seekbar = document.querySelector(".seekbar");

    seekbar.addEventListener("click", (e) => {
      e.stopPropagation();
      let clickedOn = e.clientX - seekbar.getBoundingClientRect().left;
      let seekbarWidth = seekbar.getBoundingClientRect().width;
      let percentage = (clickedOn / seekbarWidth) * 100;
      let seekCircle = document.querySelector(".circle");
      seekCircle.style.left = percentage + "%";
      audio.currentTime = (audio.duration * percentage) / 100;
    });

    audio.addEventListener("timeupdate", () => {
      let index = songs.indexOf(audio.currentSrc);
      if (audio.ended && index < songs.length - 1) {
        audio.src = songs[index + 1];
        playMusic(audio.src);
      } else if (audio.ended && index == songs.length - 1) {
        start.src = `${SVGs}play.svg`;
        audio.currentTime = 0;
      }
      document.querySelector(".circle").style.left = `${(audio.currentTime / audio.duration) * 100}%`;
    });
  });

  // Updating the volume along with the input range
  function setVolumeImg(volumeRange) {
    if (volumeRange == 0) {
      vImg.src = `${SVGs}muted.svg`;
      audio.volume = volumeRange;
      audio.muted = true;
    } else if (volumeRange > 0 && volumeRange < 0.5) {
      audio.volume = volumeRange;
      vImg.src = `${SVGs}volume-low.svg`;
      audio.muted = false;
    } else if (volumeRange > 0.5) {
      audio.volume = volumeRange;
      vImg.src = `${SVGs}volume-h.svg`;
      audio.muted = false;
    }
  }

  let vImg = document.getElementById("volume-img");
  document.getElementById('volume').addEventListener("click", (e) => {
    volumeRange = volume.value / 100;
    console.log(volumeRange)
    setVolumeImg(volumeRange);
  });

  // Mobile touch event for volume control
  document.getElementById('volume').addEventListener("input", (e) => {
    let volume = e.target;   
    volumeRange = volume.value / 100;
    setVolumeImg(volumeRange);
  });

  // Mute and unmute functionality
  vImg.addEventListener("click", () => {
    if (!audio.muted) {
      audio.volume = 0;
      audio.muted = true;
      volume.value = 0;
      setVolumeImg(audio.volume);
      console.log("Muting the audio");
    } else {
      audio.muted = false;
      audio.volume = 0.2;
      volume.value = 20;
      console.log("Unmuting");
      setVolumeImg(audio.volume);
    }
  });

  // Adding event listener to hamburger
  let hamburger = document.getElementById('hamburger');
  let left = document.querySelector('.left');
  let footer = document.querySelector('.footer');

  hamburger.addEventListener('click', () => {
    left.style.position = 'absolute';
    left.style.left = '2px';
    left.style.zIndex = '2';
    footer.style.top = '530px';
    songList.style = '479px';
    document.querySelector('.library').style.height = '479px';
  });

  // Adding event listener to close hamburger
  let cross = document.getElementById('cross');
  cross.addEventListener('click', () => {
    left.style.left = '-500vw';
    console.log('Crossing');
  });
}

main();
