import { useApp } from '../state/AppContext';
import { useNav } from '../state/nav';
import Quiz from '../games/Quiz';
import Devine from '../games/Devine';
import Verite from '../games/Verite';
import Couple from '../games/Couple';

const GAMES = { quiz: Quiz, devine: Devine, verite: Verite, couple: Couple };

export default function GameHost({ id }) {
  const { langue, premium } = useApp();
  const { back } = useNav();
  const Game = GAMES[id];
  if (!Game || (id === 'couple' && !premium)) return null;   // le mode Couple n'est jouable que premium
  return <Game langue={langue} onRetour={back} />;
}
