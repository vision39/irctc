// Function to save form data to localStorage
function saveFormData() {
    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        fromStation: document.getElementById('fromStation').value,
        toStation: document.getElementById('toStation').value,
        trainNumber: document.getElementById('trainNumber').value,
        trainClass: document.getElementById('trainClass').value,
        quota: document.getElementById('quota').value,
        mobileNumber: document.getElementById('mobile-number').value,
        autoUpgrade: document.getElementById('auto-upgrade').checked,
        confirmBerth: document.getElementById('confirm-berth').checked,
        captcha: document.getElementById('captcha').checked,
        insurance: document.querySelector('input[name="insurance"]:checked') ? document.querySelector('input[name="insurance"]:checked').id : '',
        paymentMethod: document.getElementById('payment-method').value,
        passengers: []
    };

    // Save passenger details
    const passengerRows = document.querySelectorAll('#passengerDetails tbody tr');
    passengerRows.forEach(row => {
        const passenger = {
            name: row.querySelector('input[placeholder="Name"]').value,
            age: row.querySelector('input[placeholder="Age"]').value,
            gender: row.querySelector('select').value,
            berth: row.querySelector('select:nth-of-type(2)').value,
            food: row.querySelector('select:nth-of-type(3)').value
        };
        formData.passengers.push(passenger);
    });

    localStorage.setItem('formData', JSON.stringify(formData));
}

// Function to load form data from localStorage
function loadFormData() {
    const formData = JSON.parse(localStorage.getItem('formData'));
    if (formData) {
        document.getElementById('username').value = formData.username;
        document.getElementById('password').value = formData.password;
        document.getElementById('fromStation').value = formData.fromStation;
        document.getElementById('toStation').value = formData.toStation;
        document.getElementById('trainNumber').value = formData.trainNumber;
        document.getElementById('trainClass').value = formData.trainClass;
        document.getElementById('quota').value = formData.quota;
        document.getElementById('mobile-number').value = formData.mobileNumber;
        document.getElementById('auto-upgrade').checked = formData.autoUpgrade;
        document.getElementById('confirm-berth').checked = formData.confirmBerth;
        document.getElementById('captcha').checked = formData.captcha;
        if (formData.insurance) {
            document.getElementById(formData.insurance).checked = true;
        }
        document.getElementById('payment-method').value = formData.paymentMethod;

        // Load passenger details
        const passengerRows = document.querySelectorAll('#passengerDetails tbody tr');
        passengerRows.forEach((row, index) => {
            if (formData.passengers[index]) {
                row.querySelector('input[placeholder="Name"]').value = formData.passengers[index].name;
                row.querySelector('input[placeholder="Age"]').value = formData.passengers[index].age;
                row.querySelector('select').value = formData.passengers[index].gender;
                row.querySelector('select:nth-of-type(2)').value = formData.passengers[index].berth;
                row.querySelector('select:nth-of-type(3)').value = formData.passengers[index].food;
            }
        });
    }
}

// Function to clear form data
function clearFormData() {
    localStorage.removeItem('formData');
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
}

// Event listeners
document.getElementById('save-btn').addEventListener('click', saveFormData);
document.getElementById('load-btn').addEventListener('click', loadFormData);
document.getElementById('clear-btn').addEventListener('click', clearFormData);

// Load form data on page load
window.addEventListener('load', loadFormData);