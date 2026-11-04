/* =================================
   NEXOLY11 - MAIN APP SYSTEM
   Version 1.0
================================= */

"use strict";

const Nexoly11 = {

    name: "NEXOLY11",
    version: "1.0",

    // Select HTML elements
    select(selector) {
        return document.querySelector(selector);
    },

    selectAll(selector) {
        return document.querySelectorAll(selector);
    },

    // Show notification
    notify(message) {
        let box = document.createElement("div");

        box.textContent = message;

        box.style.cssText = `
            position:fixed;
            bottom:25px;
            left:50%;
            transform:translateX(-50%);
            background:#222;
            color:white;
            padding:14px 22px;
            border-radius:12px;
            z-index:99999;
            font-size:14px;
        `;

        document.body.appendChild(box);

        setTimeout(() => {
            box.remove();
        }, 3000);
    },

    // Safe local storage
    save(key, value) {
        try {
            localStorage.setItem(
                "nexoly11_" + key,
                JSON.stringify(value)
            );
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    get(key) {
        try {
            const value = localStorage.getItem(
                "nexoly11_" + key
            );

            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    // Remove saved data
    remove(key) {
        localStorage.removeItem("nexoly11_" + key);
    },

    // App initialization
    init() {
        console.log("NEXOLY11 App Started");

        document.documentElement.setAttribute(
            "data-app",
            "nexoly11"
        );
    }
};

// Start application
document.addEventListener("DOMContentLoaded", function() {
    Nexoly11.init();
});

// Global access
window.Nexoly11 = Nexoly11;
