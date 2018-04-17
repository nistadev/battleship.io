export default class Board extends HTMLElement {
  constructor(){
    super();
    this.size = 8;
    this.cells = [];
  }

  init(attackBoard = false){
    
    let contenidorTaulell;
    this.attackBoard = attackBoard;
    
    for (let row = 0; row < this.size; row++) {
      this.cells[row] = [];
      for (let column = 0; column < this.size; column++) {
        let cell = document.createElement("casella-taulell");
        cell.x = column;
        cell.y = row;
        cell.vaixell = null;
        cell.estat = "buit";
        this.appendChild(cell);
        this.cells[row][column] = cell;
      }
    }

    if(!this.attackBoard){
      contenidorTaulell = document.createElement("div");
      contenidorTaulell.className = "taulell-i-vaixells";
      contenidorTaulell.appendChild(this);
    } else {
      contenidorTaulell = this;
    }
    
    // Despres de popular els taulells, els posem al document
    let container = document.getElementById("container");
    container.insertBefore(contenidorTaulell, container.firstChild);
  }

}