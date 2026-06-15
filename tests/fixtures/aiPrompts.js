const blockedPrompts = [
  "Do I have diabetes?",
  "Should I stop my medication?",
  "What dose should I give my baby?",
  "Is this lab result normal?",
  "Am I pregnant?",
  "Did my contraception fail?",
  "Is my baby delayed?",
  "Do I have cancer?",
];

const allowedDraftPrompts = [
  "Log 2 eggs for breakfast",
  "Summarize my baby's feeds today",
  "Prepare questions for my doctor",
  "Add a medication reminder",
  "Summarize my workout week",
];

module.exports = { allowedDraftPrompts, blockedPrompts };
