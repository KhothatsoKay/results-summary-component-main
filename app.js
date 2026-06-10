const fallbackData = [
  { category: "Reaction", score: 80, icon: "./assets/images/icon-reaction.svg" },
  { category: "Memory", score: 92, icon: "./assets/images/icon-memory.svg" },
  { category: "Verbal", score: 61, icon: "./assets/images/icon-verbal.svg" },
  { category: "Visual", score: 72, icon: "./assets/images/icon-visual.svg" }
];

const quizStorageKey = "resultsSummaryQuiz";

function computeAverageScore(items) {
  return Math.round(items.reduce((sum, item) => sum + item.score, 0) / items.length);
}

function saveQuizResults(results) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(quizStorageKey, JSON.stringify(results));
  }
}

function getQuizResults() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(quizStorageKey);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return null;
  }
}

function buildSummaryItemsFromQuiz(quizResults) {
  const icons = {
    Reaction: "./assets/images/icon-reaction.svg",
    Memory: "./assets/images/icon-memory.svg",
    Verbal: "./assets/images/icon-verbal.svg",
    Visual: "./assets/images/icon-visual.svg"
  };

  return Object.keys(quizResults).map((category) => ({
    category,
    score: quizResults[category],
    icon: icons[category]
  }));
}

function setupQuizForm() {
  const quizForm = document.querySelector(".quiz-form");
  if (!quizForm) {
    return;
  }

  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(quizForm);
    const quizResults = {
      Reaction: Number(formData.get("reaction")) || 0,
      Memory: Number(formData.get("memory")) || 0,
      Verbal: Number(formData.get("verbal")) || 0,
      Visual: Number(formData.get("visual")) || 0
    };

    saveQuizResults(quizResults);
    window.location.href = "./index.html";
  });
}

async function getResults() {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) {
      throw new Error("Unable to fetch data.json");
    }
    return await response.json();
  } catch (error) {
    return fallbackData;
  }
}

function getResultMessage(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Great";
  if (score >= 60) return "Good";
  return "Needs Improvement";
}

function getPercentileText(score) {
  const percentile = Math.min(
    99,
    Math.max(1, Math.round(100 * Math.pow(score / 100, 1.55)))
  );
  return `You scored higher than ${percentile}% of the people who have taken these tests.`;
}

function renderSummary(items) {
  const scoreElement = document.querySelector(".score");
  const scoreDescription = document.querySelector(".result-description");
  const resultTitle = document.querySelector(".result-title");
  const summaryContainer = document.querySelector(".result-summary");

  if (!summaryContainer || !scoreElement || !scoreDescription || !resultTitle) {
    return;
  }

  const averageScore = computeAverageScore(items);
  scoreElement.textContent = averageScore;
  resultTitle.textContent = "Your Result";
  scoreDescription.textContent = getPercentileText(averageScore);
  document.querySelector(".score-subtext").textContent = "of 100";
  document.querySelector(".result-score-title").textContent = getResultMessage(averageScore);

  summaryContainer.innerHTML = items
    .map((item) => {
      const categoryClass = item.category.toLowerCase();
      return `
        <div class="summary-item ${categoryClass}">
          <div class="summary-item__label">
            <span class="summary-item__icon"><img src="${item.icon}" alt="${item.category} icon" width="18" height="18"></span>
            <span class="summary-item__name">${item.category}</span>
          </div>
          <span class="summary-item__score">${item.score} / 100</span>
        </div>
      `;
    })
    .join("");
}

function setupButtons() {
  const continueButton = document.querySelector(".continue-button");
  const primaryButton = document.querySelector(".btn-primary");

  if (continueButton) {
    continueButton.addEventListener("click", () => {
      window.location.href = "./quiz.html";
    });
  }

  if (primaryButton) {
    primaryButton.addEventListener("click", () => {
      window.location.href = "./index.html";
    });
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".site-nav a");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path || (href === "index.html" && path === "")) {
      link.classList.add("current");
    }
  });

  window.addEventListener("DOMContentLoaded", async () => {
    const summaryContainer = document.querySelector(".result-summary");
    if (summaryContainer) {
      const quizResults = getQuizResults();
      if (quizResults) {
        renderSummary(buildSummaryItemsFromQuiz(quizResults));
      } else {
        const results = await getResults();
        renderSummary(results);
      }
    }
    setupButtons();
    setupQuizForm();
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    fallbackData,
    computeAverageScore,
    getResults,
    getResultMessage,
    renderSummary,
    setupButtons,
    saveQuizResults,
    getQuizResults,
    buildSummaryItemsFromQuiz
  };
}

