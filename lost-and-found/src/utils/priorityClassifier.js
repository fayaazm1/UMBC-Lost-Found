// utils/priorityClassifier.js
export function isPriorityPost(text) {
    if (!text || typeof text !== "string") return false;
  
    const priorityKeywords = [
      "gold ring", "wallet", "passport", "id card", "identity card", "license",
      "keys", "atm card", "credit card", "debit card",
      "important document", "driving license", "laptop", "phone", "mobile", "tablet"
    ];
  
    const lowerText = text.toLowerCase();
  
    return priorityKeywords.some(keyword => lowerText.includes(keyword));
  }
  