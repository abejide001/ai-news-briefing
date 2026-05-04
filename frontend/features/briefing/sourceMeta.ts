export const SOURCE_META = {
  BBC: {
    label: "",
    color: "bg-white text-black",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/41/BBC_Logo_2021.svg",
  },
  CNN: {
    label: "",
    color: "",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg",
  },
  "Sky News": {
    label: "",
    color: "bg-white",
    logo: "https://upload.wikimedia.org/wikipedia/en/archive/5/57/20231116033322%21Sky_News_logo.svg",
  },
  "Al Jazeera": {
    label: "",
    color: "",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/f2/Aljazeera_eng.svg",
  },
  "Deutsche Welle": {
    label: "",
    color: "bg-white",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Deutsche_Welle_Logo.svg",
  },
  France24: {
    label: "France24",
    color: "",
    logo: "https://upload.wikimedia.org/wikipedia/de/6/65/FRANCE_24_logo.svg",
  },
  "The Guardian": {
    label: "",
    color: "bg-white",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/The_Guardian_2018.svg",
  },
} as const;

export type SourceName = keyof typeof SOURCE_META;
