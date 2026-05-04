export type NewsLink = {
  source: string;
  title: string;
  link: string;
};

export type Story = {
  title: string;
  sources?: string[];
  links?: NewsLink[];
};

export type NewsResponse = {
  summary: string;
  stories?: Story[];
  cached?: boolean;
  generatedAt?: string;
};
