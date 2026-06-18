import { Easing } from "react-native-reanimated";

const fast = 140;
const standard = 220;
const calm = 320;

export const healthOSReducedMotion = {
  duration: 0,
  damping: 100,
  mass: 0,
  stiffness: 1000,
} as const;

export const healthOSMotion = {
  reducedMotion: {
    ...healthOSReducedMotion,
    use: "Fallback values for users or contexts that should avoid motion-heavy interactions.",
  },
  pressFeedback: {
    duration: fast,
    easing: Easing.out(Easing.quad),
    scale: 0.98,
    reducedMotion: healthOSReducedMotion,
    use: "Buttons, cards, pills, and compact widgets.",
  },
  cardLift: {
    damping: 18,
    mass: 0.7,
    stiffness: 180,
    translateY: -2,
    reducedMotion: healthOSReducedMotion,
    use: "Subtle widget/card focus or drag-ready feedback.",
  },
  sheetEnter: {
    damping: 22,
    mass: 0.9,
    stiffness: 190,
    reducedMotion: healthOSReducedMotion,
    use: "Bottom sheets and assistant panels entering the viewport.",
  },
  sheetExit: {
    duration: standard,
    easing: Easing.in(Easing.cubic),
    reducedMotion: healthOSReducedMotion,
    use: "Bottom sheets and assistant panels leaving the viewport.",
  },
  navMorph: {
    damping: 20,
    mass: 0.75,
    stiffness: 210,
    reducedMotion: healthOSReducedMotion,
    use: "Floating nav selection and scan/AI center action changes.",
  },
  widgetLongPressMenu: {
    damping: 16,
    mass: 0.8,
    stiffness: 190,
    reducedMotion: healthOSReducedMotion,
    use: "Long-press widget menu opening from a card anchor.",
  },
  menuToInfoTransition: {
    duration: standard,
    easing: Easing.out(Easing.cubic),
    reducedMotion: healthOSReducedMotion,
    use: "Glass menu changing from action list into info/tips mode.",
  },
  calendarCollapse: {
    damping: 24,
    mass: 0.9,
    stiffness: 170,
    reducedMotion: healthOSReducedMotion,
    use: "Calendar month-to-week collapse and sticky week strip.",
  },
  searchToSheet: {
    damping: 22,
    mass: 0.8,
    stiffness: 200,
    reducedMotion: healthOSReducedMotion,
    use: "AI search bar expanding into the assistant sheet.",
  },
  chartReveal: {
    duration: calm,
    easing: Easing.out(Easing.cubic),
    reducedMotion: healthOSReducedMotion,
    use: "Lines, bars, and summaries fading into chart cards.",
  },
  segmentedRingDraw: {
    duration: 700,
    easing: Easing.out(Easing.cubic),
    reducedMotion: healthOSReducedMotion,
    use: "Future Skia segmented progress rings.",
  },
  cameraSuggestionPill: {
    damping: 18,
    mass: 0.7,
    stiffness: 220,
    reducedMotion: healthOSReducedMotion,
    use: "Camera suggestion pills entering or being selected.",
  },
} as const;
