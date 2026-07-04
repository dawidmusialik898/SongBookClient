
function btnFactory(name, onClickFunc, cssClass) {
    const button= document.createElement("button");
    const text = document.createTextNode(name);
    button.appendChild(text);
    button.className = cssClass

    // Add a 'click' event to that button element.
    button.addEventListener("click", onClickFunc);
    return button;
}

function divFactory() {
}
