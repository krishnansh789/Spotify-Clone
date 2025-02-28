let currentSong = new Audio();
let lastPlayedSong = localStorage.getItem("lastPlayedSong") || "Apa Fer Milaangey - Savi Kahlon.mp3"; // Load last played song

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getsongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1]);
        }
    }
    return songs;
}

const playMusic = (track) => {
    currentSong.src = "/songs/" + track;
    currentSong.play();

    localStorage.setItem("lastPlayedSong", track); // Save last played song

    let albumImage = document.getElementById("albumImage");
    if (albumImage) {
        albumImage.src = "/songs images/" + track.replace(".mp3", ".jpeg");
    }

    document.querySelector(".songinfo").innerHTML = track;
    play.src = "pause.svg"; // Change icon to pause
};

// Load last played song
const loadLastPlayedSong = () => {
    currentSong.src = "/songs/" + lastPlayedSong;
    document.querySelector(".songinfo").innerHTML = lastPlayedSong.replace(".mp3", ""); 
    document.getElementById("albumImage").src = "/songs images/" + lastPlayedSong.replace(".mp3", ".jpeg");
};

async function main(){
    let songs = await getsongs();
    let songUL = document.querySelector(".box").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUL.innerHTML += `<li> 
                                <div> <img class="music" src="music-note.svg"></div>
                                <div class="info">                             
                                    <div>${song.replaceAll("%20", " ")}</div>
                                </div>
                                <div class="playnow">Play Now                  
                                    <div> <img class="play" src="play.svg"></div>
                                </div>
                            </li>`;
    }

    loadLastPlayedSong(); // Load last played song on page load

    let seekbar = document.getElementById("seekbar"); // ✅ Select seekbar inside main()

    // Attach event listener to each song
    Array.from(document.querySelector(".box").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songName);
        });
    });

    play.src = "play.svg"; // Ensure play button is in correct state on load

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // ✅ Corrected Seekbar Update
    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration) && currentSong.duration > 0) {
            let progress = (currentSong.currentTime / currentSong.duration) * 100;
            seekbar.value = progress; 
            document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        }
    });

    // ✅ Seekbar Seeking Works
    seekbar.addEventListener("input", () => {
        let seekTo = (seekbar.value / 100) * currentSong.duration;
        currentSong.currentTime = seekTo;
    });

    // ✅ Ensure Seekbar Starts Moving Once Song Loads
    currentSong.addEventListener("loadedmetadata", () => {
        seekbar.value = 0;
        document.querySelector(".songtime").innerHTML = `00:00 / ${secondsToMinutesSeconds(currentSong.duration)}`;
    });
}

main();
