document.addEventListener('DOMContentLoaded', () => {
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const devisForm = document.getElementById('devis-form');
    let currentStep = 1;

    const updateForm = () => {
        // Update form steps visibility
        formSteps.forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) === currentStep);
        });

        // Update progress bar
        progressSteps.forEach((step, index) => {
            if (index < currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    };

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep < formSteps.length) {
                currentStep++;
                updateForm();
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateForm();
            }
        });
    });

    if(devisForm) {
        devisForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real application, you would collect form data and submit it here.
            alert('Votre demande de devis a été soumise avec succès !');
        });
    }

    // Initialize the form
    updateForm();
});
