// Vocabulary Bucket - Local word definitions and translations
// This file contains offline vocabulary data for the reading app

export type VocabEntry = {
  word: string;
  definition: string;
  translation: string; // Filipino translation
  partOfSpeech: string;
  example?: string;
};

export const VOCAB_BUCKET: Record<string, VocabEntry> = {
  // Common words from "Counting The Hours"
  "decided": {
    word: "decided",
    definition: "Made a choice or reached a conclusion about something",
    translation: "Nagpasya",
    partOfSpeech: "verb",
    example: "They decided to go to the park."
  },
  "divide": {
    word: "divide",
    definition: "To separate into parts or groups",
    translation: "Hatiin",
    partOfSpeech: "verb",
    example: "We will divide the cake equally."
  },
  "hours": {
    word: "hours",
    definition: "Units of time equal to 60 minutes",
    translation: "Oras",
    partOfSpeech: "noun",
    example: "There are 24 hours in a day."
  },
  "result": {
    word: "result",
    definition: "The outcome or consequence of something",
    translation: "Resulta",
    partOfSpeech: "noun",
    example: "The result of the test was positive."
  },
  "midnight": {
    word: "midnight",
    definition: "12 o'clock at night",
    translation: "Hatinggabi",
    partOfSpeech: "noun",
    example: "The party ended at midnight."
  },
  
  // Words from "Telling Time"
  "humans": {
    word: "humans",
    definition: "People; members of the human species",
    translation: "Tao",
    partOfSpeech: "noun",
    example: "All humans need food and water."
  },
  "objects": {
    word: "objects",
    definition: "Physical things that can be seen or touched",
    translation: "Bagay",
    partOfSpeech: "noun",
    example: "There were many objects on the table."
  },
  "beginning": {
    word: "beginning",
    definition: "The start or first part of something",
    translation: "Simula",
    partOfSpeech: "noun",
    example: "We started from the beginning of the book."
  },
  "hourglass": {
    word: "hourglass",
    definition: "A device for measuring time with sand flowing through it",
    translation: "Orasan na buhangin",
    partOfSpeech: "noun",
    example: "The hourglass takes one hour to empty."
  },
  "cylindrical": {
    word: "cylindrical",
    definition: "Shaped like a cylinder; tube-shaped",
    translation: "Hugis tubo",
    partOfSpeech: "adjective",
    example: "The container is cylindrical in shape."
  },
  "narrow": {
    word: "narrow",
    definition: "Not wide; having a small width",
    translation: "Makitid",
    partOfSpeech: "adjective",
    example: "The road was very narrow."
  },
  "center": {
    word: "center",
    definition: "The middle point or part of something",
    translation: "Gitna",
    partOfSpeech: "noun",
    example: "Place the vase in the center of the table."
  },
  "allows": {
    word: "allows",
    definition: "Permits or makes it possible for something to happen",
    translation: "Pinapayagan",
    partOfSpeech: "verb",
    example: "This ticket allows you to enter the park."
  },
  "flow": {
    word: "flow",
    definition: "To move steadily in one direction",
    translation: "Dumaloy",
    partOfSpeech: "verb",
    example: "Water flows down the river."
  },
  "portion": {
    word: "portion",
    definition: "A part or section of something",
    translation: "Bahagi",
    partOfSpeech: "noun",
    example: "Each person got a small portion of food."
  },
  
  // Words from "Nose Bleeds"
  "nosebleed": {
    word: "nosebleed",
    definition: "Bleeding from the nose",
    translation: "Pagdurugo ng ilong",
    partOfSpeech: "noun",
    example: "He got a nosebleed after playing sports."
  },
  "common": {
    word: "common",
    definition: "Happening or appearing frequently; usual",
    translation: "Karaniwan",
    partOfSpeech: "adjective",
    example: "Colds are common in winter."
  },
  "occurrence": {
    word: "occurrence",
    definition: "Something that happens; an event",
    translation: "Pangyayari",
    partOfSpeech: "noun",
    example: "Rain is a common occurrence here."
  },
  "children": {
    word: "children",
    definition: "Young people; plural of child",
    translation: "Mga bata",
    partOfSpeech: "noun",
    example: "The children played in the park."
  },
  "experience": {
    word: "experience",
    definition: "To go through or encounter something",
    translation: "Makaranas",
    partOfSpeech: "verb",
    example: "Many people experience stress at work."
  },
  "epistaxis": {
    word: "epistaxis",
    definition: "Medical term for a nosebleed",
    translation: "Pagdurugo ng ilong (medikal na tawag)",
    partOfSpeech: "noun",
    example: "The doctor diagnosed him with epistaxis."
  },
  "blood": {
    word: "blood",
    definition: "The red liquid that flows through your body",
    translation: "Dugo",
    partOfSpeech: "noun",
    example: "Blood carries oxygen throughout the body."
  },
  "flows": {
    word: "flows",
    definition: "Moves steadily in one direction",
    translation: "Dumaloy",
    partOfSpeech: "verb",
    example: "The river flows to the sea."
  },
  "nostrils": {
    word: "nostrils",
    definition: "The two openings in the nose for breathing",
    translation: "Butas ng ilong",
    partOfSpeech: "noun",
    example: "We breathe through our nostrils."
  },
  "period": {
    word: "period",
    definition: "A length or amount of time",
    translation: "Panahon",
    partOfSpeech: "noun",
    example: "It rained for a short period of time."
  },
  "caused": {
    word: "caused",
    definition: "Made something happen",
    translation: "Naging sanhi",
    partOfSpeech: "verb",
    example: "The storm caused damage to the house."
  },
  "behavior": {
    word: "behavior",
    definition: "The way someone acts or conducts themselves",
    translation: "Ugali",
    partOfSpeech: "noun",
    example: "Good behavior is important in school."
  },
  "frequent": {
    word: "frequent",
    definition: "Happening often",
    translation: "Madalas",
    partOfSpeech: "adjective",
    example: "He makes frequent visits to his grandmother."
  },
  "picking": {
    word: "picking",
    definition: "Choosing or selecting; removing with fingers",
    translation: "Pagpili / Paghukay",
    partOfSpeech: "verb",
    example: "Stop picking your nose."
  },
  "blowing": {
    word: "blowing",
    definition: "Forcing air out through the mouth or nose",
    translation: "Pagihip",
    partOfSpeech: "verb",
    example: "She was blowing her nose because of the cold."
  },
  "cold": {
    word: "cold",
    definition: "An illness that affects the nose and throat",
    translation: "Sipon",
    partOfSpeech: "noun",
    example: "I caught a cold last week."
  },
  
  // Additional common words
  "twenty": {
    word: "twenty",
    definition: "The number 20",
    translation: "Dalawampu",
    partOfSpeech: "number",
    example: "There are twenty students in the class."
  },
  "four": {
    word: "four",
    definition: "The number 4",
    translation: "Apat",
    partOfSpeech: "number",
    example: "I have four siblings."
  },
  "used": {
    word: "used",
    definition: "Put into service or action",
    translation: "Ginamit",
    partOfSpeech: "verb",
    example: "They used a map to find their way."
  },
  "numbers": {
    word: "numbers",
    definition: "Symbols or words representing amounts",
    translation: "Mga numero",
    partOfSpeech: "noun",
    example: "Count the numbers from one to ten."
  },
  "through": {
    word: "through",
    definition: "Moving in one side and out the other",
    translation: "Sa pamamagitan",
    partOfSpeech: "preposition",
    example: "We walked through the park."
  },
  "twelve": {
    word: "twelve",
    definition: "The number 12",
    translation: "Labindalawa",
    partOfSpeech: "number",
    example: "There are twelve months in a year."
  },
  "times": {
    word: "times",
    definition: "Instances or occasions; multiplication",
    translation: "Beses / Ulit",
    partOfSpeech: "noun",
    example: "I visited three times this week."
  },
  "during": {
    word: "during",
    definition: "Throughout the time of",
    translation: "Sa panahon ng",
    partOfSpeech: "preposition",
    example: "It rained during the night."
  },
  "another": {
    word: "another",
    definition: "One more; a different one",
    translation: "Isa pa",
    partOfSpeech: "determiner",
    example: "Would you like another cookie?"
  },
  "after": {
    word: "after",
    definition: "Following in time or place",
    translation: "Pagkatapos",
    partOfSpeech: "preposition",
    example: "We'll eat after the game."
  },
  "different": {
    word: "different",
    definition: "Not the same as something else",
    translation: "Iba",
    partOfSpeech: "adjective",
    example: "Each person has different talents."
  },
  "glass": {
    word: "glass",
    definition: "A hard, transparent material used for windows",
    translation: "Salamin",
    partOfSpeech: "noun",
    example: "The window is made of glass."
  },
  "upper": {
    word: "upper",
    definition: "Higher in position",
    translation: "Itaas",
    partOfSpeech: "adjective",
    example: "The book is on the upper shelf."
  },
  "lower": {
    word: "lower",
    definition: "Below or beneath in position",
    translation: "Ibaba",
    partOfSpeech: "adjective",
    example: "Place it on the lower shelf."
  },
  "having": {
    word: "having",
    definition: "Possessing or experiencing",
    translation: "Pagkakaroon",
    partOfSpeech: "verb",
    example: "We are having a party tonight."
  },
  "either": {
    word: "either",
    definition: "One or the other of two",
    translation: "Alinman",
    partOfSpeech: "determiner",
    example: "You can choose either option."
  },
  "both": {
    word: "both",
    definition: "The two together",
    translation: "Pareho",
    partOfSpeech: "determiner",
    example: "Both children are at school."
  },
  "often": {
    word: "often",
    definition: "Frequently; many times",
    translation: "Madalas",
    partOfSpeech: "adverb",
    example: "I often visit my grandparents."
  },
  "short": {
    word: "short",
    definition: "Not long in length or time",
    translation: "Maikli",
    partOfSpeech: "adjective",
    example: "It was a short meeting."
  },
  "time": {
    word: "time",
    definition: "The measure of duration; a specific moment",
    translation: "Oras",
    partOfSpeech: "noun",
    example: "What time is it?"
  },
  "sand": {
    word: "sand",
    definition: "Tiny grains of rock found on beaches",
    translation: "Buhangin",
    partOfSpeech: "noun",
    example: "The children played in the sand."
  }
};

// Function to search for a word (case-insensitive)
export const getWordDefinition = (word: string): VocabEntry | null => {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  return VOCAB_BUCKET[cleanWord] || null;
};

// Function to get all available words
export const getAllWords = (): string[] => {
  return Object.keys(VOCAB_BUCKET);
};

// Function to check if a word exists
export const hasDefinition = (word: string): boolean => {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  return cleanWord in VOCAB_BUCKET;
};