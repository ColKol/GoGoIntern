const checkbox = document.getElementById('flexibleCheck')
const dateStart = document.getElementById('dateStart')
const dateEnd = document.getElementById('dateEnd')
const shiftStart = document.getElementById('shiftStart')
const shiftEnd = document.getElementById('shiftEnd')

const dropArea = document.getElementById('drop-area')
const inputFile = document.getElementById('input-file')
const imageView = document.getElementById('img-view')
const checkedContainer = document.getElementById('checkedContainer')

const deleteButtonManual = document.getElementById('deleteButtonManual')

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

checkbox.addEventListener('click',(event)=>{
    if(event.target.checked){
        dateStart.disabled = true;
        dateEnd.disabled = true;
        shiftStart.disabled = true;
        shiftEnd.disabled = true;
        shiftStart.value = "";
        shiftEnd.value = "";
        dateStart.value = "";
        dateEnd.value = "";
    } else {
        dateStart.disabled = false;
        dateEnd.disabled = false;
        shiftStart.disabled = false;
        shiftEnd.disabled = false;

    }
})

deleteButtonManual.addEventListener('click', function(event){
  event.target.closest('div').remove()
})

function addOneExtra(events) {
    let element;
    let filler;
    let max;
    let name;
    let placeholder;
    if (events.target.id === "employerQuestions") {
      element = document.getElementById("employerQuestionsHolder");
      filler = "Question ";
      max = true;
      name = "question";
      placeholder = 'e.g. What interests you about this role?'
    } else {
      element = document.getElementById("skillHolder");
      filler = "Skill ";
      max = false;
      name = "skill";
      placeholder = 'e.g. Proficient in English'
    }

    const numberOfQuestions = element.querySelectorAll("input").length;

    if(numberOfQuestions > 9 && max == true){
        alert("Maximum Questions Reached!")
        return;
    }
    const container = document.createElement("div"); // Create a new div container
  
    const deleteButton = document.createElement("button");
    const question = document.createElement("input");
    const deleteButtonImage = document.createElement('img')
  
    question.className = "eg-proficient-in";
    container.classList = 'questionContainer'

    deleteButtonImage.src = '/images/internshipCreator/trashCan.svg'
    question.type = "text";
    question.placeholder = placeholder;
    question.name = name;
    deleteButton.type = "button";
    deleteButton.id = "deleteButton";
    deleteButton.addEventListener("click", function (event) {
        element.removeChild(container);
    //   element.removeChild(question);
    //   element.removeChild(deleteButton);
  
      const remainingQuestions = Array.from(
        element.getElementsByClassName("genLabel")
      );
      remainingQuestions.forEach((remainingLabel, index) => {
        remainingLabel.textContent = filler + (index + 2) + ": ";
      });
    });
  
    deleteButton.appendChild(deleteButtonImage)

    container.appendChild(question);
    container.appendChild(deleteButton);

    element.appendChild(container)
  }

  function toggleCheckbox(event) {
    if(event.target.classList.contains('checked')){
        event.target.classList.remove('checked')
        checkedContainer.value = checkedContainer.value.replace((","+event.target.name), "")
    } else {
        event.target.classList.add('checked')
        checkedContainer.value += ","+event.target.name
    }
}