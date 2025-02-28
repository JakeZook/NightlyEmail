// Function to save form data to localStorage
function saveFormData() {
	const formData = new FormData(document.getElementById("report-form"));
	const data = {};

	formData.forEach((value, key) => {
		data[key] = value;
	});

	// Save to localStorage
	localStorage.setItem("reportFormData", JSON.stringify(data));
}

// Function to load form data from localStorage
function loadFormData() {
	const savedData = localStorage.getItem("reportFormData");

	if (savedData) {
		const data = JSON.parse(savedData);

		// Loop through each input field and set its value from saved data
		for (const key in data) {
			const element = document.querySelector(`[name="${key}"]`);

			if (element) {
				if (element.type === "textarea" || element.type === "text") {
					element.value = data[key];
				} else if (element.tagName === "SELECT") {
					element.value = data[key];
				}
			}
		}
	}
}
// Function to validate image size
function validateImageSize(file) {
	const MAX_SIZE = 50 * 1024; // 50 KB in bytes
	return file.size <= MAX_SIZE;
}

// Function to resize the image if it's larger than 50KB
function resizeImage(file, callback) {
	const MAX_SIZE = 50 * 1024; // 50 KB in bytes

	if (file.size <= MAX_SIZE) {
		callback(file); // No resizing needed
		return;
	}

	const img = new Image();
	const reader = new FileReader();

	reader.onload = function (e) {
		img.src = e.target.result;
	};

	reader.readAsDataURL(file);

	img.onload = function () {
		// Create a canvas element to resize the image
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		// Set the new size based on the image dimensions
		const width = img.width;
		const height = img.height;

		let newWidth = width;
		let newHeight = height;

		// Scale the image to reduce its size
		if (file.size > MAX_SIZE) {
			const scaleFactor = Math.sqrt(MAX_SIZE / file.size);
			newWidth = width * scaleFactor;
			newHeight = height * scaleFactor;
		}

		canvas.width = newWidth;
		canvas.height = newHeight;
		ctx.drawImage(img, 0, 0, newWidth, newHeight);

		// Convert the resized image to base64
		canvas.toBlob(
			function (blob) {
				const resizedFile = new File([blob], file.name, { type: file.type });
				callback(resizedFile); // Return the resized file
			},
			"image/jpeg",
			0.7
		); // Set the quality to 0.7 (70%)
	};
}

// Function to convert file to base64 after resizing
function convertToBase64(file, callback) {
	resizeImage(file, function (resizedFile) {
		const reader = new FileReader();

		reader.onloadend = function () {
			callback(reader.result.split(",")[1]); // Extract base64 encoded string (without data:image/jpeg;base64,)
		};

		reader.readAsDataURL(resizedFile);
	});
}

// Function to handle photo file uploads and store base64 data
function handleFileInputChange(event) {
	const fileInput = event.target;
	const file = fileInput.files[0];

	if (file) {
		convertToBase64(file, function (base64Data) {
			fileInput.dataset.base64 = base64Data; // Store base64 data in a dataset attribute
		});
	}
}

// Add event listeners for file input changes (for AM, MID, PM photos)
document
	.getElementById("am-photo")
	.addEventListener("change", handleFileInputChange);
document
	.getElementById("mid-photo")
	.addEventListener("change", handleFileInputChange);
document
	.getElementById("pm-photo")
	.addEventListener("change", handleFileInputChange);

// Function to save form data to localStorage (same as before)
function saveFormData() {
	const formData = new FormData(document.getElementById("report-form"));
	const data = {};

	formData.forEach((value, key) => {
		data[key] = value;
	});

	// Save to localStorage
	localStorage.setItem("reportFormData", JSON.stringify(data));
}

// Function to load form data from localStorage (same as before)
function loadFormData() {
	const savedData = localStorage.getItem("reportFormData");

	if (savedData) {
		const data = JSON.parse(savedData);

		// Loop through each input field and set its value from saved data
		for (const key in data) {
			const element = document.querySelector(`[name="${key}"]`);

			if (element) {
				if (element.type === "textarea" || element.type === "text") {
					element.value = data[key];
				} else if (element.tagName === "SELECT") {
					element.value = data[key];
				}
			}
		}
	}
}

// Event listener for form input to save data as it changes (same as before)
document.getElementById("report-form").addEventListener("input", saveFormData);

// Load form data when the page loads (same as before)
document.addEventListener("DOMContentLoaded", loadFormData);

// Handle form submission (send email via EmailJS or other service)
document
	.getElementById("report-form")
	.addEventListener("submit", function (event) {
		event.preventDefault();

		const formData = new FormData(this);
		const reportData = {};

		formData.forEach((value, key) => {
			reportData[key] = value;
		});

		sendReportEmail(reportData);
	});

// Function to send report email (same as before)
function sendReportEmail(reportData) {
	const currentDate = new Date();
	const formattedDate = currentDate.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const subject = `Daily Report - ${formattedDate}`;

	// Collect base64 data from file inputs (for AM, MID, PM photo fields)
	const amPhoto = document.getElementById("am-photo").dataset.base64 || "";
	const midPhoto = document.getElementById("mid-photo").dataset.base64 || "";
	const pmPhoto = document.getElementById("pm-photo").dataset.base64 || "";

	emailjs
		.send("service_ea6xww4", "template_8gr2wqn", {
			to_email: "jake.zook@playactivate.com",
			subject: subject,
			date: formattedDate,
			"am-mod": reportData["am-mod"],
			"am-general": reportData["am-general"],
			"am-customer": reportData["am-customer"],
			"am-maintenance": reportData["am-maintenance"],
			"am-shoutouts": reportData["am-shoutouts"],
			"am-photo": amPhoto, // Include the base64 image for AM
			"mid-mod": reportData["mid-mod"],
			"mid-general": reportData["mid-general"],
			"mid-customer": reportData["mid-customer"],
			"mid-maintenance": reportData["mid-maintenance"],
			"mid-shoutouts": reportData["mid-shoutouts"],
			"mid-photo": midPhoto, // Include the base64 image for MID
			"pm-mod": reportData["pm-mod"],
			"pm-general": reportData["pm-general"],
			"pm-customer": reportData["pm-customer"],
			"pm-maintenance": reportData["pm-maintenance"],
			"pm-shoutouts": reportData["pm-shoutouts"],
			"pm-photo": pmPhoto, // Include the base64 image for PM
			"open-notes": reportData["open-notes"],
		})
		.then((response) => {
			alert("Report submitted successfully!");

			// Clear the localStorage after successful submission
			localStorage.removeItem("reportFormData");

			// Optionally, reset the form fields if needed
			document.getElementById("report-form").reset();
			window.location.reload();
		})
		.catch((error) => {
			console.error("Error submitting the report:", error);
			alert("Error submitting the report: " + error.message || error);
		});
}
