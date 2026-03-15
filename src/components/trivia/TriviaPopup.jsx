import { useState, useEffect, useCallback, useRef } from 'react';
import { triviaService } from './TriviaService';
import { publicApi } from '../../services/api';
import { useSiteConfig } from '../../context/SiteConfigContext';
import '../../../styles/components/trivia-popup.css';

const CATEGORY_ICONS = {
  bandFact: '\u26A1',
  memberFact: '\uD83C\uDFB8',
  songTrivia: '\uD83C\uDFB5',
  venueStory: '\uD83C\uDFAB',
  classicRock: '\uD83C\uDFB8',
  tokyoMusic: '\uD83C\uDDEF\uD83C\uDDF5',
};

const MIN_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_INTERVAL = 7 * 60 * 1000; // 7 minutes
const DISPLAY_DURATION = 5000; // 5 seconds

export default function TriviaPopup() {
  const config = useSiteConfig();
  const [trivia, setTrivia] = useState(null);
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);
  const initializedRef = useRef(false);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const showTrivia = useCallback(() => {
    const item = triviaService.getRandomTrivia();
    setTrivia(item);
    setHiding(false);
    setVisible(true);

    // Auto-hide after display duration
    timeoutRef.current = setTimeout(() => {
      setHiding(true);
      setTimeout(() => {
        setVisible(false);
        setHiding(false);
      }, 400); // match animation duration
    }, DISPLAY_DURATION);
  }, []);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHiding(true);
    setTimeout(() => {
      setVisible(false);
      setHiding(false);
    }, 400);
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Initialize from config and load dynamic trivia
    triviaService.initFromConfig(config);
    const bandName = config.band.name;
    publicApi.getStats().then(stats => {
      triviaService.addDynamicTrivia(stats, bandName);
    }).catch(() => {});
    publicApi.getSongs().then(songs => {
      triviaService.addSongTrivia(songs, bandName);
    }).catch(() => {});

    // Show first trivia after 15 seconds
    const firstTimeout = setTimeout(showTrivia, 15000);

    // Schedule recurring trivia
    const scheduleNext = () => {
      const delay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
      intervalRef.current = setTimeout(() => {
        showTrivia();
        scheduleNext();
      }, delay);
    };

    // Start recurring after first one
    const scheduleStartTimeout = setTimeout(scheduleNext, 15000 + DISPLAY_DURATION + 1000);

    return () => {
      clearTimeout(firstTimeout);
      clearTimeout(scheduleStartTimeout);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [showTrivia]);

  if (!visible || !trivia) return null;

  const categoryClass = `trivia-popup--${trivia.category}`;
  const visClass = hiding ? 'trivia-popup--hiding' : 'trivia-popup--visible';
  const icon = CATEGORY_ICONS[trivia.category] || '\uD83C\uDFB5';

  return (
    <div
      className={`trivia-popup ${categoryClass} ${visClass}`}
      onClick={dismiss}
      role="status"
      aria-live="polite"
    >
      <div className="trivia-popup__content">
        <span className="trivia-popup__icon">{icon}</span>
        <span className="trivia-popup__text">{trivia.text}</span>
      </div>
    </div>
  );
}
