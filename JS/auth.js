function showNotification(message, callback) {

    let notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'));
    document.getElementById('notificationMessage').textContent = message;
    let modalElement = document.getElementById('notificationModal');
    modalElement.addEventListener('hidden.bs.modal', function handler() {
        modalElement.removeEventListener('hidden.bs.modal', handler);
        if (callback) callback();
    });

    notificationModal.show();
}
document.addEventListener("DOMContentLoaded", function () {
    let registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            let firstName = document.getElementById("firstName");
            let lastName = document.getElementById("lastName");
            let email = document.getElementById("email");
            let password = document.getElementById("password");
            let confirmPassword = document.getElementById("confirmPassword");
            let firstNameFeedback = document.querySelector("#firstName + .invalid-feedback");
            let lastNameFeedback = document.querySelector("#lastName + .invalid-feedback");
            let emailFeedback = document.querySelector("#email + .invalid-feedback");
            let passwordFeedback = document.querySelector("#password + .invalid-feedback");
            let confirmPasswordFeedback = document.querySelector("#confirmPassword + .invalid-feedback");

            let isValid = true;

            let users = JSON.parse(localStorage.getItem("users")) || [];

            if (!firstName.value.trim()) {
                firstName.classList.add("is-invalid");
                firstNameFeedback.textContent = "Please provide a valid first name.";
                firstNameFeedback.classList.remove("hidden");
                isValid = false;
            } else {
                firstName.classList.remove("is-invalid");
                firstNameFeedback.classList.add("hidden");
            }

            if (!lastName.value.trim()) {
                lastName.classList.add("is-invalid");
                lastNameFeedback.textContent = "Please provide a valid last name.";
                lastNameFeedback.classList.remove("hidden");
                isValid = false;
            } else {
                lastName.classList.remove("is-invalid");
                lastNameFeedback.classList.add("hidden");
            }

            let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            let isEmailUnique = !users.some(user => user.email === email.value.trim());
            if (!email.value.trim()) {
                email.classList.add("is-invalid");
                emailFeedback.textContent = "Please provide a valid email address.";
                emailFeedback.classList.remove("hidden");
                isValid = false;
            } else if (!emailRegex.test(email.value.trim())) {
                email.classList.add("is-invalid");
                emailFeedback.textContent = "Invalid email format.";
                emailFeedback.classList.remove("hidden");
                isValid = false;
            } else if (!isEmailUnique) {
                email.classList.add("is-invalid");
                emailFeedback.textContent = "This email is already registered.";
                emailFeedback.classList.remove("hidden");
                isValid = false;
            } else {
                email.classList.remove("is-invalid");
                emailFeedback.classList.add("hidden");
            }

            if (!password.value.trim()) {
                password.classList.add("is-invalid");
                passwordFeedback.textContent = "Password cannot be empty.";
                passwordFeedback.classList.remove("hidden");
                isValid = false;
            } else if (password.value.length < 8) {
                password.classList.add("is-invalid");
                passwordFeedback.textContent = "Password must be at least 8 characters long.";
                passwordFeedback.classList.remove("hidden");
                isValid = false;
            } else if (!/[A-Z]/.test(password.value)) {
                password.classList.add("is-invalid");
                passwordFeedback.textContent = "Password must contain at least one uppercase letter.";
                passwordFeedback.classList.remove("hidden");
                isValid = false;
            } else if (!/[a-z]/.test(password.value)) {
                password.classList.add("is-invalid");
                passwordFeedback.textContent = "Password must contain at least one lowercase letter.";
                passwordFeedback.classList.remove("hidden");
                isValid = false;
            } else if (!/[0-9]/.test(password.value)) {
                password.classList.add("is-invalid");
                passwordFeedback.textContent = "Password must contain at least one number.";
                passwordFeedback.classList.remove("hidden");
                isValid = false;
            } else {
                password.classList.remove("is-invalid");
                passwordFeedback.classList.add("hidden");
            }

            if (!confirmPassword.value.trim()) {
                confirmPassword.classList.add("is-invalid");
                confirmPasswordFeedback.textContent = "Confirm Password cannot be empty.";
                confirmPasswordFeedback.classList.remove("hidden");
                isValid = false;
            } else if (confirmPassword.value !== password.value) {
                confirmPassword.classList.add("is-invalid");
                confirmPasswordFeedback.textContent = "Passwords do not match.";
                confirmPasswordFeedback.classList.remove("hidden");
                isValid = false;
            } else {
                confirmPassword.classList.remove("is-invalid");
                confirmPasswordFeedback.classList.add("hidden");
            }

            if (!isValid) return;

            users.push({
                firstName: firstName.value.trim(),
                lastName: lastName.value.trim(),
                email: email.value.trim(),
                password: password.value,
            });
            localStorage.setItem("users", JSON.stringify(users));
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Register completed!",
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.href = "login.html"; // Mở link nếu muốn
            });
        });
    }

    let loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            let emailInput = document.getElementById("loginEmail");
            let passwordInput = document.getElementById("loginPassword");
            let emailFeedback = document.querySelector("#loginEmail + .invalid-feedback");
            let passwordFeedback = document.querySelector("#loginPassword + .invalid-feedback");
            let email = emailInput.value.trim();
            let password = passwordInput.value.trim();
            let isValid = true;
            let users = JSON.parse(localStorage.getItem("users")) || [];
            let user = users.find(user => user.email === email);
            if (!email) {
                emailInput.classList.add("is-invalid");
                emailFeedback.textContent = "Email cannot be empty.";
                emailFeedback.classList.remove("hidden");
                isValid = false;
            } else if (!user) {
                emailInput.classList.add("is-invalid");
                emailFeedback.textContent = "Invalid email or password.";
                emailFeedback.classList.remove("hidden");
                isValid = false;
            } else {
                emailInput.classList.remove("is-invalid");
                emailFeedback.classList.add("hidden");
            }

            if (!password) {
                passwordInput.classList.add("is-invalid");
                passwordFeedback.textContent = "Password cannot be empty.";
                passwordFeedback.classList.remove("hidden");
                isValid = false;
            } else if (!user || (user && user.password !== password)) {
                passwordInput.classList.add("is-invalid");
                passwordFeedback.textContent = "Invalid email or password.";
                passwordFeedback.classList.remove("hidden");
                isValid = false;
            } else {
                passwordInput.classList.remove("is-invalid");
                passwordFeedback.classList.add("hidden");
            }

            if (!isValid) return;

            localStorage.setItem('currentUser', JSON.stringify(user));
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Login completed!",
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.href = "app.html"; // Mở link nếu muốn
            });
        });
    }
});
