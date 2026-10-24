// Site-wide settings. Edit these values directly.

// Where the Ask and Contact forms send their messages.
// Sign up free at https://web3forms.com with your email, paste the access key here,
// and every submission arrives in your inbox.
export const FORM_ACCESS_KEY = '8c0d80fc-e0fd-40e1-8bf9-4027549e9b59';

// Niṣāb figures are updated automatically twice a day, at 5 am and 5 pm New York time
// (scripts/update-nisab.mjs, run by .github/workflows/nisab.yml). Do not edit src/data/nisab.json by hand.
import nisabData from './nisab.json';
export const nisab = nisabData;

// Ṣadaqat al-Fiṭr. Set once a year before Ramaḍān.
export const fitr = {
  year: '1448 AH',
  amountPerPerson: null as number | null, // e.g. 12.00
  note: '',
};

// Donations page (/donate). Paste each link or detail in when ready; empty ones show "Coming soon".
export const donate = {
  stripeUrl: '',   // Stripe Payment Link, e.g. https://donate.stripe.com/...
  zeffyUrl: '',    // Zeffy donation form link, e.g. https://www.zeffy.com/en-US/donation-form/...
  zelle: {
    recipient: '', // the email or US phone number registered with Zelle
    name: '',      // the name donors will see, e.g. Darul Ifta Miami
  },
};
