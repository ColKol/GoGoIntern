
const new_information = document.getElementById("Updateinformation")

function updateinformation() {
    new_information.addEventListener('click', function(event) {
        let new_name = document.getElementById('new_name').value;
        console.log(name);
        console.log(new_name);
        if (name != new_name) {
            name = new_name;
        }
    })
}
