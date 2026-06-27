const LABELS = {
  en_attente: 'En attente', valide: 'Valide', refuse: 'Refuse', en_vente: 'En vente', suspendu: 'Suspendu',
  confirmee: 'Confirmee', en_preparation: 'En preparation', prise_en_charge: 'Prise en charge',
  en_transit: 'En transit', livree: 'Livree', annulee: 'Annulee', remboursee: 'Remboursee',
  demande: 'Demande', acceptee: 'Acceptee', refusee: 'Refusee', ramassage: 'Ramassage', echouee: 'Echouee',
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{LABELS[status] || status}</span>;
}
