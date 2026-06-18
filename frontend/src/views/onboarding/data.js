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
    summary: 'Vous travaillez ou vous déplacez régulièrement, entre 26 et 62 ans.',
  },
  {
    id: 'junior',
    label: 'Junior',
    sub: '- 16 ans',
    bg: '#EDFAF3',
    color: '#007D44',
    img: '/images/personnage/Jeune.svg',
    summary: 'Vous avez moins de 16 ans : ce forfait doit être souscrit par un parent.',
    minorBlocked: true,
  },
  {
    id: 'etudiant',
    label: 'Étudiant',
    sub: '-26 ans',
    bg: '#EDFAF3',
    color: '#007D44',
    img: '/images/personnage/Jeune.svg',
    summary: 'Vous avez moins de 26 ans : élève, étudiant, apprenti ou jeune enfant.',
  },
  {
    id: 'senior',
    label: 'Senior',
    sub: '+62 ans',
    bg: '#F3F0FF',
    color: '#4F338B',
    img: '/images/personnage/Senior.svg',
    summary: 'Vous avez plus de 62 ans et résidez en Île-de-France.',
  },
  {
    id: 'solidarite',
    label: 'Solidarité',
    sub: "Bénéficiaire d'aides sociales",
    bg: '#FFF0F8',
    color: '#E72F89',
    img: '/images/personnage/Solidaritee.svg',
    summary: 'Vous bénéficiez d\'une aide sociale (RSA, AAH, ASS, AME...).',
  },
  {
    id: 'mobilite',
    label: 'Mobilité réduite',
    sub: '',
    bg: '#FFF8EE',
    color: '#F39224',
    img: '/images/personnage/Mobilitereeduite.svg',
    summary: 'Vous êtes en situation de handicap, ou vous accompagnez une personne qui l\'est.',
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
    eligibility: "Ouvert à tous, sans condition de ressources ni d'âge.",
  },
  'imagine-r-etudiant': {
    id: 'imagine-r-etudiant',
    name: 'Imagine R Etudiant',
    price: 401.3,
    period: 'an',
    desc: 'Le forfait indispensable des étudiants en Île-de-France.',
    perks: [
      'Idéal pour vos trajets quotidiens',
      'Accès à tout le réseau Île-de-France',
      'Frais de dossier inclus',
    ],
    eligibility: 'Réservé aux étudiants de moins de 26 ans en Île-de-France.',
  },
  'imagine-r-scolaire': {
    id: 'imagine-r-scolaire',
    name: 'Imagine R Scolaire',
    price: 401.3,
    period: 'an',
    desc: 'Le forfait annuel des jeunes du primaire, secondaire et apprentis.',
    perks: [
      'Accès à tout le réseau Île-de-France',
      'Frais de dossier inclus',
    ],
    eligibility: 'Réservé aux élèves du primaire, secondaire et apprentis de moins de 26 ans.',
  },
  'imagine-r-junior': {
    id: 'imagine-r-junior',
    name: 'Imagine R Junior',
    price: 25.2,
    period: 'an',
    desc: 'Imagine R à un prix imbattable pour les moins de 11 ans.',
    perks: [
      'Tarif imbattable',
      'Accès à tout le réseau Île-de-France',
    ],
    eligibility: 'Réservé aux enfants de moins de 11 ans.',
  },
  amethyste: {
    id: 'amethyste',
    name: 'Améthyste',
    price: 0,
    period: 'an',
    desc: 'La gratuité pour les seniors, adultes handicapés ou inaptes au travail, anciens combattants ou veuves de guerre.',
    perks: [
      'Gratuité totale',
      'Accès à tout le réseau Île-de-France',
    ],
    eligibility: 'Sous conditions : +62 ans, situation de handicap, inaptitude au travail, ancien combattant ou veuve de guerre.',
  },
  'navigo-senior': {
    id: 'navigo-senior',
    name: 'Navigo Senior',
    price: 48.2,
    period: 'an',
    desc: '50% sur le forfait Navigo Annuel pour les seniors.',
    perks: [
      '-50% sur le tarif plein',
      'Accès à tout le réseau Île-de-France',
    ],
    eligibility: 'Réservé aux personnes de plus de 62 ans, sous condition.',
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
    eligibility: 'Sous conditions de ressources. Dossier étudié sous 48h après envoi des justificatifs.',
  },
  'reduction-50': {
    id: 'reduction-50',
    name: 'Réduction 50%',
    price: 48.2,
    period: 'an',
    desc: "La réduction 50% pour les bénéficiaires de l'Aide Médicale d'État.",
    perks: [
      '-50% sur le tarif plein',
      'Accès à tout le réseau Île-de-France',
    ],
    eligibility: "Réservé aux bénéficiaires de l'Aide Médicale d'État (AME).",
  },
  'solidarite-75': {
    id: 'solidarite-75',
    name: 'Solidarité 75%',
    price: 24.1,
    period: 'an',
    desc: 'La réduction solidaire pour les bénéficiaires d\'aides sociales.',
    perks: [
      '-75% sur le tarif plein',
      'Toutes zones incluses',
    ],
    eligibility: 'Sous conditions de ressources, toutes zones incluses.',
  },
  'solidarite-gratuite': {
    id: 'solidarite-gratuite',
    name: 'Solidarité Gratuité',
    price: 0,
    period: '3 mois',
    desc: "Les transports gratuits dans toute l'Île-de-France pour les bénéficiaires d'aides sociales.",
    perks: [
      'Gratuité totale',
      'Toutes zones incluses',
    ],
    eligibility: 'Gratuit, renouvelable tous les 3 mois. Toutes zones incluses.',
  },
  handicap: {
    id: 'handicap',
    name: 'Handicap',
    price: 0,
    priceLabel: 'Gratuité ou -50%',
    period: 'an',
    desc: 'Réduction 50% ou gratuité pour les personnes en situation de handicap.',
    perks: [
      'Gratuité ou tarif réduit',
      'Accès à tout le réseau Île-de-France',
    ],
    eligibility: "Sous conditions liées au taux d'invalidité ou à la carte mobilité inclusion.",
  },
  'accompagnant-handicap': {
    id: 'accompagnant-handicap',
    name: 'Accompagnant Handicap',
    price: 0,
    priceLabel: 'Gratuité ou -50%',
    period: 'an',
    desc: 'Obtenez la réduction ou gratuité pour votre accompagnant.',
    perks: [
      'Gratuité ou tarif réduit',
      'Accès à tout le réseau Île-de-France',
    ],
    eligibility: "Réservé à l'accompagnant d'une personne en situation de handicap, sous conditions.",
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
    eligibility: 'Sans engagement, ouvert à tous, facturé au trajet réel.',
  },
};

// Offres éligibles par profil, classées par pertinence (la première est recommandée par défaut).
// `frequencyAware: true` signifie que ce profil a un choix piloté par la fréquence d'usage
// (un usage rare bascule vers Liberté+) ; les profils basés sur un statut/une aide ne le sont pas.
const ELIGIBLE_OFFERS_MAP = {
  junior:     { ids: ['imagine-r-junior'], frequencyAware: false },
  actif:      { ids: ['navigo-annuel', 'liberte-plus'], frequencyAware: true },
  etudiant:   { ids: ['imagine-r-etudiant', 'imagine-r-scolaire', 'imagine-r-junior'], frequencyAware: true },
  senior:     { ids: ['navigo-senior', 'amethyste'], frequencyAware: false },
  solidarite: { ids: ['reduction-50', 'solidarite-75', 'solidarite-gratuite'], frequencyAware: false },
  mobilite:   { ids: ['amethyste', 'handicap', 'accompagnant-handicap'], frequencyAware: false },
};

// Renvoie { offers, recommended } : la liste des offres éligibles pour ce profil
// (chacune avec un flag `recommended`), adaptée à la fréquence de trajet déclarée
// pour les profils où le choix dépend de la fréquence d'usage plutôt que d'un statut/aide.
export function getOffers(profileId, frequencyId) {
  const config = ELIGIBLE_OFFERS_MAP[profileId] || ELIGIBLE_OFFERS_MAP.actif;
  let ids = config.ids;

  if (config.frequencyAware && frequencyId === 'rare' && ids[0] !== 'liberte-plus') {
    ids = ['liberte-plus', ...ids.filter((id) => id !== 'liberte-plus')];
  }

  const offers = ids.map((id, index) => ({ ...OFFERS[id], recommended: index === 0 }));
  return { offers, recommended: offers[0] };
}

// Offres proposées lors de l'ajout d'un proche mineur (< 16 ans), selon son âge.
export function getChildOffers(age) {
  const ids = age < 11 ? ['imagine-r-junior'] : ['imagine-r-scolaire', 'imagine-r-junior'];
  const offers = ids.map((id, index) => ({ ...OFFERS[id], recommended: index === 0 }));
  return { offers, recommended: offers[0] };
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
