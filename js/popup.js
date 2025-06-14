document.addEventListener("DOMContentLoaded", async () => {
  // DOM elements
  const darkModeToggle = document.getElementById("darkModeToggle");
  const activeRulesCount = document.getElementById("activeRulesCount");
  const totalRulesCount = document.getElementById("totalRulesCount");
  const addRuleBtn = document.getElementById("addRuleBtn");
  const openOptionsBtn = document.getElementById("openOptionsBtn");
  const recentRedirectsList = document.getElementById("recentRedirectsList");

  // Load and apply theme
  const { darkMode } = await chrome.storage.local.get("darkMode");
  if (darkMode) {
    document.body.classList.add("dark-mode");
    darkModeToggle.checked = true;
  }

  // Toggle dark mode
  darkModeToggle.addEventListener("change", async () => {
    const isDarkMode = darkModeToggle.checked;
    document.body.classList.toggle("dark-mode", isDarkMode);
    await chrome.storage.local.set({ darkMode: isDarkMode });
  });

  // Load rules
  const { rules, useSync, recentRedirects } = await chrome.storage.local.get([
    "rules",
    "useSync",
    "recentRedirects",
  ]);

  let activeRules = rules || [];
  if (useSync) {
    try {
      const syncData = await chrome.storage.sync.get(["rules"]);
      if (syncData.rules) {
        activeRules = syncData.rules;
      }
    } catch (error) {
      console.error("Error fetching sync rules:", error);
    }
  }

  // Update rule counts
  const activeCount = activeRules.filter((rule) => rule.enabled).length;
  activeRulesCount.textContent = activeCount;
  totalRulesCount.textContent = activeRules.length;

  // Display recent redirects
  if (recentRedirects && recentRedirects.length > 0) {
    recentRedirectsList.innerHTML = "";

    recentRedirects.slice(0, 5).forEach((redirect) => {
      const redirectItem = document.createElement("div");
      redirectItem.className = "redirect-item";

      const fromUrl = document.createElement("div");
      fromUrl.className = "from-url";
      fromUrl.textContent = redirect.from;

      const toUrl = document.createElement("div");
      toUrl.className = "to-url";
      toUrl.textContent = redirect.to;

      const timestamp = document.createElement("div");
      timestamp.className = "timestamp";
      timestamp.textContent = new Date(redirect.timestamp).toLocaleTimeString();

      redirectItem.appendChild(fromUrl);
      redirectItem.appendChild(toUrl);
      redirectItem.appendChild(timestamp);

      recentRedirectsList.appendChild(redirectItem);
    });
  }

  // Button event listeners
  addRuleBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "options.html#add" });
  });

  openOptionsBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "options.html" });
  });
});
