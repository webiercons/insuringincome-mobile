/**
 * Static education copy — structured for future CMS/API hydration.
 * Screen routes filter by `screenKey`; `id` supports deep links later (`?topic=income-shock`).
 */
export type PublicEducationTopic = {
  id: string;
  screenKey: 'learn' | 'disability' | 'life';
  /** Short label for grouping / future chips */
  lens: string;
  title: string;
  body: string;
};

export const PUBLIC_EDUCATION_TOPICS: PublicEducationTopic[] = [
  {
    id: 'why-transfer-risk',
    screenKey: 'learn',
    lens: 'Foundations',
    title: 'Why income protection exists',
    body:
      'Insurance moves catastrophic financial risk you cannot self-insure to a carrier contractually obligated to pay when defined events occur. The goal is liquidity when a shock would otherwise force hard tradeoffs.',
  },
  {
    id: 'disability-vs-life',
    screenKey: 'learn',
    lens: 'Foundations',
    title: 'Disability vs. life — different jobs',
    body:
      'Disability coverage protects your ability to earn. Life coverage protects others from the economic loss of your death. Many households need both, in different amounts, reviewed alongside debt, savings, and specialty-specific risks.',
  },
  {
    id: 'advisor-value',
    screenKey: 'learn',
    lens: 'Working with advisors',
    title: 'Why licensed review matters',
    body:
      'Carriers, definitions, and riders vary materially by state and occupation class. A licensed advisor compares illustrations and contract language—not marketing pages alone—before you bind.',
  },
  {
    id: 'next-step-no-login',
    screenKey: 'learn',
    lens: 'Next step',
    title: 'Explore without signing in',
    body:
      'Use Quote to outline goals, Resources for structured education, or Contact when you want a human callback. None of these tabs require operator sign-in.',
  },
  {
    id: 'income-shock',
    screenKey: 'disability',
    lens: 'Clinical careers',
    title: 'Income stops faster than recovery',
    body:
      'Most households run on near-term cash flow. A long illness or injury can drain reserves before you are back at full capacity—especially when employer LTD caps benefits or uses definitions that do not match your specialty.',
  },
  {
    id: 'core-definitions',
    screenKey: 'disability',
    lens: 'Contract language',
    title: 'Definitions drive claims',
    body:
      'Benefit amount, elimination period, benefit period, and own- vs any-occupation language determine when and how much a carrier pays. Your advisor should map these to your specialty and employer coverage.',
  },
  {
    id: 'partial-residual',
    screenKey: 'disability',
    lens: 'Return to work',
    title: 'Partial & residual benefits',
    body:
      'Many contracts include partial disability if you return at reduced earnings. Residual riders can bridge recovery—important when ramping clinical hours or procedural volume.',
  },
  {
    id: 'underwriting-realism',
    screenKey: 'disability',
    lens: 'Underwriting',
    title: 'Expect a deliberative process',
    body:
      'Occupation class, health history, and financial documentation influence offer and premium. Underwriting is not instant bind from a mobile form—your advisor sequences labs, financials, and carrier dialogue.',
  },
  {
    id: 'life-why',
    screenKey: 'life',
    lens: 'Survivorship',
    title: 'Death benefit as a planning floor',
    body:
      'Life insurance answers whether survivors can service debt, replace income, fund education, or stabilize a practice if you die unexpectedly. Amount and structure should follow estate and business agreements—not guesswork.',
  },
  {
    id: 'term-structure',
    screenKey: 'life',
    lens: 'Term',
    title: 'Term windows & conversion',
    body:
      'Level term locks premium and death benefit for a defined window. Conversion privileges may allow movement to permanent coverage without new medical evidence—useful when health changes mid-career.',
  },
  {
    id: 'permanent-overview',
    screenKey: 'life',
    lens: 'Permanent',
    title: 'Permanent mechanics differ',
    body:
      'Whole, universal, and indexed designs differ in premium flexibility, crediting, and guarantees. Illustrations are not promises—review nonguaranteed elements with your advisor and tax counsel when relevant.',
  },
  {
    id: 'beneficiary-discipline',
    screenKey: 'life',
    lens: 'Governance',
    title: 'Beneficiary alignment',
    body:
      'Keep beneficiary designations aligned with estate documents and business buy-sell agreements. Major life events should trigger a documented review.',
  },
];

export function getEducationTopicsForScreen(screenKey: PublicEducationTopic['screenKey']): PublicEducationTopic[] {
  return PUBLIC_EDUCATION_TOPICS.filter((t) => t.screenKey === screenKey);
}
