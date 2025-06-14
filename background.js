// Helper function to convert wildcard to regex
function wildcardToRegExp(wildcard) {
  // Escape special regex characters except * and ?
  const escaped = wildcard.replace(/[-[\]{}()+.,\\^$|#]/g, "\\$&");
  // Convert wildcard * to regex .*
  const converted = escaped.replace(/\*/g, "(.*)");
  // Convert wildcard ? to regex .
  const final = converted.replace(/\?/g, ".");
  return new RegExp("^" + final + "$");
}

// Store recent redirects for display in popup
async function storeRecentRedirect(from, to) {
  const { recentRedirects = [] } = await chrome.storage.local.get([
    "recentRedirects",
  ]);

  const newRedirect = {
    from,
    to,
    timestamp: Date.now(),
  };

  // Add to beginning, limit to 10 items
  const updatedRedirects = [newRedirect, ...recentRedirects.slice(0, 9)];

  await chrome.storage.local.set({ recentRedirects: updatedRedirects });
}

// Extract query parameter from URL
function getQueryParam(url, param) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get(param);
}

// Function to update redirect rules
async function updateRedirectRules() {
  const { rules, useSync } = await chrome.storage.local.get([
    "rules",
    "useSync",
  ]);

  // If sync is enabled, try to get rules from sync storage
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

  // Filter out disabled rules
  const enabledRules = activeRules.filter((rule) => rule.enabled);

  if (enabledRules.length === 0) {
    // Clear all redirect rules if none are enabled
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: (
        await chrome.declarativeNetRequest.getDynamicRules()
      ).map((rule) => rule.id),
    });
    return;
  }

  // Convert our rules to declarativeNetRequest rules
  const declarativeRules = [];

  enabledRules.forEach((rule, index) => {
    // Use index + 1 as rule ID to avoid ID 0
    const ruleId = index + 1;

    // Special handling for Google search redirect
    if (
      rule.includePattern.includes("google.com/search") &&
      rule.includePattern.includes("q=*") &&
      rule.redirectTo.includes("duckduckgo.com")
    ) {
      declarativeRules.push({
        id: ruleId,
        priority: 100, // High priority
        action: {
          type: "redirect",
          redirect: {
            transform: {
              queryTransform: {
                addOrReplaceParams: [{ key: "q", value: "{1}" }],
                removeParams: ["*"],
              },
              host: "duckduckgo.com",
              scheme: "https",
            },
          },
        },
        condition: {
          regexFilter: "^https://www\\.google\\.com/search\\?.*q=([^&]*)",
          resourceTypes: ["main_frame"],
        },
      });
    } else {
      // For other rules, use a simpler approach
      let urlFilter = "";
      if (rule.patternType === "Wildcard") {
        // Convert wildcard to a simple filter pattern
        urlFilter = rule.includePattern.replace(/\*/g, "*");
      } else {
        // For regex, we'll use a simplified approach
        urlFilter = rule.includePattern;
      }

      declarativeRules.push({
        id: ruleId,
        priority: enabledRules.length - index, // Higher priority for rules at the top
        action: {
          type: "redirect",
          redirect: {
            url: rule.redirectTo,
          },
        },
        condition: {
          urlFilter: urlFilter,
          resourceTypes: ["main_frame"],
        },
      });
    }
  });

  // Get existing rules to remove
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map((rule) => rule.id);

  // Update the rules
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: declarativeRules,
  });

  console.log("Updated redirect rules:", declarativeRules);
}

// Listen for changes to rules in storage
chrome.storage.onChanged.addListener((changes, area) => {
  if (changes.rules || changes.useSync) {
    updateRedirectRules();
  }
});

// Handle URL redirects and track them
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && changeInfo.url) {
    // Check if this URL matches any of our redirect rules
    checkIfRedirected(changeInfo.url);
  }
});

// Check if a URL was redirected and log it
async function checkIfRedirected(url) {
  const { rules, useSync } = await chrome.storage.local.get([
    "rules",
    "useSync",
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

  // Filter to only enabled rules
  const enabledRules = activeRules.filter((rule) => rule.enabled);

  for (const rule of enabledRules) {
    // Special case for DuckDuckGo
    if (
      url.startsWith("https://duckduckgo.com/") &&
      rule.includePattern.includes("google.com/search")
    ) {
      const query = getQueryParam(url, "q");
      if (query) {
        storeRecentRedirect(`Google search for: ${query}`, url);
        return;
      }
    }

    // For other redirects
    if (url.includes(rule.redirectTo.split("$")[0])) {
      storeRecentRedirect(rule.includePattern, url);
      return;
    }
  }
}

// Initialize default rules if none exist
chrome.runtime.onInstalled.addListener(async () => {
  const { rules } = await chrome.storage.local.get(["rules"]);

  if (!rules || rules.length === 0) {
    const defaultRules = [
      {
        id: Date.now().toString(),
        description: "Example: Redirect Google to DuckDuckGo",
        includePattern: "https://www.google.com/search?q=*",
        redirectTo: "https://duckduckgo.com/?q=$1",
        exampleUrl: "https://www.google.com/search?q=privacy",
        patternType: "Wildcard",
        appliesTo: "Main window",
        enabled: true, // Enable the rule by default
      },
    ];

    await chrome.storage.local.set({
      rules: defaultRules,
      useSync: false,
    });
  }

  // Initialize redirect rules
  updateRedirectRules();
});
