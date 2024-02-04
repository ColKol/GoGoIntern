

const new_information = document.getElementById("Updateinformation")

function updateinformation() {
    new_information.addEventListener('click', function(event) {
        let name = document.getElementById('name');
        let new_name = document.getElementById('new_name');
        if (name == new_name) {
            console.log("The new information is the same as your old information!");
        }
        else (name = new_name);
    })
}
