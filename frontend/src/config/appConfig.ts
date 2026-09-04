export interface AppConfig {
  appName: string;
  fullName: string;
  tagline: string;
  version: string;
  problemStatement: string;
  team: {
    name: string;
    description: string;
    affiliation: string;
    year: string;
    linkedin: string;
    github: string;
  };
  technologies: string[];
  disclaimer: string;
  dataSummary: {
    totalSyntheticClaims: number;
    districtsCount: number;
    statesCount: number;
    isSynthetic: boolean;
  };
}

export const APP_CONFIG: AppConfig = {
  appName: 'VANRA',
  fullName: 'Visual AI Network for Rights Administration',
  tagline: 'From scattered claims to explainable decisions.',
  version: '2.4.0-hackathon-demo',
  problemStatement: 'PS-7: AI-powered Decision Support System for Forest Rights Act (FRA) Monitoring',
  team: {
    name: 'Team Maverick Trio',
    description: 'Students of VIT Bhopal',
    affiliation: 'Origin Hackathon 2026 · Data Science Club of VIT Bhopal',
    year: '2026',
    linkedin: 'https://www.linkedin.com/in/umang-patel-bb7720363/',
    github: 'https://github.com/',
  },
  technologies: [
    'React 18',
    'TypeScript',
    'FastAPI',
    'Python 3.11',
    'Leaflet & React-Leaflet',
    'Recharts',
    'Framer Motion',
    'Scikit-learn',
    'SQLite'
  ],
  disclaimer: 'Prototype demonstration system using synthetic/mock FRA data. Does not replace statutory authorities or legal decision-making.',
  dataSummary: {
    totalSyntheticClaims: 4781,
    districtsCount: 36,
    statesCount: 5,
    isSynthetic: true,
  }
};
