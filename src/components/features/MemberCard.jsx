import '../../../styles/components/member-card.css';

export default function MemberCard({ member }) {
  // Get current instruments from most recent stint
  const currentStint = member.stints
    ?.filter(s => !s.endDate)
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];

  const instruments = currentStint?.instruments || [];
  const startYear = currentStint ? new Date(currentStint.startDate).getFullYear() : null;

  return (
    <div className="member-card">
      {member.imageUrl ? (
        <img
          src={member.imageUrl}
          alt={member.name}
          className="member-card__image"
          loading="lazy"
        />
      ) : (
        <div className="member-card__placeholder">
          {member.name?.charAt(0) || '?'}
        </div>
      )}

      <div className="member-card__body">
        {member.isGuest && (
          <span className="member-card__guest-badge">Guest</span>
        )}
        <h3 className="member-card__name">{member.name}</h3>
        {instruments.length > 0 && (
          <div className="member-card__instruments">
            {instruments.join(' / ')}
          </div>
        )}
        {startYear && (
          <div className="member-card__stint">
            Since {startYear}
          </div>
        )}
        {member.notes && (
          <p className="member-card__notes">{member.notes}</p>
        )}
      </div>
    </div>
  );
}
