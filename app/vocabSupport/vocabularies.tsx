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
    men: { definition: "Adult human males.", translation: "mga lalaki", }, 
    decided: { definition: "Made a choice or reached a conclusion.", translation: "nagpasya", }, 
    divide: { definition: "To separate something into parts or groups.", translation: "hatiin", }, 
    "twenty-four": { definition: "The number equal to twenty plus four (24).", translation: "dalawampu't apat", }, 
    hours: { definition: "Units of time equal to sixty minutes each.", translation: "oras", }, 
    numbers: { definition: "Symbols used to represent quantity or order.", translation: "mga numero", }, 
    result: { definition: "The outcome or effect of an action or event.", translation: "kinalabasan", }, 
    during: { definition: "Throughout the duration of a period or event.", translation: "sa panahon ng", }, 
    day: { definition: "A period of twenty-four hours or the time when it is light outside.", translation: "araw", }, 
    another: { definition: "One more person or thing of the same type.", translation: "isa pa", }, 
    after: { definition: "Following in time or order.", translation: "pagkatapos", }, 
    midnight: { definition: "Twelve o’clock at night; the middle of the night.", translation: "hatinggabi", }, 
    created: { definition: "Made or brought something into existence.", translation: "nilikha", }, 
    confusion: { definition: "A state of not understanding or being uncertain.", translation: "pagkalito", }, 
    told: { definition: "Informed or narrated something to someone.", translation: "sinabi", }, 
    submit: { definition: "To present or hand in something for approval or judgment.", translation: "ipasa", }, 
    project: { definition: "A planned piece of work with a specific goal.", translation: "proyekto", }, 
    morning: { definition: "The early part of the day, from sunrise to noon.", translation: "umaga", }, 
    night: { definition: "The period of darkness between evening and morning.", translation: "gabi", }, 
    Romans: { definition: "People from ancient Rome.", translation: "mga Romano", }, 
    provided: { definition: "Supplied or made available for use.", translation: "ibinigay", }, 
    solution: { definition: "An answer or way to fix a problem.", translation: "solusyon", }, 
    problem: { definition: "A situation that needs to be solved or dealt with.", translation: "problema", }, 
    time: { definition: "A continuous sequence of moments and events.", translation: "oras", }, 
    sun: { definition: "The star at the center of our solar system that gives light and heat.", translation: "araw", }, 
    apex: { definition: "The highest point or peak.", translation: "tuktok", }, 
    important: { definition: "Having great meaning or value.", translation: "mahalaga", }, 
    called: { definition: "Named or referred to as.", translation: "tinatawag", }, 
    shortened: { definition: "Made shorter in length, duration, or size.", translation: "pinapaikli", },
  },

  "Nose Bleeds": {
    epistaxis: { definition: "Medical term for nosebleed.", translation: "pagdurugo ng ilong" },
    nostrils: { definition: "Openings of the nose.", translation: "mga butas ng ilong" },
    allergy: { definition: "Reaction of the body to a substance.", translation: "alerdyi" },
  },
};

