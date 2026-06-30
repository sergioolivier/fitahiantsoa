import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AVAILABLE_LANGUAGES } from '../../i18n';
import './LanguageSwitcher.css';

export default function LanguageSwitcher({ compact = false, onDark = false }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const current = AVAILABLE_LANGUAGES.find((l) => l.code === i18n.language) || AVAILABLE_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function changeLanguage(code) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div className={`lang-switcher ${compact ? 'lang-switcher--compact' : ''} ${onDark ? 'lang-switcher--on-dark' : ''}`} ref={containerRef}>
      <button className="lang-switcher__trigger" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}>
        <span className="lang-switcher__flag">{current.flag}</span>
        {!compact && <span className="lang-switcher__label">{t(`languages.${current.code}`)}</span>}
        <span className="lang-switcher__chevron">▾</span>
      </button>
      {open && (
        <ul className="lang-switcher__menu" role="listbox">
          {AVAILABLE_LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                className={`lang-switcher__option ${lang.code === current.code ? 'is-active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
                role="option"
                aria-selected={lang.code === current.code}
              >
                <span className="lang-switcher__flag">{lang.flag}</span>
                {t(`languages.${lang.code}`)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
