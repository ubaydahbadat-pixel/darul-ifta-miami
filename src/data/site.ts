// Site-wide settings. Edit these values directly.

// Where the Ask and Contact forms send their messages.
// Sign up free at https://web3forms.com with your email, paste the access key here,
// and every submission arrives in your inbox.
export const FORM_ACCESS_KEY = '8c0d80fc-e0fd-40e1-8bf9-4027549e9b59';

// Niṣāb figures. Update `updated`, `goldNisab` and `silverNisab` by hand for now.
// (This will update itself automatically once the price feed is connected.)
export const nisab = {
  updated: '2026-10-20',
  goldGrams: 87.48,
  silverGrams: 612.36,
  goldNisab: 13191.98,
  silverNisab: 1445.17,
};

// Ṣadaqat al-Fiṭr. Set once a year before Ramaḍān.
export const fitr = {
  year: '1448 AH',
  amountPerPerson: null as number | null, // e.g. 12.00
  note: '',
};
