<template >
      <div class="accordion" id="AIcorrectionInfo">
              <div class="accordion-item">
                <h2 class="accordion-header" id="Introduction">
                  <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseIntro"
                    aria-expanded="true" aria-controls="collapseIntro">
                    <b>How does the AI correction work ?</b>
                  </button>
                </h2>
                <div id="collapseIntro" class="accordion-collapse collapse" aria-labelledby="Introduction"
                  data-bs-parent="#AIcorrectionInfo">
                  <div class="accordion-body">
                    The AI correction needs 3 dimensions to estimate the student aswer :
                    <ul>
                      <li>Define who the student is</li>
                      <li>Define the subject and the context of the assessment</li>
                      <li>Define your correction model</li>
                    </ul> 
                    The student and the subject info must be described at the TEST level (see Test parameters). But for the active question, the question creator must define a correction prompt, here in the question editor.
                    <br>Once all elements are ready, test the AI reaction using the correction simulator in the preview. <br/> 
                    The application will send a combined prompt using all dimensions. <br/> 
                    In the preview, up here, Write a first fake student response, or put a student answer you have already collected and press submit.
                    You will have the result as a comment. If you need a score ask the AI to isolate it in a json format for example. Click on reset button and try again with a different response.
                    If the correction does not suit your expectation, use the same AI to create in collaboration the best prompt. Go to the AI chat and ask for help. 
                  </div>
                </div>
              </div>
              <div class="accordion-item">
                <h2 class="accordion-header" id="headingTwo">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                   <b> Who are your students ?</b>
                  </button>
                </h2>
                <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo"
                  data-bs-parent="#AIcorrectionInfo">
                  <div class="accordion-body">
                    The AI correction need to know who are the students and what is their level of expertise. These info are available in the test information. Please fill the test form precisly.
                    The required fieds are : Study Cycle, level, difficulty and the specific prompt (Students description(AI) prompt in the test Parameters) if you think that it is useful.  
                  </div>
                </div>
              </div>
              <div class="accordion-item">
                <h2 class="accordion-header" id="headingThree">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                    <b>What this question is about ?</b>
                  </button>
                </h2>
                <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree"
                  data-bs-parent="#AIcorrectionInfo">
                  <div class="accordion-body">
                    The AI correction will use the test info : Subject and domain and the domain Prompt definition in the test Parameters (if it is required).                   
                  </div>
                </div>
              </div>
              <div class="accordion-item">
                <h2 class="accordion-header" id="heading4">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapse4" aria-expanded="false" aria-controls="collapseThree">
                    <b style="color:blue">How to Create your correction model ? (Expectations and scales)</b>
                  </button>
                </h2>
                <div id="collapse4" class="accordion-collapse collapse show" aria-labelledby="headingThree"
                  data-bs-parent="#AIcorrectionInfo">
                  <div class="accordion-body">
                    You must describe your correction in the prompt, the analytics dimensions you need, and define a scale, giving points for specific details. 
                    You can also ask for a performance profile. Attention : the percentage value will be the results of your model.
                    A reverse strategy is possible: you define a capital of 100 points, and each mistake or missing detail will reduce the score.
                  </div>
                </div>
              </div>
            </div>
</template>
<script>
export default {
    
}
</script>
<style>
    
</style>