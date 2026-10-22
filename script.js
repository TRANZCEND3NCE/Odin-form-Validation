
const fields = document.querySelectorAll("#email, #country, #zip, #password, #confirm-password");

const countryInput= document.querySelector("#country");
const zipInput = document.querySelector("#zip");

const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirm-password");

const form = document.querySelector("#signup-form");
const formStatus = document.querySelector("#form-status");

const requiredMessages = {
	email: "Please enter your email address.",
	country: "Please select a country.",
	zip: "Please enter a ZIP / postal code",
	password: "Please enter your password.", "confirm-password": "Please confirm your password."
};

const postalRules = {
	US: {
		regex: /^\d{5}(-\d{4})?$/,
		example: "33578 or 33578-1234"
	},

	CA: {
		regex: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i,
		example: "K1A 0B1"
	},

	GB: {
		regex: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
		example: "SW1A 1AA"
	}
};

function updatePostalValidity() {
	const country = countryInput.value;
	const postalCode = zipInput.value.trim();

	zipInput.setCustomValidity("");

	if (postalCode === "") {
		if (zipInput.value !== "") {
			zipInput.setCustomValidity(
				"Please enter a Zip / postal code."
			);
		}
		return;
	}

	if (country === "") {
		zipInput.setCustomValidity(
			"Please select a country first."
		);
		return;
	}

	const rule = postalRules[country];

	if (!rule) {
		zipInput.setCustomValidity("Postal code validation is not available for this country.");
		return;
	}

	if (!rule.regex.test(postalCode)) {
		zipInput.setCustomValidity(`Enter a valid postal code (e.g., ${rule.example}).`);
	}
}

function updateConfirmPasswordValidity() {
	const password = passwordInput.value;
	const confirmPassword = confirmPasswordInput.value;

	confirmPasswordInput.setCustomValidity("");

	if (confirmPassword === "") {
		return;
	}

	if (password !== confirmPassword) {
		confirmPasswordInput.setCustomValidity("Passwords do not match.");
	}
}

function displayFieldFeedback(field, isValid) {
	const errorElement = document.querySelector(`#${field.id}-error`);

	if (isValid) {
		field.removeAttribute("aria-invalid");
	} else {
		field.setAttribute("aria-invalid", "true");
	}

	if (!errorElement) {
		console.warn(`Missing error element: #${field.id}-error`);
		return;
	}

	if (isValid) {
		errorElement.textContent = "";
		return;
	}

	if (field.validity.valueMissing) {
		errorElement.textContent = requiredMessages[field.id] ?? "This field is required.";
	} else if (field.validity.typeMismatch) {
		errorElement.textContent = "Please enter a valid email address.";
	} else if (field.validity.tooShort) {
		errorElement.textContent = `Please use at least ${field.minLength} characters.`;
	} else if (field.validity.customError) {
		errorElement.textContent = field.validationMessage;
	} else {
		errorElement.textContent = "Please check this field.";
	}

	field.setAttribute("aria-invalid", "true");
}

function validateField(field) {
	field.dataset.validated = "true";

	if (field === zipInput) {
		updatePostalValidity();
	}

	if (field === confirmPasswordInput) {
		updateConfirmPasswordValidity();
	}

	const isValid = field.checkValidity();

	displayFieldFeedback(field, isValid);

	return isValid;
}

form.addEventListener("focusout", (e) =>{
	const field = e.target;

	if (field.matches("input, select")) {
		validateField(field);
	}
});

countryInput.addEventListener("change", () => {
	validateField(countryInput);

	if (zipInput.value !== "") {
		validateField(zipInput);
	}
});

passwordInput.addEventListener("input", () => {
	if (confirmPasswordInput.value !== "") {
		validateField(confirmPasswordInput);
	}
});

form.addEventListener("submit", (e) => {
	e.preventDefault();

	const validationResults = Array.from(fields).map((field) => {
		return validateField(field);
	});

	const isFormValid = validationResults.every((result) => {
		return result === true;
	});

	if (isFormValid) {
		formStatus.textContent = "All fields passed validation!";
		formStatus.dataset.state = "success";
	} else {
		formStatus.textContent = "Please correct the errors in the form."
		formStatus.dataset.state = "error";

		const firstInvalidIndex = validationResults.indexOf(false);

		if (firstInvalidIndex !== -1) {
			fields[firstInvalidIndex].focus();
		}
	}
});

form.addEventListener("input", (e) => {
	formStatus.textContent = "";
	delete formStatus.dataset.state;

	const field = e.target;

	if (field.matches("input, select") && field.dataset.validated === "true") {
		validateField(field);
	}
});