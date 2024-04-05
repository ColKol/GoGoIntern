const container = document.getElementById('archireef-logo'); // Assuming a container element wraps the divs

const divs = Array.from(document.getElementsByClassName('archireef-parent'));

const settingButton = document.getElementById('group-button')

const dateHolder = document.getElementById('dateHolder')

const ascendingOrdescending = document.getElementById('rectangle-parent10')

const notifPanel = document.getElementById('notifPanel')

const addbutton = document.getElementById('AddInternship')

const section2 = document.getElementById('section2')

const section3 = document.getElementById('archireef-logo') 

const childImg = ascendingOrdescending.querySelector('img')

const reset = document.getElementById('reset')

const resetContainer = document.getElementById('resetContainer')

const resetForm = document.getElementById('resetForm')


document.addEventListener('DOMContentLoaded', function() {
    sortByDate();
});

ascendingOrdescending.addEventListener('click',(button)=>{
    if (ascendingOrdescending.value === 'ascending') {

        ///images/userpage/descendingOrder.svg
        ascendingOrdescending.value = 'descending';
        childImg.src = "/images/userpage/descendingOrder.svg";
      } else {
        ascendingOrdescending.value = 'ascending';
        childImg.src = "/images/userpage/ascendingOrder.svg";
      }

    if(settingButton.value === 'Date'){
        sortByDate()
    } else {
        sortByAlphabet()
    }
})

settingButton.addEventListener('click',()=>{
    if(settingButton.value === 'Date'){
        settingButton.value = 'Alphabet'
        dateHolder.textContent = 'ABC'
        sortByAlphabet()
    } else {
        settingButton.value = 'Date'
        dateHolder.textContent = 'Date'
        sortByDate()
    }
})

function sortByAlphabet(){
    if(ascendingOrdescending.value === 'ascending'){
        divs.sort((div1, div2) => {
            const id1 = div1.getAttribute('name');
            const id2 = div2.getAttribute('name');
            return id2.localeCompare(id1); // Sort alphabetically
        });
    } else {
        divs.sort((div1, div2) => {
            const id1 = div1.getAttribute('name');
            const id2 = div2.getAttribute('name');
            return id1.localeCompare(id2); // Sort alphabetically
        });
    }
    return divs.forEach(div => container.appendChild(div));
}

function sortByDate(){
    if(ascendingOrdescending.value === 'ascending'){
        divs.sort((div1, div2) => {
            const date1 = new Date(div1.id);
            const date2 = new Date(div2.id);
            return date1 - date2; // Sort in ascending order (latest date first)
        });
    } else {
        divs.sort((div1, div2) => {
            const date1 = new Date(div1.id);
            const date2 = new Date(div2.id);
            return date2 - date1; // Sort in descending order (latest date first)
        });
    }
    return divs.forEach(div => container.appendChild(div));
}

function notifOpen(){
    if(notifPanel.style.opacity == 1){
        notifPanel.style.opacity = 0
        section2.style.opacity = 1
        section3.style.opacity = 1
        addbutton.style.opacity = 1
    } else {
        notifPanel.style.opacity = 1
        section2.style.opacity = 0.5
        section3.style.opacity = 0.5
        addbutton.style.opacity = 0.5
    }
}

const showDialogButtons = document.querySelectorAll('.show-dialog-btn');

showDialogButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const dialogId = button.getAttribute('data-dialog-id');
    const dialog = document.getElementById(`dialog${dialogId}`);
    dialog.showModal();
    dialog.classList.add('open')

    const closeButton = dialog.querySelector('.rectangle-parent27')
    closeButton.addEventListener('click',()=>{
        dialog.classList.remove('open')
        setTimeout(function(){
            dialog.close()
        }, 500)
        // dialog.style.display = 'none';
    })
  });
});

reset.addEventListener('click',()=>{
    if(resetContainer.value === ""){
        resetContainer.value += 'reset'
    } else {
        resetContainer.value = resetContainer.value.replace('reset',"")
    }
})

resetForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    this.submit();
});