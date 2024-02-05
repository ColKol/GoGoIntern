
const new_information = document.getElementById("Updateinformation")

function updateinformation() {
    new_information.addEventListener('click', function(event) {
        let new_name = document.getElementById('new_name').value;
        let new_email = document.getElementById('new_email').value;
        if (name != new_name) {
            name = new_name;
        }
        
        // if (email != new_email) {
        //     email = new_email
        // }

        // if (name == new_name && email == new_email) {
        //     console.log("your new information is the same as your old one!")
        // }
    })
}
