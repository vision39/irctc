function simulateTyping(element, text) {
    if (!element) return;

    element.focus(); // Ensure the field is focused
    element.value = ""; // Clear existing value

    for (let char of text) {
        let keydownEvent = new KeyboardEvent("keydown", { key: char, bubbles: true });
        let inputEvent = new Event("input", { bubbles: true });
        let changeEvent = new Event("change", { bubbles: true });

        element.value += char;
        element.dispatchEvent(keydownEvent);
        element.dispatchEvent(inputEvent);
        element.dispatchEvent(changeEvent);
    }

    console.log(`✅ Simulated typing: ${text}`);

    

    // Simulate pressing "Enter" to select from IRCTC dropdown
    setTimeout(() => {
        let enterEvent = new KeyboardEvent("keydown", {
            key: "Enter",
            keyCode: 13,
            bubbles: true
        });
        element.dispatchEvent(enterEvent);
        console.log("⏎ Pressed Enter to confirm station selection");
    }, 2000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "autofill") {
        console.log("📩 Message received in content.js:", message);
        const bookingDetails = message.bookingDetails;

        let checkInterval = setInterval(() => {
            console.log("🔍 Checking IRCTC page...");

            let usernameField = document.getElementById("userId");
            let passwordField = document.getElementById("pwd");

            // ✅ LOGIN PAGE
            if (usernameField && passwordField) {
                console.log("🔹 Login page detected!");

                chrome.storage.sync.get(["username", "password"], (data) => {
                    if (data.username && data.password) {
                        console.log("🔹 Autofilling username and password...");

                        simulateTyping(usernameField, data.username);
                        simulateTyping(passwordField, data.password);

                        setTimeout(() => {
                            let loginButton = document.querySelector("button[type='submit']");
                            if (loginButton) {
                                console.log("🚀 Clicking Login button!");
                                loginButton.click();
                            } else {
                                console.warn("⚠ Login button not found!");
                            }
                        }, 1000);
                    } else {
                        console.warn("⚠ No saved credentials found in storage.");
                    }
                });

                clearInterval(checkInterval);
                return;
            }

            // ✅ TRAIN SEARCH PAGE
            if (window.location.href.includes("train-search")) {
                let searchFields = document.querySelectorAll("input[aria-autocomplete='list'][role='searchbox']");

                if (searchFields.length >= 2) {
                    let fromField = searchFields[0];
                    let toField = searchFields[1];

                    console.log("🔹 Filling train search details...");

                    // Extract only station codes (e.g., "NDLS" from "New Delhi - NDLS")
                    let fromCode = bookingDetails.fromStation.split(" - ")[1];
                    let toCode = bookingDetails.toStation.split(" - ")[1];

                    if (fromField.disabled) {
                        console.warn("⚠ 'From' field is disabled! Trying to enable it...");
                        fromField.removeAttribute("disabled");
                    }
                    if (toField.disabled) {
                        console.warn("⚠ 'To' field is disabled! Trying to enable it...");
                        toField.removeAttribute("disabled");
                    }

                    fromField.click(); // Click to trigger dropdown
                    simulateTyping(fromField, fromCode);

                    setTimeout(() => {
                        toField.click(); // Click before typing in "To" field
                        simulateTyping(toField, toCode);
                    }, 500);

                    

                    setTimeout(() => {
                        let searchButton = document.querySelector("button[type='submit']");
                        if (searchButton) {
                            console.log("🚀 Clicking Search button!");
                            searchButton.click();
                        } else {
                            console.warn("⚠ Search button not found!");
                        }
                    }, 1000);

                    clearInterval(checkInterval);
                    return;
                } else {
                    console.warn("⚠ Train station fields missing. Retrying...");
                }
            }
        }, 1000);
    }
});
