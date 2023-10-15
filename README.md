# RayReader

RayReader is an online website to train aspiring medical students and staff in basic radiography. The website will follow a Duolingo-style learning format, with bite-sized questions that draw from a large pool of X-ray images. 

### Content

The website currently contains quizzes in
- Pneumonia
- Covid-19
- Tuberculosis

### Developed by

- Ian Chan
- Colin Chan
- Wan Hei Kong
- Nathan Li

## For Developers

RayReader levels use the `level-plan.json` file to access from a specified range of question options. The file specifies what types of images will appear, and what question types the images will be presented in. The question types presented are based on their ID.

| Question Type | Question Description |
| - | - |
| 0 | level complete screen |
| 1 | true or false question |
| 2 | select the image with `image_type` |
| 3 | identify the condition based on the image |
| 4 | match the condition to the image |
