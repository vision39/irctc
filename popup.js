console.log("✅ popup.js is running!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM Loaded!");

    const saveButton = document.getElementById("save");
    const loadButton = document.getElementById("load");
    const clearButton = document.getElementById("clear");
    const bookButton = document.getElementById("book");

    if (!saveButton || !loadButton || !clearButton || !bookButton) {
        console.error("❌ Missing buttons! Check your HTML IDs.");
        return;
    }

    //Station Code

    const fromInput = document.getElementById("fromStation");
    const toInput = document.getElementById("toStation");
    const fromDropdown = document.getElementById("fromStationDropdown");
    const toDropdown = document.getElementById("toStationDropdown");
    let stationList = [];

    fetch(chrome.runtime.getURL("stations.json"))
        .then(response => response.json())
        .then(data => {
            stationList = data.stations || []; // Get the station array
            console.log("✅ Station data loaded:", stationList);
        })
        .catch(error => console.error("❌ Error loading station data:", error));

    function showStationSuggestions(inputField, dropdown, value) {
        console.log("🔍 Searching for:", value);
        dropdown.innerHTML = "";
        if (!value) {
            dropdown.style.display = "none";
            return;
        }

        let filteredStations = stationList.filter(station => {
            const stationName = station.stnName ? station.stnName.toLowerCase() : "";
            const stationCode = station.stnCode ? station.stnCode.toLowerCase() : "";
            return stationName.includes(value.toLowerCase()) || stationCode.includes(value.toLowerCase());
        });


        console.log("🛤 Found stations:", filteredStations);

        filteredStations.forEach(station => {
            let div = document.createElement("div");
            div.textContent = `${station.stnName} - ${station.stnCode}`;
            div.addEventListener("click", function () {
                inputField.value = `${station.stnName} - ${station.stnCode}`;
                dropdown.style.display = "none";
            });
            dropdown.appendChild(div);
        });

        dropdown.style.display = filteredStations.length > 0 ? "block" : "none";
    }

    fromInput.addEventListener("input", function () {
        showStationSuggestions(fromInput, fromDropdown, fromInput.value);
    });

    toInput.addEventListener("input", function () {
        showStationSuggestions(toInput, toDropdown, toInput.value);
    });

    document.addEventListener("click", function (event) {
        if (!fromInput.contains(event.target) && !fromDropdown.contains(event.target)) {
            fromDropdown.style.display = "none";
        }
        if (!toInput.contains(event.target) && !toDropdown.contains(event.target)) {
            toDropdown.style.display = "none";
        }
    });

    // Get Form Data
    function getFormData() {
        return {
            username: document.getElementById("username").value,
            password: document.getElementById("password").value,
            fromStation: document.getElementById("fromStation").value,
            toStation: document.getElementById("toStation").value,
            trainNumber: document.getElementById("trainNumber").value,
            trainClass: document.getElementById("trainClass").value,
            quota: document.getElementById("quota").value,
            paymentMethod: document.getElementById("payment-method").value,
            autoUpgrade: document.getElementById("auto-upgrade").checked,
            confirmBerth: document.getElementById("confirm-berth").checked,
            insurance: document.querySelector("input[name='insurance']:checked")?.id || "insurance-no",
            mobileNumber: document.getElementById("mobile-number").value,
            captcha: document.getElementById("captcha").checked,
            passengers: Array.from(document.querySelectorAll("#passengerDetails tbody tr")).map(row => ({
                name: row.children[1].querySelector("input").value,
                age: row.children[2].querySelector("input").value,
                gender: row.children[3].querySelector("select").value,
                berth: row.children[4].querySelector("select").value,
                food: row.children[5].querySelector("select").value
            }))
        };
    }

    // Set Form Data
    function setFormData(data) {
        document.getElementById("username").value = data.username || "";
        document.getElementById("password").value = data.password || "";
        document.getElementById("fromStation").value = data.fromStation || "";
        document.getElementById("toStation").value = data.toStation || "";
        document.getElementById("trainNumber").value = data.trainNumber || "";
        document.getElementById("trainClass").value = data.trainClass || "";
        document.getElementById("quota").value = data.quota || "";
        document.getElementById("payment-method").value = data.paymentMethod || "";
        document.getElementById("auto-upgrade").checked = data.autoUpgrade || false;
        document.getElementById("confirm-berth").checked = data.confirmBerth || false;
        document.getElementById("mobile-number").value = data.mobileNumber || "";
        document.getElementById("captcha").checked = data.captcha || false;

        if (data.insurance) {
            document.getElementById(data.insurance).checked = true;
        }

        const passengerRows = document.querySelectorAll("#passengerDetails tbody tr");
        data.passengers?.forEach((passenger, index) => {
            if (passengerRows[index]) {
                passengerRows[index].children[1].querySelector("input").value = passenger.name || "";
                passengerRows[index].children[2].querySelector("input").value = passenger.age || "";
                passengerRows[index].children[3].querySelector("select").value = passenger.gender || "";
                passengerRows[index].children[4].querySelector("select").value = passenger.berth || "";
                passengerRows[index].children[5].querySelector("select").value = passenger.food || "";
            }
        });
    }

    // Save Data
    saveButton.addEventListener("click", function () {
        const formData = getFormData();
        chrome.storage.local.set({ bookingDetails: formData }, function () {
            console.log("✅ Data saved:", formData);
            alert("✅ Data saved successfully!");
        });
    });

    // Load Data
    loadButton.addEventListener("click", function () {
        chrome.storage.local.get("bookingDetails", function (result) {
            if (result.bookingDetails) {
                console.log("✅ Data loaded:", result.bookingDetails);
                setFormData(result.bookingDetails);
                alert("✅ Data loaded successfully!");
            } else {
                console.warn("⚠️ No saved data found.");
                alert("⚠️ No saved data found.");
            }
        });
    });

    // Clear Data
    clearButton.addEventListener("click", function () {
        // Clear saved data from Chrome's local storage
        chrome.storage.local.remove("bookingDetails", function () {
            console.log("🗑️ Saved data cleared from storage.");
        });

        // Clear all input fields, checkboxes, and radio buttons
        document.querySelectorAll("input, select").forEach(el => {
            if (el.type === "checkbox" || el.type === "radio") {
                el.checked = false; // Uncheck checkboxes and radio buttons
            } else {
                el.value = ""; // Clear text fields, passwords, and dropdowns
            }
        });

        alert("🗑️ Form and saved data cleared!");
    });

    // Book Ticket - Autofill IRCTC
    bookButton.addEventListener("click", function () {
        console.log("📢 Book button clicked! Sending data...");

        // Get form data directly instead of relying on saved data
        const bookingDetails = getFormData();

        if (!bookingDetails.username || !bookingDetails.fromStation || !bookingDetails.toStation || !bookingDetails.trainNumber) {
            alert("⚠️ Please fill in all required fields before booking.");
            return;
        }

        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();

        // Check Tatkal booking timing
        if (bookingDetails.quota === "TQ") {
            if (bookingDetails.trainClass.startsWith("AC") && !(currentHour === 10 && currentMinute >= 0)) {
                alert("⚠️ AC Tatkal booking starts at 10:00 AM! Wait until then.");
                return;
            }
            if (bookingDetails.trainClass.startsWith("SL") && !(currentHour === 11 && currentMinute >= 0)) {
                alert("⚠️ Sleeper Tatkal booking starts at 11:00 AM! Wait until then.");
                return;
            }
        }

        // Send data to content script for autofill
        chrome.runtime.sendMessage({ action: "autofill", bookingDetails }, function (response) {
            if (chrome.runtime.lastError) {
                console.error("❌ Error sending message:", chrome.runtime.lastError);
            } else {
                console.log("✅ Message sent successfully! Response:", response);
            }
        });

        // Open IRCTC website and inject data
        chrome.tabs.query({ url: "*://www.irctc.co.in/*" }, (tabs) => {
            if (tabs.length > 0) {
                console.log("⚠ IRCTC tab already open. Switching to it...");
                chrome.tabs.update(tabs[0].id, { active: true });

                // Send autofill message to existing tab
                setTimeout(() => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "autofill", bookingDetails });
                }, 5000);
            } else {
                // Open a new IRCTC tab if none exists
                console.log("🚀 Opening new IRCTC booking page...");
                chrome.tabs.create({ url: "https://www.irctc.co.in/nget/train-search" }, function (tab) {
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tab.id, { action: "autofill", bookingDetails });
                    }, 5000);
                });
            }
        });
    });



    function autofillIRCTC(bookingDetails) {
        console.log("🔹 Autofilling IRCTC form with station codes...");

        let checkInterval = setInterval(() => {
            if (document.getElementById("userId")) {
                // Fill in username and password
                document.getElementById("userId").value = bookingDetails.username;
                document.getElementById("pwd").value = bookingDetails.password;
                document.querySelector("button[type='submit']").click();
                clearInterval(checkInterval);
                return;
            }

            if (window.location.href.includes("train-list")) {
                // Extract ONLY station codes (e.g., "NDLS" instead of "New Delhi - NDLS")
                let fromCode = bookingDetails.fromStation.split(" - ").pop().trim();
                let toCode = bookingDetails.toStation.split(" - ").pop().trim();

                let fromInput = document.getElementById("origin");
                let toInput = document.getElementById("destination");

                if (fromInput && toInput) {
                    // Inject only the station codes
                    fromInput.value = fromCode;
                    toInput.value = toCode;

                    console.log(`🚀 Injected: From [${fromCode}], To [${toCode}]`);

                    // Manually trigger input events so IRCTC dropdown appears
                    let inputEvent = new Event("input", { bubbles: true });
                    fromInput.dispatchEvent(inputEvent);
                    toInput.dispatchEvent(inputEvent);

                    // Simulate a slight delay to allow dropdown to open
                    setTimeout(() => {
                        // Simulate pressing Arrow Down and Enter to select the station
                        let keyboardEvent = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true });
                        fromInput.dispatchEvent(keyboardEvent);
                        toInput.dispatchEvent(keyboardEvent);

                        let enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
                        fromInput.dispatchEvent(enterEvent);
                        toInput.dispatchEvent(enterEvent);
                    }, 500);

                    // Submit the form after selecting stations
                    setTimeout(() => {
                        document.querySelector("button[type='submit']").click();
                    }, 1000);

                    clearInterval(checkInterval);
                }
            }
        }, 2000);
    }

});