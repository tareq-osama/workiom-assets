export const BRAND_GRADIENT =
  'linear-gradient(135deg, #231F61 0%, #360C73 55%, #9635F0 100%)';

export type BrandColor = {
  name: string;
  hex: string;
  rgb: string;
};

export const COLOR_PURPLE: BrandColor = {
  name: 'Workiom Purple',
  hex: '#9635F0',
  rgb: '150, 53, 240',
};

export const COLOR_NAVY: BrandColor = {
  name: 'Deep Navy',
  hex: '#231F61',
  rgb: '35, 31, 97',
};

export const COLOR_BLUE: BrandColor = {
  name: 'Blue',
  hex: '#3C84FD',
  rgb: '60, 132, 253',
};

export const COLOR_DARK_PURPLE: BrandColor = {
  name: 'Dark Purple',
  hex: '#360C73',
  rgb: '54, 12, 115',
};

export const COLOR_VIOLET: BrandColor = {
  name: 'Violet',
  hex: '#8201AD',
  rgb: '130, 1, 173',
};

export const COLOR_YELLOW: BrandColor = {
  name: 'Yellow',
  hex: '#FDBC0B',
  rgb: '253, 188, 11',
};

export const COLOR_LIGHT_GRAY: BrandColor = {
  name: 'Light Gray',
  hex: '#D9D9D9',
  rgb: '217, 217, 217',
};

export const COLOR_BLACK: BrandColor = {
  name: 'Black',
  hex: '#000000',
  rgb: '0, 0, 0',
};

export const COLOR_WHITE: BrandColor = {
  name: 'White',
  hex: '#FFFFFF',
  rgb: '255, 255, 255',
};

export type TypographySample = {
  weight: number;
  label: string;
  sample: string;
};

export const TYPOGRAPHY_SAMPLES: TypographySample[] = [
  { weight: 700, label: 'Bold', sample: 'Workiom AI will do the work' },
  { weight: 600, label: 'SemiBold', sample: 'Transforming ideas into workflows' },
  { weight: 500, label: 'Medium', sample: 'Build, automate, and scale operations' },
  { weight: 400, label: 'Regular', sample: 'A future where every team creates the software they need' },
  { weight: 300, label: 'Light', sample: 'Minimal, modern, product-focused, spacious' },
];

export const LOGO_SRC = '/workiom-logo.png';
