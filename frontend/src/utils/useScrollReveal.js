import { useEffect } from 'react';

/**
 * Hook qui observe tous les elements portant la classe .fade-in-up
 * dans le DOM et leur ajoute .is-visible quand ils entrent dans le
 * viewport, declenchant ainsi l'animation CSS associee.
 *
 * Usage : appeler useScrollReveal() une fois dans le composant de page.
 * Reagit aux changements de `deps` pour re-observer le DOM apres un
 * chargement asynchrone (ex: liste de produits arrivee depuis l'API).
 */
export function useScrollReveal(deps = []) {
  useEffect(() => {
    const elements = document.querySelectorAll('.fade-in-up:not(.is-visible)');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
