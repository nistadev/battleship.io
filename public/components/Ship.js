export default class Ship extends HTMLElement {
	constructor() {
		super();
		this.addEventListener("click", this.canviaEstat);
	}

	set estat(newStatus) {
		this.setAttribute("data-status", newStatus);
		this.status = newStatus;
	}

	set longitud(newWidth) {
		this.long = newWidth;
		this.setAttribute("data-width", newWidth);
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
		this.setAttribute("data-status","posat");
		this.status = "posat";
	}

	canviaEstat(){
		if(this.status === "no-posat"){
			
			this.setAttribute("data-status", "posant");
			this.status = "posant";
			
			this.setAttribute("data-orientation", "horizontal");
			this.orientation = "h";
			
			jugador.vaixells.forEach((vaixell) => {
				if(!(this === vaixell)){
					if(vaixell.status !== "posat"){
						vaixell.resetStatus();
					}
				}
			});

			vaixellColocantse = this;

		} else if(this.status === "posant"){

			this.setAttribute("data-status", "no-posat");
			this.status = "no-posat";
			
			vaixellColocantse = null;

		} else if(this.status === "posat" && !game.started){
			
			this.setAttribute("data-status", "posant");
			this.status = "posant";
		
		} else {
			return;
		}
	}

	canviaOrientacio(){
		if(this.orientation == "h"){
			this.setAttribute("data-orientation", "vertical");
			this.orientation = "v";
		} else if(this.orientation == "v"){
			this.setAttribute("data-orientation", "diagonal-right");
			this.orientation = "dr";
		} else if(this.orientation == "dr"){
			this.setAttribute("data-orientation", "diagonal-left");
			this.orientation = "dl";
		} else if(this.orientation == "dl"){
			this.setAttribute("data-orientation", "horizontal");
			this.orientation = "h";
		}
	}

	resetStatus(){
		this.setAttribute("data-status","no-posat");
		this.setAttribute("data-orientation","null");
		this.orientation = null;
		this.status = "no-posat";
		this.style.position = "relative";
		this.style.left = "0px";
		this.style.top = "0px";
	}

	changePosition(){
		this.setAttribute("data-status","posant");
		this.status = "posant";
		vaixellColocantse = this;
		if(this.orientation == "h"){
			for(let nrSiblingCell = 0; nrSiblingCell < this.long; nrSiblingCell++){
				jugador.board.cells[this.y][this.x + nrSiblingCell].vaixell = null;
				jugador.board.cells[this.y][this.x + nrSiblingCell].estat = "buit";
			}
		}
		else if(this.orientation == "v"){
			for(let nrSiblingCell = 0; nrSiblingCell < this.long; nrSiblingCell++){
				jugador.board.cells[this.y + nrSiblingCell][this.x].vaixell = null;
				jugador.board.cells[this.y + nrSiblingCell][this.x].estat = "buit";
			}
		}
		else if(this.orientation == "dr"){
			for(let nrSiblingCell = 0; nrSiblingCell < this.long; nrSiblingCell++){
				jugador.board.cells[this.y + nrSiblingCell][this.x + nrSiblingCell].vaixell = null;
				jugador.board.cells[this.y + nrSiblingCell][this.x + nrSiblingCell].estat = "buit";
			}
		}
		else if(this.orientation == "dl"){
			for(let nrSiblingCell = 0; nrSiblingCell < this.long; nrSiblingCell++){
				jugador.board.cells[this.y + nrSiblingCell][this.x - nrSiblingCell].vaixell = null;
				jugador.board.cells[this.y + nrSiblingCell][this.x - nrSiblingCell].estat = "buit";
			}
		}
	}
}