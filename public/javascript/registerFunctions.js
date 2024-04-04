const checkedContainer = document.getElementById('checkedContainer')
const dropArea = document.getElementById('drop-area')
const inputFile = document.getElementById('input-file')
const imageView = document.getElementById('img-view')

inputFile.addEventListener('change', uploadImage)

function uploadImage(){
    let imgLink = URL.createObjectURL(inputFile.files[0])
    imageView.src = imgLink
    imageView.style.opacity = 1;
}

dropArea.addEventListener('dragover', function(e){
    e.preventDefault()
})

dropArea.addEventListener('drop', function(e){
    e.preventDefault()
    inputFile.files = e.dataTransfer.files;
    uploadImage()
})

document.getElementById('registrationForm').addEventListener('submit', function(event){
    var name = document.getElementsByName('name')[0].value
    var email = document.getElementsByName('email')[0].value
    var password = document.getElementsByName('password')[0].value
    var about = document.getElementsByName('about')[0].value

    if((name.trim() || email.trim() || password.trim() ) === ''){
        event.preventDefault()
        shiftSections(undefined,1, 'error')
    } else if(about.trim() === '' || inputFile.files.length == 0){
        event.preventDefault()
        // document.getElementsByClassName("company-description")[0].style.color = "red"
        shiftSections(undefined,2, 'error')
    } else if (checkedContainer.value === ''){
        event.preventDefault()
        shiftSections(undefined,3, 'error')
    }
})

function shiftSections(event, forcedNumber, errorMessage){
    const theTarget = event && event.target && parseInt(event.target.getAttribute("value")) !== null? parseInt(event.target.getAttribute("value")): forcedNumber || 1;
    document.getElementById("section"+theTarget).style.display = "flex"
    document.getElementById("number"+theTarget).className = "semicolon-separator"
    document.getElementById('button'+theTarget).className = "ellipse-div"
    const error = document.getElementsByClassName('errorMessage')

    if(error[0] != undefined){
        if(error[0].id != theTarget){
            error[0].style.display = "none"
        } else {
            error[0].style.display = "inline-block"
        }
    }


    switch (theTarget){
        case 1:
            document.getElementById("number"+(theTarget+1)).className = "unset-text"
            document.getElementById("number"+(theTarget+2)).className = "unset-text"
            document.getElementById("section"+(theTarget+1)).style.display = "none"
            document.getElementById("section"+(theTarget+2)).style.display = "none"
            document.getElementById('button'+(theTarget+1)).className = "div"
            document.getElementById('button'+(theTarget+2)).className = "div"
            break;
        case 2:
            document.getElementById("number"+(theTarget+1)).className = "unset-text"
            document.getElementById("number"+(theTarget-1)).className = "unset-text"
            document.getElementById("section"+(theTarget+1)).style.display = "none"
            document.getElementById("section"+(theTarget-1)).style.display = "none"
            document.getElementById('button'+(theTarget+1)).className = "div"
            document.getElementById('button'+(theTarget-1)).className = "div"
            break;
        case 3:
            document.getElementById("number"+(theTarget-1)).className = "unset-text"
            document.getElementById("number"+(theTarget-2)).className = "unset-text"
            document.getElementById("section"+(theTarget-1)).style.display = "none"
            document.getElementById("section"+(theTarget-2)).style.display = "none"
            document.getElementById('button'+(theTarget-1)).className = "div"
            document.getElementById('button'+(theTarget-2)).className = "div"
            break;
    }

    if(errorMessage != null && error.length == 0){
        const errorMessage = document.createElement('div')
        const message = document.createTextNode('Error: Required fields have not been filled');
        errorMessage.appendChild(message)

        errorMessage.classList.add('errorMessage')

        errorMessage.id = theTarget

        const errorContainer = document.getElementById('section'+theTarget)

        document.body.after(errorMessage, errorContainer)

    } else if(error.length > 3){
        error[theTarget].remove()
        const errorMessage = document.createElement('div')
        const message = document.createTextNode('Error: Required fields have not been filled');
        errorMessage.appendChild(message)

        errorMessage.classList.add('errorMessage')

        errorMessage.id = theTarget

        const errorContainer = document.getElementById('section'+theTarget)

        document.body.after(errorMessage, errorContainer)
    }
}

function toggleCheckbox(event) {
    if(event.target.parentNode.classList.contains('checked')){
        event.target.parentNode.classList.remove('checked')
        checkedContainer.value = checkedContainer.value.replace((","+event.target.parentNode.name), '')
    } else {
        event.target.parentNode.classList.add('checked')
        checkedContainer.value += (","+event.target.parentNode.name)
    }
}