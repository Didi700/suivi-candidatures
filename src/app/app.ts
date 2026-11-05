import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Candidature, STATUTS, Statut } from './candidature';

const CLE = 'suivi-candidatures';

const EXEMPLES: Candidature[] = [
  { id: 1, entreprise: 'Entreprise exemple A', poste: 'Développeur web en alternance', statut: 'Envoyée', date: '2026-11-03', lien: '', notes: '' },
  { id: 2, entreprise: 'Entreprise exemple B', poste: 'Data engineer en alternance', statut: 'Entretien', date: '2026-10-28', lien: '', notes: '' },
  { id: 3, entreprise: 'Entreprise exemple C', poste: 'Développeur full stack', statut: 'À envoyer', date: '2026-11-05', lien: '', notes: '' },
];

// Lit les candidatures sauvegardées dans le navigateur, sinon prend les exemples
function charger(): Candidature[] {
  try {
    const brut = localStorage.getItem(CLE);
    if (brut) return JSON.parse(brut);
  } catch {
    // données illisibles : on repart des exemples
  }
  return EXEMPLES;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly statuts = STATUTS;
  protected readonly candidatures = signal<Candidature[]>(charger());

  protected readonly filtres: ('Tous' | Statut)[] = ['Tous', ...STATUTS];
  protected readonly filtre = signal<'Tous' | Statut>('Tous');

  // Liste affichée : recalculée quand la liste OU le filtre change
  protected readonly visibles = computed(() => {
    const f = this.filtre();
    const liste = this.candidatures();
    return f === 'Tous' ? liste : liste.filter((c) => c.statut === f);
  });

  protected readonly stats = computed(() => {
    const liste = this.candidatures();
    const envoyees = liste.filter((c) => c.statut !== 'À envoyer').length;
    const reponses = liste.filter((c) => ['Entretien', 'Refus', 'Offre'].includes(c.statut)).length;
    return {
      total: liste.length,
      envoyees,
      entretiens: liste.filter((c) => c.statut === 'Entretien').length,
      taux: envoyees ? Math.round((reponses / envoyees) * 100) : 0,
    };
  });

  // Champs du formulaire
  protected entreprise = '';
  protected poste = '';
  protected statut: Statut = 'À envoyer';
  protected date = new Date().toISOString().slice(0, 10);
  protected lien = '';

  constructor() {
    // Se relance automatiquement à chaque changement du signal
    effect(() => {
      localStorage.setItem(CLE, JSON.stringify(this.candidatures()));
    });
  }

  protected ajouter(): void {
    if (!this.entreprise.trim() || !this.poste.trim()) return;

    const nouvelle: Candidature = {
      id: Date.now(),
      entreprise: this.entreprise.trim(),
      poste: this.poste.trim(),
      statut: this.statut,
      date: this.date,
      lien: this.lien.trim(),
      notes: '',
    };
    this.candidatures.update((liste) => [nouvelle, ...liste]);

    this.entreprise = '';
    this.poste = '';
    this.statut = 'À envoyer';
    this.lien = '';
  }

  protected changerStatut(id: number, valeur: string): void {
    const statut = valeur as Statut;
    this.candidatures.update((liste) =>
      liste.map((c) => (c.id === id ? { ...c, statut } : c)),
    );
  }

  protected supprimer(id: number): void {
    this.candidatures.update((liste) => liste.filter((c) => c.id !== id));
  }
}