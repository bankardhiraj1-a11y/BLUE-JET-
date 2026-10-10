export const enquiryKinds = [
  'General enquiry',
  'International holiday',
  'Domestic holiday',
  'Customized tour',
  'Group tour (16+ travellers)',
  'Private tour (up to 11 travellers)',
  'International student study tour',
  'Domestic student study tour',
  'Spiritual journey',
  'Rail booking assistance',
  'Visa assistance',
  'Passport assistance',
] as const;

export type EnquiryKind = (typeof enquiryKinds)[number];

export type EnquiryFormValues = {
  kind: EnquiryKind;
  destination: string;
  departure: string;
  when: string;
  travellers: string;
  name: string;
  phone: string;
  email: string;
  institution: string;
  details: string;
  website: string;
  consent: boolean;
};

export const contacts = {
  international: { label: 'International enquiries', display: '+91 76208 80088', tel: '+917620880088' },
  passport: { label: 'Passport Seva assistance', display: '+91 77208 80088', tel: '+917720880088' },
  general: { label: 'General enquiries', display: '+91 76730 10608', tel: '+917673010608' },
  domestic: { label: 'Domestic enquiries', display: '+91 99231 81369', tel: '+919923181369' },
} as const;
