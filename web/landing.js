document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/bootstrap");
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    const badgeRow = document.querySelector(".tag-row");
    if (!badgeRow || !payload?.freeRules) {
      return;
    }

    const guestTag = document.createElement("span");
    guestTag.className = "tag";
    guestTag.textContent = `游客免费 ${payload.freeRules.guestLimit} 次`;

    const userTag = document.createElement("span");
    userTag.className = "tag";
    userTag.textContent = `登录免费 ${payload.freeRules.userLimit} 次`;

    badgeRow.append(guestTag, userTag);
  } catch (_error) {
    // Keep the landing page resilient even when the API is unavailable.
  }
});
