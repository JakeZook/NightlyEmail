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

// Event listener for form input to save data as it changes
document.getElementById("report-form").addEventListener("input", saveFormData);

// Load form data when the page loads
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
