function goLevel(level_id){
    localStorage.clear();
    localStorage.setItem('testing', level_id);
    window.location.href = "/page/practice";
}

/*
const level_count = 3;

levels_container = document.getElementById('levels-container');

for (let i = 0; i < level_count; i++) {
    levels_container.innerHTML += `<div class="button"> <h2> Level ${i + 1} </h2> <p> This is a description of what will be learned </p> </div>`;
}*/
