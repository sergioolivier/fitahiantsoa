import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/common/ProductCard';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { CATEGORY_ICON_SVG } from '../components/common/CategoryIcons';
import { useScrollReveal } from '../utils/useScrollReveal';
import './Home.css';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [categories, setCategories] = useState([]);
  const [populaires, setPopulaires] = useState([]);
  const [sponsorises, setSponsorises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoryService.list(),
      productService.list({ populaire: 'true', limit: 8 }),
      productService.list({ sponsorise: 'true', limit: 4 }),
    ])
      .then(([cats, pop, spon]) => {
        setCategories(cats);
        setPopulaires(pop.data);
        setSponsorises(spon.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useScrollReveal([categories, populaires, sponsorises]);

  async function handleAddToCart(productId) {
    if (!user || user.role !== 'client') {
      window.location.href = '/connexion';
      return;
    }
    await addItem(productId, 1);
  }

  return (
    <div className="home">
      <section className="home-hero">
        <div className="container home-hero__inner">
          <div className="home-hero__text">
            <h1>{t('home.heroTitle')}</h1>
            <p>{t('home.heroSubtitle')}</p>
            <div className="home-hero__actions">
              <Link to="/catalogue" className="btn btn--primary btn--lg">{t('home.exploreCatalogue')}</Link>
              <Link to="/inscription?role=fournisseur" className="btn btn--outline btn--lg">{t('home.becomeSupplier')}</Link>
            </div>
            <div className="home-hero__trust">
              <div className="home-hero__trust-item">
                <strong>100%</strong><span>{t('home.trustVerified')}</span>
              </div>
              <div className="home-hero__trust-item home-hero__trust-item--lang">
                <span className="home-hero__trust-label">{t('home.trustLanguage')}</span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>

          <div className="home-hero__visual" aria-hidden="true">
            <div className="hero-card hero-card--main">
              <div className="hero-card__media hero-card__media--equipment-main">
                <span className="hero-card__media-icon">{CATEGORY_ICON_SVG['equipements-ruraux']}</span>
              </div>
              <div className="hero-card__body">
                <span className="hero-card__category">{t('home.heroCategoryRural')}</span>
                <strong>{t('home.heroProduct1')}</strong>
                <div className="hero-card__meta">
                  <span className="hero-card__price">2 450 000 Ar</span>
                  <span className="hero-card__rating">★ 4.8</span>
                </div>
              </div>
            </div>
            <div className="hero-card hero-card--secondary">
              <div className="hero-card__media hero-card__media--equipment-secondary">
                <span className="hero-card__media-icon">{CATEGORY_ICON_SVG.autres}</span>
              </div>
              <div className="hero-card__body">
                <span className="hero-card__category">{t('home.heroCategoryRural')}</span>
                <strong>{t('home.heroProduct2')}</strong>
              </div>
            </div>
            <div className="hero-badge">
              <span className="hero-badge__icon">✓</span>
              <div>
                <strong>{t('home.orderConfirmed')}</strong>
                <span>{t('home.deliveryInProgress')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container home-section home-section--categories">
        <span className="home-section__eyebrow">{t('home.browse')}</span>
        <h2>{t('home.categoriesTitle')}</h2>
        <div className="home-categories">
          {categories
            .filter((c) => !c.parent_id)
            .map((cat) => (
              <Link to={`/catalogue?category=${cat.slug}`} key={cat.id} className={`home-category-card home-category-card--${cat.slug} fade-in-up`}>
                <span className="home-category-card__icon">{CATEGORY_ICON_SVG[cat.slug] || CATEGORY_ICON_SVG.autres}</span>
                <span className="home-category-card__label">{t(`categories.${cat.slug}`, cat.nom)}</span>
                <span className="home-category-card__arrow">→</span>
              </Link>
            ))}
        </div>
      </section>

      {sponsorises.length > 0 && (
        <section className="container home-section">
          <span className="home-section__eyebrow">{t('home.notToMiss')}</span>
          <h2>{t('home.featuredOffers')}</h2>
          <div className="grid-products">
            {sponsorises.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} className="fade-in-up" />
            ))}
          </div>
        </section>
      )}

      <section className="container home-section">
        <div className="home-section__header">
          <div>
            <span className="home-section__eyebrow">{t('home.trending')}</span>
            <h2>{t('home.popularProducts')}</h2>
          </div>
          <Link to="/catalogue" className="home-section__link">{t('home.seeFullCatalogue')} →</Link>
        </div>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : populaires.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🌱</div>
            <p>{t('home.catalogueFilling')}</p>
          </div>
        ) : (
          <div className="grid-products">
            {populaires.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} className="fade-in-up" />
            ))}
          </div>
        )}
      </section>

      <section className="home-info">
        <div className="container">
          <span className="home-section__eyebrow home-section__eyebrow--light">{t('home.howItWorks')}</span>
          <h2 className="home-info__title">{t('home.trustTitle')}</h2>
          <div className="home-info__grid">
            <div className="home-info__card fade-in-up">
              <span className="home-info__number">01</span>
              <h3>{t('home.step1Title')}</h3>
              <p>{t('home.step1Text')}</p>
            </div>
            <div className="home-info__card fade-in-up">
              <span className="home-info__number">02</span>
              <h3>{t('home.step2Title')}</h3>
              <p>{t('home.step2Text')}</p>
            </div>
            <div className="home-info__card fade-in-up">
              <span className="home-info__number">03</span>
              <h3>{t('home.step3Title')}</h3>
              <p>{t('home.step3Text')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
