# Fix temporaire - Supprimer les imports Supabase

Les pages suivantes doivent être mises à jour pour utiliser l'API au lieu de Supabase:

- src/pages/POS.tsx
- src/pages/Menu.tsx
- src/pages/History.tsx
- src/pages/Settings.tsx

Pour l'instant, tu peux commenter les imports de supabase dans ces fichiers en attendant que je les mette à jour complètement.

Remplace `import { supabase } from '../lib/supabase';` par `// import { supabase } from '../lib/supabase';`

Ou attends que je les mette à jour un par un.
