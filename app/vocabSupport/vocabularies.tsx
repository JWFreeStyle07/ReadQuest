// export const vocabularies = {
//   "Telling Time": {
//     humans: { definition: "People; members of the species Homo sapiens.", translation: "mga tao" },
//     hourglass: { definition: "A device used to measure time by the flow of sand.", translation: "orasang buhangin" },
//     sundials: { definition: "Devices that tell time using the shadow of the sun.", translation: "orasang araw" },
//     clock: { definition: "A device used to measure and show time.", translation: "relo" },
//   },
//   "Counting the Hours": {
//     meridies: { definition: "Latin for 'midday'.", translation: "tanghaling tapat" },
//     ante: { definition: "Latin for 'before'.", translation: "bago" },
//     post: { definition: "Latin for 'after'.", translation: "pagkatapos" },
//     noon: { definition: "Twelve o’clock in the day; midday.", translation: "tanghali" },
//   },
//   "Nose Bleeds": {
//     epistaxis: { definition: "Medical term for nosebleed.", translation: "pagdurugo ng ilong" },
//     nostrils: { definition: "Openings of the nose.", translation: "mga butas ng ilong" },
//     allergy: { definition: "Reaction of the body to a substance.", translation: "alerdyi" },
//   },
//   "For Testing Only": {
//     good: { definition: "Having positive qualities or morals.", translation: "mabuti" },
//     pass: { definition: "To succeed or move beyond.", translation: "makapasa" },
//   },
// };


// vocabularies.ts
export type VocabEntry = {
  definition: string;
  translation: string;
};

export type StoryVocab = Record<string, VocabEntry>;

/**
 * Use string keys (lowercase) for the inner vocab so lookups against
 * cleaned/tolowercased words succeed.
 */
export const vocabularies: Record<string, StoryVocab> = {
  "For Testing Only": {
    all: { definition: "Everything; the whole.", translation: "lahat" },
    will: { definition: "Indicates future action.", translation: "magiging" },
    good: { definition: "Having positive qualities.", translation: "mabuti" },
    pass: { definition: "To succeed or move beyond.", translation: "makapasa" },
  },

  "Telling Time": {
    humans: { definition: "People; members of the species Homo sapiens.", translation: "mga tao" },
    hourglass: { definition: "A device used to measure time by the flow of sand.", translation: "orasang buhangin" },
    water: { definition: "A clear liquid necessary for life.", translation: "tubig" },
    clocks: { definition: "Devices for measuring time.", translation: "mga relo" },
    sundials: { definition: "Devices that tell time using the sun's shadow.", translation: "orasang araw" },
    stars: { definition: "Luminous points in the night sky.", translation: "mga bituin" },
    clock: { definition: "A device used to measure and show time.", translation: "relo" },
    hour: { definition: "A period of sixty minutes.", translation: "oras" },
  },

  "Counting the Hours": {
    meridiem: { definition: "Latin for 'midday'.", translation: "tanghaling tapat" },
    ante: { definition: "Latin for 'before'.", translation: "bago" },
    post: { definition: "Latin for 'after'.", translation: "pagkatapos" },
    noon: { definition: "Twelve o'clock in the day.", translation: "tanghali" },
  },

  "Nose Bleeds": {
    epistaxis: { definition: "Medical term for nosebleed.", translation: "pagdurugo ng ilong" },
    nostrils: { definition: "Openings of the nose.", translation: "mga butas ng ilong" },
    allergy: { definition: "Reaction of the body to a substance.", translation: "alerdyi" },
  },
};

