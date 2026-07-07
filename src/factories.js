function btnFactory(name, onClickFunc, cssClass) {
    const button = document.createElement("button")
    const text = document.createTextNode(name)
    button.appendChild(text)
    button.className = cssClass

    // Add a 'click' event to that button element.
    button.addEventListener("click", onClickFunc)
    divFactory()
    return button
}

function divFactory() {
    let z = new Point()
    z.x = "hello world"
    z.y = 5
    console.log(z.x)
    console.log(z.y)
}

class Point {
    x
    y
}
