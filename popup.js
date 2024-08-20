document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get(['backgroundColor', 'textColor', 'fontFamily', 'removeElements'], function(items) {
    document.getElementById('background-color').value = items.backgroundColor || '#ffffff';
    document.getElementById('text-color').value = items.textColor || '#000000';
    document.getElementById('font-family').value = items.fontFamily || 'Arial';
    
    // Populate remove elements list
    const removeList = document.getElementById('remove-list');
    (items.removeElements || []).forEach(function(selector) {
      const li = document.createElement('li');
      li.textContent = selector;
      removeList.appendChild(li);
    });
  });

  // Save settings when "Apply Changes" is clicked
  document.getElementById('apply-changes').addEventListener('click', function() {
    const backgroundColor = document.getElementById('background-color').value;
    const textColor = document.getElementById('text-color').value;
    const fontFamily = document.getElementById('font-family').value;
    const removeElements = Array.from(document.getElementById('remove-list').children).map(li => li.textContent);

    chrome.storage.sync.set({
      backgroundColor: backgroundColor,
      textColor: textColor,
      fontFamily: fontFamily,
      removeElements: removeElements
    }, function() {
      // Notify content script to apply changes
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "applyChanges"});
      });
    });
  });

  // Add new element to remove list
  document.getElementById('add-remove-element').addEventListener('click', function() {
    const selector = document.getElementById('remove-element').value;
    if (selector) {
      const li = document.createElement('li');
      li.textContent = selector;
      document.getElementById('remove-list').appendChild(li);
      document.getElementById('remove-element').value = '';
    }
  });
});

Content.js

function applyChanges() {
  chrome.storage.sync.get(['backgroundColor', 'textColor', 'fontFamily', 'removeElements'], function(items) {
    // Apply color scheme
    document.body.style.backgroundColor = items.backgroundColor || '#ffffff';
    document.body.style.color = items.textColor || '#000000';
    
    // Apply font
    document.body.style.fontFamily = items.fontFamily || 'Arial';
    
    // Remove elements
    (items.removeElements || []).forEach(function(selector) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(function(element) {
        element.style.display = 'none';
      });
    });
  });
}

// Apply changes when the content script is first injected
applyChanges();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "applyChanges") {
    applyChanges();
  }
});

