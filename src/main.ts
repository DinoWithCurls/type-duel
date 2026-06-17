import GameModel from "./models/GameModel";
import GameView from "./views/GameView";
import ResultsView from "./views/ResultsView";
import GameController from "./controllers/GameController";
import './styles/main.css'
import './styles/game.css'
import './styles/results.css'


const init = () => {
  const root = document.getElementById('app') as HTMLElement;
  const gameModel = new GameModel();
  const gameView = new GameView(root);
  const resultsView = new ResultsView(root);

  const gameController = new GameController(gameModel, gameView, resultsView);

  gameController.init();
}

init();