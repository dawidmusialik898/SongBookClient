import { btnFactory } from "./factory.js"
import { fetchSongs, postSong } from "./songsApi.js"

let songs = []

let getSongsButton = btnFactory("Get songs", refreshSongs, "divbuttons")
let postSongButton = btnFactory("Create song", async () => {
    await postSong("Imagine", "John Lennon", null, "1")
    await refreshSongs()
}, "divbuttons")
let refreshListButton = btnFactory("Refresh song list", () => populateSongs(songs))

//script to handle main page


document.body.appendChild(getSongsButton)
document.body.appendChild(postSongButton)
document.body.appendChild(refreshListButton)


refreshSongs()

async function refreshSongs() {
    songs = await fetchSongs() ?? []
    populateSongs(songs)
}

function populateSongs(songs) {
    let songList = document.getElementById('songList')
    songList.replaceChildren()

    for (let i = 0; i < songs.length; i++) {
        let listItem = document.createElement('li')
        let song = songs[i]
        let text = document.createTextNode(song.number + '. ' + song.title + '. ' + song.author)
        listItem.appendChild(text)
        songList.appendChild(listItem)
    }
}
