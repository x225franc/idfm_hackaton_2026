// Données mockées du tunnel de souscription.
// TODO: remplacer par de vrais appels API (offres, tarifs, règles d'éligibilité) une fois le backend prêt.

export const PROFILES = [
  {
    id: 'actif',
    label: 'Actif',
    sub: '26-62 ans',
    bg: '#EEF3FF',
    color: '#1972D2',
    img: '/images/personnage/Actif.svg',
  },
  {
    id: 'etudiant',
    label: 'Étudiant',
    sub: '-26 ans',
    bg: '#EDFAF3',
    color: '#007D44',
    img: '/images/personnage/Jeune.svg',
  },
  {
    id: 'senior',
    label: 'Senior',
    sub: '+62 ans',
    bg: '#F3F0FF',
    color: '#4F338B',
    img: '/images/personnage/Senior.svg',
  },
  {
    id: 'solidarite',
    label: 'Solidarité',
    sub: "Bénéficiaire d'aides sociales",
    bg: '#FFF0F8',
    color: '#E72F89',
    img: '/images/personnage/Solidaritee.svg',
  },
  {
    id: 'mobilite',
    label: 'Mobilité réduite',
    sub: '',
    bg: '#FFF8EE',
    color: '#F39224',
    img: '/images/personnage/Mobilitereeduite.svg',
  },
];

export const FREQUENCIES = [
  { id: 'quotidien', label: 'Tous les jours' },
  { id: 'hebdo', label: 'Plusieurs fois par semaine' },
  { id: 'mensuel', label: 'Quelques fois par mois' },
  { id: 'rare', label: 'Rarement' },
];

// Catalogue d'offres (cf. enum `type_forfait` de database/idfm_hackaton.sql)
export const OFFERS = {
  'navigo-annuel': {
    id: 'navigo-annuel',
    name: 'Navigo Annuel',
    price: 96.4,
    period: 'an',
    desc: 'Pour les personnes qui se déplacent moins fréquemment ou hors de la région.',
  },
  'imagine-r': {
    id: 'imagine-r',
    name: 'Navigo Imagine R',
    price: 78.7,
    period: 'an',
    desc: 'Idéal pour les étudiants en Île-de-France.',
    perks: [
      'Idéal pour vos trajets quotidiens',
      'Accès à tout le réseau Île-de-France',
      'Tarif réduit adapté à votre profil',
    ],
  },
  amethyste: {
    id: 'amethyste',
    name: 'Améthyste',
    price: 53.9,
    period: 'an',
    desc: 'Tarif réduit réservé aux seniors franciliens.',
    perks: [
      'Tarif préférentiel senior',
      'Accès à tout le réseau Île-de-France',
      'Renouvellement simplifié chaque année',
    ],
  },
  tst: {
    id: 'tst',
    name: 'TST',
    price: 0,
    period: 'an',
    desc: 'Tarification Sociale et Solidaire, sous conditions de ressources.',
    perks: [
      'Tarif adapté à votre situation',
      'Accès à tout le réseau Île-de-France',
      'Dossier étudié sous 48h',
    ],
  },
  'liberte-plus': {
    id: 'liberte-plus',
    name: 'Liberté+',
    price: 0,
    period: 'trajet',
    desc: 'Payez uniquement vos trajets, sans engagement.',
    perks: [
      'Aucun engagement',
      'Facturation à l\'usage réel',
      'Idéal pour un usage occasionnel',
    ],
  },
};

const RECOMMENDATION_MAP = {
  actif: { main: 'navigo-annuel', alt: 'liberte-plus' },
  etudiant: { main: 'imagine-r', alt: 'navigo-annuel' },
  senior: { main: 'amethyste', alt: 'navigo-annuel' },
  solidarite: { main: 'tst', alt: 'navigo-annuel' },
  mobilite: { main: 'liberte-plus', alt: 'navigo-annuel' },
};

// Renvoie { recommended, alternative } selon le profil + la fréquence de trajet déclarés.
export function getOffers(profileId, frequencyId) {
  const mapping = RECOMMENDATION_MAP[profileId] || RECOMMENDATION_MAP.actif;
  let { main, alt } = mapping;

  // Un usage rare/occasionnel rend un forfait annuel moins pertinent : on bascule sur Liberté+
  // (sauf si le profil a déjà droit à une offre solidaire/dédiée).
  if (frequencyId === 'rare' && main !== 'tst' && main !== 'liberte-plus') {
    [main, alt] = ['liberte-plus', main];
  }

  return { recommended: OFFERS[main], alternative: OFFERS[alt] };
}

const BASE_DOCS = [
  { id: 'identite', label: "Carte d'identité", required: true, hint: 'JPG, PNG ou PDF, max 5 Mo' },
];

// Renvoie la liste des documents à fournir selon le profil sélectionné.
export function getDocuments(profileId) {
  const docs = [...BASE_DOCS];

  if (profileId === 'etudiant') {
    docs.push({ id: 'scolarite', label: 'Certificat de scolarité', required: true, hint: 'Formats acceptés ci-dessus' });
    docs.push({ id: 'bourse', label: 'Attestation de bourse', required: false, hint: 'Si vous êtes boursier' });
  } else if (profileId === 'solidarite') {
    docs.push({ id: 'aide-sociale', label: "Justificatif d'aide sociale", required: true, hint: 'Formats acceptés ci-dessus' });
  } else if (profileId === 'senior') {
    docs.push({ id: 'photo', label: "Photo d'identité", required: false, hint: 'Pour votre carte Améthyste' });
  } else {
    docs.push({ id: 'photo', label: "Photo d'identité", required: false, hint: 'Pour personnaliser votre carte' });
  }

  return docs;
}

export const PAYMENT_METHODS = [
  { id: 'cb', label: 'Carte bancaire', sub: 'Visa, Mastercard, CB' },
  { id: 'prelevement', label: 'Prélèvement automatique', sub: 'Mandat IBAN requis' },
  { id: 'autres', label: 'Autres moyens de paiement', sub: 'Apple Pay, Google Pay' },
];
