document.addEventListener("DOMContentLoaded", async () => {
  // DOM elements
  const darkModeToggle = document.getElementById("darkModeToggle");
  const syncToggle = document.getElementById("syncToggle");
  const addRuleBtn = document.getElementById("addRuleBtn");
  const exportRulesBtn = document.getElementById("exportRulesBtn");
  const importRulesBtn = document.getElementById("importRulesBtn");
  const importFileInput = document.getElementById("importFileInput");
  const ruleEditor = document.getElementById("ruleEditor");
  const ruleForm = document.getElementById("ruleForm");
  const editorTitle = document.getElementById("editorTitle");
  const ruleIdInput = document.getElementById("ruleId");
  const descriptionInput = document.getElementById("description");
  const patternTypeSelect = document.getElementById("patternType");
  const appliesToSelect = document.getElementById("appliesTo");
  const includePatternInput = document.getElementById("includePattern");
  const redirectToInput = document.getElementById("redirectTo");
  const exampleUrlInput = document.getElementById("exampleUrl");
  const previewResult = document.getElementById("previewResult");
  const testPreviewBtn = document.getElementById("testPreviewBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const rulesContainer = document.getElementById("rulesContainer");
  const emptyRulesMessage = document.getElementById("emptyRulesMessage");

  let rules = [];
  let isEditing = false;
  let useSync = false;

  // Load settings and rules
  async function loadSettings() {
    const data = await chrome.storage.local.get([
      "darkMode",
      "useSync",
      "rules",
    ]);

    // Apply dark mode if enabled
    if (data.darkMode) {
      document.body.classList.add("dark-mode");
      darkModeToggle.checked = true;
    }

    // Set sync toggle
    useSync = data.useSync || false;
    syncToggle.checked = useSync;

    // Load rules from appropriate storage
    if (useSync) {
      try {
        const syncData = await chrome.storage.sync.get(["rules"]);
        rules = syncData.rules || [];
      } catch (error) {
        console.error("Error loading rules from sync storage:", error);
        rules = data.rules || [];
      }
    } else {
      rules = data.rules || [];
    }

    displayRules();
  }

  // Helper function to convert wildcard to regex
  function wildcardToRegExp(wildcard) {
    const escaped = wildcard.replace(/[-[\]{}()+.,\\^$|#]/g, "\\$&");
    const converted = escaped.replace(/\*/g, ".*");
    const final = converted.replace(/\?/g, ".");
    return new RegExp("^" + final + "$");
  }

  // Preview redirect result
  function previewRedirect() {
    const exampleUrl = exampleUrlInput.value.trim();
    const includePattern = includePatternInput.value.trim();
    const redirectTo = redirectToInput.value.trim();
    const patternType = patternTypeSelect.value;

    if (!exampleUrl || !includePattern || !redirectTo) {
      previewResult.textContent = "Please fill all fields";
      return;
    }

    try {
      let pattern;
      if (patternType === "Wildcard") {
        pattern = wildcardToRegExp(includePattern);
      } else {
        pattern = new RegExp(includePattern);
      }

      const match = exampleUrl.match(pattern);
      if (match) {
        let result = redirectTo;
        if (match.length > 1) {
          for (let i = 1; i < match.length; i++) {
            const placeholder = `$${i}`;
            result = result.replace(
              new RegExp("\\" + placeholder, "g"),
              match[i] || ""
            );
          }
        }
        previewResult.textContent = result;
        previewResult.style.color = "var(--success-color)";
      } else {
        previewResult.textContent = "Pattern does not match example URL";
        previewResult.style.color = "var(--error-color)";
      }
    } catch (error) {
      previewResult.textContent = `Error: ${error.message}`;
      previewResult.style.color = "var(--error-color)";
    }
  }

  // Display all rules in the list
  function displayRules() {
    rulesContainer.innerHTML = "";

    if (rules.length === 0) {
      emptyRulesMessage.classList.remove("hidden");
      return;
    }

    emptyRulesMessage.classList.add("hidden");

    rules.forEach((rule, index) => {
      const ruleItem = document.createElement("div");
      ruleItem.className = "rule-item";

      // Status toggle
      const statusDiv = document.createElement("div");
      statusDiv.className = "rule-status";
      const toggleLabel = document.createElement("label");
      toggleLabel.className = "toggle-switch";
      const toggleInput = document.createElement("input");
      toggleInput.type = "checkbox";
      toggleInput.checked = rule.enabled;
      toggleInput.addEventListener("change", () => {
        toggleRuleStatus(index);
      });
      const toggleSlider = document.createElement("span");
      toggleSlider.className = "toggle-slider";
      toggleLabel.appendChild(toggleInput);
      toggleLabel.appendChild(toggleSlider);
      statusDiv.appendChild(toggleLabel);

      // Description
      const descriptionDiv = document.createElement("div");
      descriptionDiv.className = "rule-description";
      descriptionDiv.textContent = rule.description;

      // Pattern
      const patternDiv = document.createElement("div");
      patternDiv.className = "rule-pattern";
      patternDiv.textContent = rule.includePattern;
      const patternTypeSpan = document.createElement("span");
      patternTypeSpan.className = "pattern-type";
      patternTypeSpan.textContent = ` (${rule.patternType})`;
      patternDiv.appendChild(patternTypeSpan);

      // Redirect
      const redirectDiv = document.createElement("div");
      redirectDiv.className = "rule-redirect";
      redirectDiv.textContent = rule.redirectTo;

      // Actions
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "rule-actions";

      // Move up button
      if (index > 0) {
        const moveUpBtn = document.createElement("button");
        moveUpBtn.innerHTML = "&#8593;";
        moveUpBtn.title = "Move Up";
        moveUpBtn.addEventListener("click", () => {
          moveRule(index, -1);
        });
        actionsDiv.appendChild(moveUpBtn);
      }

      // Move down button
      if (index < rules.length - 1) {
        const moveDownBtn = document.createElement("button");
        moveDownBtn.innerHTML = "&#8595;";
        moveDownBtn.title = "Move Down";
        moveDownBtn.addEventListener("click", () => {
          moveRule(index, 1);
        });
        actionsDiv.appendChild(moveDownBtn);
      }

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.innerHTML = "&#9998;";
      editBtn.title = "Edit";
      editBtn.addEventListener("click", () => {
        editRule(index);
      });
      actionsDiv.appendChild(editBtn);

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "&#128465;";
      deleteBtn.title = "Delete";
      deleteBtn.className = "delete";
      deleteBtn.addEventListener("click", () => {
        deleteRule(index);
      });
      actionsDiv.appendChild(deleteBtn);

      // Append all elements to rule item
      ruleItem.appendChild(statusDiv);
      ruleItem.appendChild(descriptionDiv);
      ruleItem.appendChild(patternDiv);
      ruleItem.appendChild(redirectDiv);
      ruleItem.appendChild(actionsDiv);

      rulesContainer.appendChild(ruleItem);
    });
  }

  // Toggle rule enabled status
  async function toggleRuleStatus(index) {
    rules[index].enabled = !rules[index].enabled;
    await saveRules();
    displayRules();
  }

  // Move rule up or down in priority
  async function moveRule(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < rules.length) {
      const temp = rules[index];
      rules[index] = rules[newIndex];
      rules[newIndex] = temp;
      await saveRules();
      displayRules();
    }
  }

  // Edit existing rule
  function editRule(index) {
    const rule = rules[index];
    isEditing = true;

    ruleIdInput.value = rule.id;
    descriptionInput.value = rule.description;
    patternTypeSelect.value = rule.patternType;
    appliesToSelect.value = rule.appliesTo;
    includePatternInput.value = rule.includePattern;
    redirectToInput.value = rule.redirectTo;
    exampleUrlInput.value = rule.exampleUrl || "";

    editorTitle.textContent = "Edit Rule";
    ruleEditor.classList.remove("hidden");

    // Scroll to editor
    ruleEditor.scrollIntoView({ behavior: "smooth" });

    // Preview the result
    previewRedirect();
  }

  // Delete rule
  async function deleteRule(index) {
    if (confirm("Are you sure you want to delete this rule?")) {
      rules.splice(index, 1);
      await saveRules();
      displayRules();
    }
  }

  // Save rules to storage
  async function saveRules() {
    // Always save to local storage
    await chrome.storage.local.set({ rules });

    // If sync is enabled, also save to sync storage
    if (useSync) {
      try {
        await chrome.storage.sync.set({ rules });
      } catch (error) {
        console.error("Error saving to sync storage:", error);
        alert(
          "Failed to save to sync storage. Your rules are saved locally only."
        );
      }
    }
  }

  // Export rules to JSON file
  function exportRules() {
    const rulesJson = JSON.stringify(rules, null, 2);
    const blob = new Blob([rulesJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "reroute_rules.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import rules from JSON file
  function importRules(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedRules = JSON.parse(e.target.result);

        if (Array.isArray(importedRules)) {
          // Validate each rule has required fields
          const validRules = importedRules.filter(
            (rule) =>
              rule.description &&
              rule.includePattern &&
              rule.redirectTo &&
              rule.patternType
          );

          if (validRules.length === 0) {
            alert("No valid rules found in the imported file.");
            return;
          }

          // Add missing fields if necessary
          validRules.forEach((rule) => {
            if (!rule.id)
              rule.id = Date.now() + Math.random().toString(36).substr(2, 9);
            if (rule.enabled === undefined) rule.enabled = true;
            if (!rule.appliesTo) rule.appliesTo = "Main window";
          });

          if (
            confirm(
              `Import ${validRules.length} rules? This will replace your current rules.`
            )
          ) {
            rules = validRules;
            await saveRules();
            displayRules();
            alert("Rules imported successfully!");
          }
        } else {
          alert("Invalid rules format. Please import a valid JSON file.");
        }
      } catch (error) {
        alert("Error importing rules: " + error.message);
      }

      // Reset file input
      importFileInput.value = "";
    };

    reader.readAsText(file);
  }

  // Event listeners
  darkModeToggle.addEventListener("change", async () => {
    const isDarkMode = darkModeToggle.checked;
    document.body.classList.toggle("dark-mode", isDarkMode);
    await chrome.storage.local.set({ darkMode: isDarkMode });
  });

  syncToggle.addEventListener("change", async () => {
    useSync = syncToggle.checked;
    await chrome.storage.local.set({ useSync });

    if (useSync) {
      try {
        await chrome.storage.sync.set({ rules });
        alert("Rules will now be synced across your Chrome browsers.");
      } catch (error) {
        console.error("Error saving to sync storage:", error);
        alert("Failed to enable sync. Please try again.");
        syncToggle.checked = false;
        useSync = false;
        await chrome.storage.local.set({ useSync: false });
      }
    } else {
      alert("Rules will now be stored locally only.");
    }
  });

  addRuleBtn.addEventListener("click", () => {
    isEditing = false;
    ruleForm.reset();
    ruleIdInput.value = "";
    editorTitle.textContent = "Add New Rule";
    ruleEditor.classList.remove("hidden");
    previewResult.textContent = "-";
    previewResult.style.color = "";

    // Default values
    patternTypeSelect.value = "Wildcard";
    appliesToSelect.value = "Main window";

    // Scroll to editor
    ruleEditor.scrollIntoView({ behavior: "smooth" });
  });

  exportRulesBtn.addEventListener("click", exportRules);

  importRulesBtn.addEventListener("click", () => {
    importFileInput.click();
  });

  importFileInput.addEventListener("change", importRules);

  testPreviewBtn.addEventListener("click", previewRedirect);

  // Update preview when inputs change
  includePatternInput.addEventListener("input", previewRedirect);
  redirectToInput.addEventListener("input", previewRedirect);
  exampleUrlInput.addEventListener("input", previewRedirect);
  patternTypeSelect.addEventListener("change", previewRedirect);

  cancelBtn.addEventListener("click", () => {
    ruleEditor.classList.add("hidden");
  });

  ruleForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const ruleId = ruleIdInput.value || Date.now().toString();
    const description = descriptionInput.value.trim();
    const patternType = patternTypeSelect.value;
    const appliesTo = appliesToSelect.value;
    const includePattern = includePatternInput.value.trim();
    const redirectTo = redirectToInput.value.trim();
    const exampleUrl = exampleUrlInput.value.trim();

    // Validate pattern
    try {
      if (patternType === "RegExp") {
        new RegExp(includePattern);
      }
    } catch (error) {
      alert("Invalid regular expression: " + error.message);
      return;
    }

    const rule = {
      id: ruleId,
      description,
      patternType,
      appliesTo,
      includePattern,
      redirectTo,
      exampleUrl,
      enabled: true,
    };

    if (isEditing) {
      // Find and update existing rule
      const index = rules.findIndex((r) => r.id === ruleId);
      if (index !== -1) {
        rule.enabled = rules[index].enabled; // Preserve enabled state
        rules[index] = rule;
      }
    } else {
      // Add new rule
      rules.push(rule);
    }

    await saveRules();
    displayRules();
    ruleEditor.classList.add("hidden");
  });

  // Check for hash in URL to open add rule form
  if (window.location.hash === "#add") {
    addRuleBtn.click();
  }

  // Initialize
  loadSettings();
});
