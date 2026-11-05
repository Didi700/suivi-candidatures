export type Statut = 'À envoyer' | 'Envoyée' | 'Entretien' | 'Refus' | 'Offre';

export const STATUTS: Statut[] = ['À envoyer', 'Envoyée', 'Entretien', 'Refus', 'Offre'];

export interface Candidature {
  id: number;
  entreprise: string;
  poste: string;
  statut: Statut;
  date: string; // format AAAA-MM-JJ
  lien: string;
  notes: string;
}