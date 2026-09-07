# Cléopâtre — Espace Santé Beauté

Plateforme e-commerce « Quiet Luxury » pour la parapharmacie premium Cléopâtre (Ezzahra · Hammam-Lif, Tunisie).

**Stack** : Next.js (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 (`@theme`) · Framer Motion · Drizzle ORM + PostgreSQL · Zod · Server Actions.

## Démarrage

```bash
cp .env.example .env          # ajuster DATABASE_URL / SESSION_SECRET
npm install
npm run db:push               # crée le schéma (drizzle-kit push)
npm run db:seed               # données de démonstration (81 produits, marques, promos, commandes)
npm run dev
```

## Comptes de démonstration

| Rôle    | E-mail                  | Mot de passe |
|---------|-------------------------|--------------|
| Admin   | admin@cleopatre.tn      | Admin123!    |
| Support | support@cleopatre.tn    | Support123!  |
| Client  | client@cleopatre.tn     | Client123!   |

Codes promo : `BIENVENUE10` (−10 % dès 50 DT), `SOLAIRE15` (−15 % univers Solaire), `LIVRAISON` (livraison offerte dès 40 DT), `CLEO20` (−20 DT dès 150 DT).

## Architecture

- `src/app/(site)` — vitrine : accueil, boutique, univers, catégories, besoins, marques, offres, recherche, produit, journal, boutiques, aide, légal, suivi, compte, panier, commande.
- `src/app/admin` — back-office (rôles admin / support) : dashboard, commandes (workflow + restock), produits, stock, clients, promotions, avis, support, recherches, journal, boutiques, audit, exports CSV.
- `src/actions` — Server Actions (auth, boutique, checkout, admin) avec validation Zod, rate-limit, vérification d'origine.
- `src/lib` — argent en millimes (`money.ts`), auth scrypt + sessions httpOnly (`auth.ts`), catalogue, moteur de promotions, commandes (verrouillage `FOR UPDATE`, idempotence, snapshots), i18n typée, presets de motion.
- `src/db/schema.ts` — 23 tables, index, contraintes uniques, relations.
- `src/components/icons` — système d'icônes SVG inline (viewBox 24, trait 1.5, `aria-hidden`).

## Principes

- Tous les montants sont des entiers en **millimes** (1 DT = 1000).
- Animations : transform + opacity uniquement, `prefers-reduced-motion` respecté.
- Palette : papier / pierre / sable / encre + accent champagne. Aucune couleur violette ou verte vive.
- Copy en français ; structure i18n prête pour l'arabe (RTL).

## Validation

```bash
npx next typegen && npx tsc --noEmit && npm run build
```
