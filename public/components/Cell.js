export default class Casella extends HTMLElement {
  constructor(){
    super();
    this.addEventListener("click", this.fesAccio);
  }

  fesAccio(){
    if(!game.started){
      //Joc no comensat, posant vaixells

      //Si no en tenim cap posant-se i el volem cambiar de posicio
      if(vaixellColocantse === null) {
        if(!this.vaixell || jugador.ready) return;
        this.vaixell.changePosition();
        this.estat = "buit";
        return;
      }

      //If ship fits and not collide, assign position and paint cells, also check if all ships have been placed
      if(!checkCollision(this, vaixellColocantse.long, vaixellColocantse.orientation)){
        vaixellColocantse.setPosition(this.x, this.y);

        if(vaixellColocantse.orientation == "h"){

          for(let nrSiblingCell = 0; nrSiblingCell < vaixellColocantse.long; nrSiblingCell++){
            jugador.board.cells[vaixellColocantse.y][vaixellColocantse.x + nrSiblingCell].vaixell = vaixellColocantse;
            jugador.board.cells[vaixellColocantse.y][vaixellColocantse.x + nrSiblingCell].estat = "vaixell";
          }

          vaixellColocantse = null;

        } else if(vaixellColocantse.orientation == "v"){

          for(let nrSiblingCell = 0; nrSiblingCell < vaixellColocantse.long; nrSiblingCell++){
            jugador.board.cells[vaixellColocantse.y + nrSiblingCell][vaixellColocantse.x].vaixell = vaixellColocantse;
            jugador.board.cells[vaixellColocantse.y + nrSiblingCell][vaixellColocantse.x].estat = "vaixell";
          }

          vaixellColocantse = null;

        } else if(vaixellColocantse.orientation == "dr"){
              
          for(let nrSiblingCell = 0; nrSiblingCell < vaixellColocantse.long; nrSiblingCell++){
            jugador.board.cells[vaixellColocantse.y + nrSiblingCell][vaixellColocantse.x + nrSiblingCell].vaixell = vaixellColocantse;
            jugador.board.cells[vaixellColocantse.y + nrSiblingCell][vaixellColocantse.x + nrSiblingCell].estat = "vaixell";
          }

          vaixellColocantse = null;

        } else if(vaixellColocantse.orientation == "dl"){

          for(let nrSiblingCell = 0; nrSiblingCell < vaixellColocantse.long; nrSiblingCell++){
            jugador.board.cells[vaixellColocantse.y + nrSiblingCell][vaixellColocantse.x - nrSiblingCell].vaixell = vaixellColocantse;
            jugador.board.cells[vaixellColocantse.y + nrSiblingCell][vaixellColocantse.x - nrSiblingCell].estat = "vaixell";
          }

          vaixellColocantse = null;

        }

        
        let totsPosats = true;

        jugador.vaixells.forEach((vaixell) => {
          if(vaixell.status !== "posat")
            totsPosats = false;
        });

        if(totsPosats) 
          jugador.board.parentElement.lastElementChild.style.display = "block";
        else 
          jugador.board.parentElement.lastElementChild.style.display = "none";
      }

      
      
    } else if(game.started && (!game.playerTurn != jugador)){
      //Joc comensat i no es el seu torn, tornem
      return;
    } else {
      //Atacar
      //this.ataca;
      return;
    }
  }

  set estat(newStatus){
    this.setAttribute("data-status", newStatus);
    this.status = newStatus;
  }

}