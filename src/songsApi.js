export async function fetchSongs() {
    const url = "https://localhost:7152/songs"
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        const result = await response.json()
        console.log(result)
        return result
    } catch (error) {
        console.error(error.message)
    }
}

export async function postSong(
    title, author, originalTitle, number,
    key, tempo, parts) {
    const url = "https://localhost:7152/songs"
    try {
        const response = await fetch(url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    author: author,
                    originalTitle: originalTitle,
                    number: number,
                    key: key,
                    tempo: tempo,
                    parts: parts,
                })
            }
        )

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }

        const result = await response.json()
        console.log(result)
        return result
    } catch (error) {
        console.error(error.message)
    }
}
