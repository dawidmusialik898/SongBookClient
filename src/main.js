let getSongsButton = btnFactory("Get songs", () => fetchSongs(),"divbuttons")
let postSongButton = btnFactory("Create song", () => postSong(
"Imagine", "John Lennon", null, "1"), "divbuttons")
let refreshListButton= btnFactory("Refresh song list", () => populateSongs(songs))

//script to handle main page


document.body.appendChild(getSongsButton)
document.body.appendChild(postSongButton)
document.body.appendChild(refreshListButton)


var songs = fetchSongs()
populateSongs(songs)

function populateSongs(songs)
{
    let songList = document.getElementById('songList')

    for(let i = 0; i < songs.length; i++) {
        let listItem =  document.createElement('li')
        let song = songs[i]
        let text = document.createTextNode(song.number +'. ' + song.title + '. ' + song.author)
        listItem.appendChild(text)
        songList.appendChild(listItem)
    }
}
