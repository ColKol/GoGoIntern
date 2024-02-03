var content = document.getElementsByClassName('dropdown-content-content')

function toggleDropdown(n) {
    for (let i = 0; i < content.length; i++) {
        let displayed = content[i]
        if (i == n) {
            if (displayed.style.display == 'flex') {
                displayed.style.display = 'none'
            }

            else (displayed.style.display = 'flex')
        }
    }
}