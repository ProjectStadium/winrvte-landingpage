document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const earlyAccessBtn = document.getElementById('earlyAccessBtn');
    const modalOverlay = document.getElementById('earlyAccessModal');
    const modalClose = document.getElementById('modalClose');
    const earlyAccessForm = document.getElementById('earlyAccessForm');
    const formSuccess = document.getElementById('formSuccess');
    const formSuccessMessage = document.getElementById('formSuccessMessage');
    const formErrorMessage = document.getElementById('formErrorMessage');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    
    // Open modal when CTA button is clicked
    earlyAccessBtn.addEventListener('click', function() {
        modalOverlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
    
    // Close modal when X button is clicked
    modalClose.addEventListener('click', function() {
        modalOverlay.classList.remove('show');
        document.body.style.overflow = 'auto'; // Allow scrolling
        resetForm();
    });
    
    // Close modal when clicking outside the modal
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('show');
            document.body.style.overflow = 'auto'; // Allow scrolling
            resetForm();
        }
    });
    
    // Close success message and modal
    closeSuccessBtn.addEventListener('click', function() {
        modalOverlay.classList.remove('show');
        document.body.style.overflow = 'auto'; // Allow scrolling
        resetForm();
    });
    
    // Handle form submission
    earlyAccessForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Hide any previous error messages
        formErrorMessage.style.display = 'none';
        
        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Processing...';
        submitButton.disabled = true;
        
        // Get form data
        const formData = new FormData(earlyAccessForm);
        const formDataObj = Object.fromEntries(formData.entries());
        
        // Get multiple selections for interests (checkboxes)
        formDataObj.interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
            .map(checkbox => checkbox.value)
            .join(', ');
        
        // Send to Netlify function
        fetch('/.netlify/functions/notion-submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObj)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                earlyAccessForm.style.display = 'none';
                formSuccess.style.display = 'block';
            } else {
                // Show error message
                formErrorMessage.textContent = data.error || 'There was an error submitting your request. Please try again.';
                formErrorMessage.style.display = 'block';
                
                // Reset button
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        })
        .catch(error => {
            // Show connection error
            formErrorMessage.textContent = 'Network error. Please check your connection and try again.';
            formErrorMessage.style.display = 'block';
            
            // Reset button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
    });
    
    // Reset form and hide success/error messages
    function resetForm() {
        earlyAccessForm.reset();
        earlyAccessForm.style.display = 'block';
        formSuccess.style.display = 'none';
        formSuccessMessage.style.display = 'none';
        formErrorMessage.style.display = 'none';
    }
});