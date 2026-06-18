export type HealthOSHealthClaimTerm = {
  notes: string;
  riskyTerm: string;
  saferAlternatives: string[];
};

export const healthOSRiskyHealthClaimTerms: HealthOSHealthClaimTerm[] = [
  term("diagnose", ["organize", "track", "prepare questions"], "Use only in disclaimers that clearly say the app does not diagnose."),
  term("treat", ["support tracking", "review with a healthcare professional"], "Avoid treatment claims."),
  term("cure", ["manage records", "source-linked education"], "Avoid cure claims entirely."),
  term("guarantee", ["estimated", "may help", "needs review"], "Avoid outcome guarantees."),
  term("doctor replacement", ["does not replace professional care"], "Use only as negative safety copy."),
  term("medical advice", ["not medical advice", "confirm with a healthcare professional"], "Use only in disclaimers."),
  term("AI doctor", ["HealthOS AI", "AI assistant"], "Do not position AI as a clinician."),
  term("100% accurate", ["review before saving", "AI can make mistakes"], "Avoid accuracy guarantees."),
  term("fertility guaranteed", ["fertility notes", "prepare questions"], "Avoid reproductive outcome guarantees."),
  term("contraception guaranteed", ["contraception log", "confirm with a clinician"], "Avoid safety guarantees."),
  term("safe in pregnancy", ["ask a healthcare professional", "needs professional guidance"], "Avoid pregnancy safety claims without source/review."),
  term("medication interaction", ["interaction check requires review", "confirm with a pharmacist"], "Do not present as final fact."),
  term("normal lab result", ["needs review", "source/professional interpretation needed"], "Do not interpret labs as normal/abnormal."),
  term("abnormal lab result", ["needs review", "prepare questions"], "Do not interpret labs as abnormal."),
  term("growth percentile", ["growth log", "review with pediatrician"], "Only use with validated source and context."),
  term("vaccine due", ["vaccine record", "confirm schedule with provider"], "Avoid unsupported schedule claims."),
];

export function findRiskyHealthClaimTerms(copy: string) {
  const lower = copy.toLowerCase();
  return healthOSRiskyHealthClaimTerms.filter((term) =>
    lower.includes(term.riskyTerm.toLowerCase()),
  );
}

function term(
  riskyTerm: string,
  saferAlternatives: string[],
  notes: string,
): HealthOSHealthClaimTerm {
  return { notes, riskyTerm, saferAlternatives };
}
