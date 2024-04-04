const handleInput = (inputNumber) =>{
  const currentInput = document.querySelector(`.rectangle-parent7 input:nth-child(${inputNumber})`)

  const nextInput = document.querySelector(`.rectangle-parent7 input:nth-child(${inputNumber + 1})`)

  if(currentInput.value.length == 1 && nextInput){
    nextInput.disabled = false;
    nextInput.focus()
  }

  const allInputsFilled = Array.from(document.querySelectorAll('.rectangle-parent7 input')).every(input=>input.value.length === 1);

  const verifyBtn = document.querySelector('.submitButton')

  verifyBtn.disabled = !allInputsFilled
}

const handleBackSpace = (inputNumber, event)=>{
  if(event.key==="Backspace"){
      const currentInput = document.querySelector(`.rectangle-parent7 input:nth-child(${inputNumber})`)
    
      const prevInput = document.querySelector(`.rectangle-parent7 input:nth-child(${inputNumber - 1})`)

      if(currentInput.value.length == 0 && prevInput){
        currentInput.disabled = true
        currentInput.value = ""
        prevInput.focus()
      }
      const allInputsFilled = Array.from(document.querySelectorAll('.rectangle-parent7 input')).every(input=>input.value.length === 1);
      const verifyBtn = document.querySelector('.submitButton')

      verifyBtn.disabled = !allInputsFilled
  }
}

const numericInputs = document.querySelectorAll('input[type="text"]');

numericInputs.forEach((inputs)=>{
  inputs.addEventListener('keypress', function() {
    this.value = this.value.replace(/[^0-9]/g, '').trim();
  });
})