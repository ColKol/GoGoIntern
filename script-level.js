//var x_ray_type_global // May not be necessary
//const image_type_array = ['normal', 'bacteria', 'virus', 'covid', 'tuberculosis']
const question_type_count = 5;
var question_answer; // For verifying all questions
var level_progress = -1;

// Changing texts
var answer_container = document.getElementById('answer-container');
var continue_button = document.getElementById('continue-button');
var text_container = document.getElementById(`question-text-container`);

const level_question_count = 15;

// For keyboard shortcuts
var keyboard_question_answered = false;

// For stats
var current_type;
var answered_correct = 0;

var stats = {
    'normal': {
        'correct': 0,
        'total': 0,
    },
    'bacteria': {
        'correct': 0,
        'total': 0,
    },
    'virus': {
        'correct': 0,
        'total': 0,
    },
    'covid': {
        'correct': 0,
        'total': 0,
    },
    'tuberculosis': {
        'correct': 0,
        'total': 0,
    },
    'fractured': {
        'correct': 0,
        'total': 0,
    },
    'nonfractured': {
        'correct': 0,
        'total': 0,
    },
}

// For level design
const level_id = localStorage.getItem('testing');
console.log(`level ${level_id}`)

// Open JSON with level courses
var levels_object;

fetch('./level-plan.json')
    .then(response => response.json())
    .then(data => {
    // Process the JSON data
    levels_object = data;
    //console.log(levels_object);
    launchLevel();
})
  .catch(error => {
    // Handle any errors
    console.log('Error:', error);
});

var chosen_level;

function launchLevel(){
    chosen_level = levels_object[level_id];
    progressQuestion()
}

function progressQuestion(){
    level_progress += 1;

    if (level_progress == level_question_count){
        setupQuestion0();
    }

    else{
        let random_question_number = Math.floor(Math.random()*Object.keys(chosen_level).length);
        let current_question = chosen_level[random_question_number];
    
        switch(current_question['type']){
            case 1:
                setupQuestion1(current_question['subject'], current_question['other_images']);
                break;
            case 2:
                setupQuestion2(current_question['subject'], current_question['other_images']);
                break;
            case 3:
                setupQuestion3(current_question['options']);
                break;
            case 4:
                setupQuestion4(current_question['options']);
                break;
            default:
                console.log('Error with question type');
                updateAccuracy();
                displayQuestionType(0);
        }
    }

    questionCompletion(false);
}

function getPneumoniaType(){
    let pneumonia_types = ['virus', 'bacteria']
    let random_number = Math.floor(Math.random()*pneumonia_types.length);
    return pneumonia_types[random_number]
}

function getImage(image_type, callback) {
    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // Set the path to the images folders
    const path = `x-rays/${image_type}`;
    
    // Open the request
    xhr.open("GET", path, true);

    // Set the responseType to document so we can parse the response as HTML
    xhr.responseType = "document";
  
    // Set the onload function
    xhr.onload = function() {
        // Get the HTML document from the response
        const doc = xhr.response;
        // Get all the image elements from the document
        const images = doc.querySelectorAll(".icon-image");
        let randomNumber = Math.floor(Math.random()*images.length);

        // Return image path
        if(callback) callback(images[randomNumber]['href']);
    };
  
    // Send the request
    xhr.send();
}

function updateAccuracy(){
    let total_correct = 0;
    let total_questions = 0;

    // Display stats for individual types
    for (let condition in stats) {
        let stat_container = document.getElementById(`stat-${condition}`);

        if (stats[condition]['total'] == 0){
            stat_container.style.display = 'none';
        }

        else{
            total_correct += stats[condition]['correct'];
            total_questions += stats[condition]['total'];

            let condition_stat = Math.round(100 * (stats[condition]['correct'] / stats[condition]['total']));
            stat_container.innerHTML = `${condition}: ${condition_stat}% accuracy`;
        }
    }

    let stat_all = Math.round(100 * (total_correct / total_questions));
    let stat_all_container = document.getElementById('stat-all');

    stat_all_container.innerHTML = `Total: ${stat_all}% accuracy`
}

function changeButtonState(state){
    let all_answer_buttons = document.getElementsByClassName("answer-button");

    // Loop through each element and disable its button
    for (var i = 0; i < all_answer_buttons.length; i++) {
      let button = all_answer_buttons[i];
      button.disabled = state;
    }
}

function questionCompletion(completion_state){
    let answer_visibility

    if (completion_state){
        answer_visibility = 'block'
    }
    else{
        answer_visibility = 'none'
    }

    answer_container.style.display = answer_visibility;
    continue_button.style.display = answer_visibility;

    changeButtonState(completion_state);
}

function verifyAnswer(question_response){
    if (question_response == question_answer){
        answer_container.innerHTML = `Correct! You identified ${current_type}!`;
        answered_correct += 1;

        stats[current_type]['correct'] += 1;
        stats[current_type]['total'] += 1;
    }
    else{
        answer_container.innerHTML = `Wrong! You failed to identify ${current_type}!`;
        stats[current_type]['total'] += 1;
    }

    keyboard_question_answered = true;
    questionCompletion(true);
}

function changeQuestionText(new_text){
    text_container = document.getElementById(`question-text-container`);
    text_container.innerHTML = new_text;
}

function setupQuestion0(){
    text_container.style.display = "none";
    updateAccuracy();
    displayQuestionType(0);
}

function setupQuestion1(subject, other_images){
    question_answer = Math.floor(Math.random() * 2);

    // Get Question Text
    changeQuestionText(`Does the image indicate ${subject}?`);
    /*
    let text_container = document.getElementById(`q-1-text`);
    text_container.innerHTML = `Does the image contain: ${subject}?`*/

    // Get image type based on answer
    let image_type;

    if (question_answer == 0){
        image_type = subject

        // If subject is pneumonia
        if (image_type == 'pneumonia'){
            image_type = getPneumoniaType()
            console.log(image_type)
        }
    }
    else{
        let random_number = Math.floor(Math.random() * other_images.length);
        image_type = other_images[random_number];
    }

    // Input the current type of x ray for stats
    current_type = image_type;

    // get image
    getImage(image_type, function(image_path){
        let image_container = document.getElementById(`q-1-img`);
        image_container.src = image_path
        console.log(image_path)
    });

    displayQuestionType(1);
}

function setupQuestion2(subject, other_images){
    // Get Answer
    question_answer = Math.floor(Math.random() * 4);
    console.log(question_answer)

    // Get Question Text
    changeQuestionText(`Select the image with: ${subject}`);
    /*
    let text_container = document.getElementById(`q-2-text`);
    text_container.innerHTML = `Select the image with: ${subject}`
    */

    // Get Images
    for (let i = 0; i < 4; i++) {
        let image_container = document.getElementById(`q-2-img-${i}`);
        let image_type;

        // Get image type
        if (i != question_answer){
            let random_number = Math.floor(Math.random() * other_images.length);
            image_type = other_images[random_number];
        }
        else{
            image_type = subject

            // If subject is pneumonia
            if (image_type == 'pneumonia'){
                image_type = getPneumoniaType()
                console.log(image_type)
            }

            // Input the current type of x ray for stats
            current_type = image_type;
        }

        // Get images
        getImage(image_type, function(image_path){
            image_container.src = image_path
            console.log(image_path)
        });
    }

    displayQuestionType(2);
}

function setupQuestion3(answer_options){
    // Get answer
    question_answer = Math.floor(Math.random() * answer_options.length);
    console.log(question_answer)

    // Change question text
    changeQuestionText(`Identify the condition`);

    // Create answer buttons
    let answer_button_container = document.getElementById('qa-grid-3')
    answer_button_container.innerHTML = ''

    // Create buttons
    for (let i = 0; i < answer_options.length; i++) {
        let button_name = answer_options[i];
        answer_button_container.innerHTML += `<button class="answer-button" onclick="verifyAnswer('${i}')"> <p>${button_name}</p> </button>`
    }

    // Get image
    let chosen_image = answer_options[question_answer]
    if (chosen_image == 'pneumonia'){
        chosen_image = getPneumoniaType()
        console.log(chosen_image)
    }

    // Input the current type of x ray for stats
    current_type = chosen_image;

    getImage(chosen_image, function(image_path){
        let image_container = document.getElementById(`q-3-img`);
        image_container.src = image_path
        console.log(image_path)
    });

    displayQuestionType(3);
}

var match_pointer = {
    "text": -1,
    "image": -1
};

var matches_left = -1;

function verifyMatch(answer_id, match_button_type, disease_type){
    if (match_pointer[match_button_type] == answer_id){
        match_pointer[match_button_type] = -1;
    }

    else{
        match_pointer[match_button_type] = answer_id;
    }

    // Iterate through and only highlight the clicked element
    function highlightMatchButton(button_type){
        let chosen_match_id = `match-${button_type}-${match_pointer[button_type]}`;

        let match_grid = document.getElementById(`match-grid-4-${button_type}`);
        match_grid = match_grid.children;

        for (let i = 0; i < match_grid.length; i++){
            let match_grid_button = match_grid[i];
    
            if (match_grid_button.getAttribute('id') == chosen_match_id){
                match_grid_button.style.backgroundColor = "purple";
            }
            
            else{
                match_grid_button.style.backgroundColor = "var(--outline-color)";
            }
        }
    }

    function resetMatch(){
        match_pointer = {
            "text": -1,
            "image": -1,
        };
        highlightMatchButton("text");
        highlightMatchButton("image");
    }

    highlightMatchButton(match_button_type);

    let text_id = match_pointer["text"];
    let image_id = match_pointer["image"]

    if (text_id == -1 || image_id == -1){
        return;
    }

    // Verify correctness

    if (text_id == image_id){
        console.log("correct!");

        // hide correctly matched buttons
        let match_text_button = document.getElementById(`match-text-${text_id}`);
        let match_image_button = document.getElementById(`match-image-${image_id}`);

        match_text_button.style.display = "none";
        match_image_button.style.display = "none";

        // Reset selectors and colours
        resetMatch();

        // For stats
        stats[disease_type]['correct'] += 1;
        stats[disease_type]['total'] += 1;

        matches_left -= 1;
        console.log(`Now you only have to make ${matches_left} more matches`)

        if (matches_left == 0){
            question_answer = 0;
            current_type = disease_type;
            verifyAnswer(0);
        }
    }

    else{
        console.log("wrong!")
        resetMatch();

        // For stats
        stats[disease_type]['total'] += 1;
    }

    console.log(stats)

    //button.disabled = true / false;
}

function setupQuestion4(answer_options_raw){
    changeQuestionText(`Match the conditions to their images`);

    let answer_options = answer_options_raw.slice();

    console.log(answer_options)

    if (answer_options.includes("pneumonia")){
        let pneumonia_type = getPneumoniaType();
        console.log(`${pneumonia_type} chosen!`)
        let pneumonia_index = answer_options.indexOf("pneumonia");

        answer_options[pneumonia_index] = pneumonia_type;
    }

    match_pointer = {
        "text": -1,
        "image": -1,
    };

    matches_left = answer_options.length;
    
    let left_match_grid = document.getElementById('match-grid-4-text')
    let right_match_grid = document.getElementById('match-grid-4-image')

    left_match_grid.innerHTML = "";
    right_match_grid.innerHTML = "";

    // Get dictionary of answer values
    let match_answer_ids = {};
    for (let i = 0; i < answer_options.length; i++) {
        match_answer_ids[answer_options[i]] = i;
    }

    // Shuffle array
    function shuffleAnswers(){
        let shuffled_array = [];
        let original_array = answer_options.slice();

        for (let i = 0; i < answer_options.length; i++) {
            let random_index = Math.floor(Math.random() * original_array.length);
            let chosen_type = original_array.splice(random_index, 1);

            chosen_type = chosen_type[0];
            shuffled_array.push(chosen_type);
        }
        return shuffled_array;
    }

    function getMatchImages(){
        console.log("time to image out!")
        // Generate images and place them into correct containers
        for (let i = 0; i < answer_options.length; i++) {
            let image_type = answer_options[i];

            getImage(image_type, function(image_path){
                let match_image_container = document.getElementById(`match-image-${match_answer_ids[image_type]}`);
                match_image_container.innerHTML = `<img src="${image_path}"></img>`;
            });
        }
    }

    function generateMatchButtons(setupImages){
        let shuffled = shuffleAnswers();

        for (let i = 0; i < shuffled.length; i++) {
            let answer_name = shuffled[i];
            let answer_id = match_answer_ids[answer_name];
            
            if (setupImages){
                right_match_grid.innerHTML += `<button class="answer-button" id="match-image-${answer_id}" onclick="verifyMatch(${answer_id}, 'image', '${answer_name}')"></img></button>`;
            }

            else{
                left_match_grid.innerHTML += `<button class="answer-button" id="match-text-${answer_id}" onclick="verifyMatch(${answer_id}, 'text', '${answer_name}')"><p>${answer_name}</p></button>`;
            }
        }

        if (setupImages){
            getMatchImages();
        }
    }

    generateMatchButtons(false);
    generateMatchButtons(true);

    displayQuestionType(4);
}

function displayQuestionType(question_id){
    // Iterate through and hide irrelevant questions
    for (let i = 0; i < question_type_count; i++) {
        let question_container = document.getElementById(`q-${i}`);

        if (i != question_id){
            question_container.style.display = 'none';
        }
        else{
            question_container.style.display = 'block';
        }
    }
}

document.addEventListener('keydown', event => {
    if (event.key == 'Enter' && keyboard_question_answered){        
        keyboard_question_answered = false;
        progressQuestion()
    }
});
