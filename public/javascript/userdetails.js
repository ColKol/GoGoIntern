const fields = document.querySelectorAll('#openFields')
const changeFields = document.getElementById('changeFields')
const checkedContainer =document.getElementById('checkedContainer')

fields.forEach((element) => {
    element.addEventListener('click', () => {
  
      if (changeFields.style.display === 'none') {
        changeFields.style.display = 'block';
      } else {
        changeFields.style.display = 'none';
      }
    });
});


function toggleCheckbox(event) {
    if(event.target.classList.contains('checked')){
        event.target.classList.remove('checked')
        checkedContainer.value = checkedContainer.value.replace((","+event.target.name), "")
    } else {
        event.target.classList.add('checked')
        checkedContainer.value += ","+event.target.name
    }
}

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