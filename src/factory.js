export function btnFactory(name, onClickFunc, cssClass) {
    const button = document.createElement("button")
    const text = document.createTextNode(name)
    button.appendChild(text)
    button.className = cssClass

    button.addEventListener("click", onClickFunc)
    return button
}

function divFactory() {
}
