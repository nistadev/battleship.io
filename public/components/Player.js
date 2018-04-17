export default class Player {
	constructor(name){
		this.name = name;
		this.init();
	}

	getName(){
		return this.name;
	}

	setName(name){
		this.name = name;
	}

	init(){
		//Ready to play, false until player puts all his ships in the board and hit ready
		this.ready = false;

		//This is your board
		this.board = document.createElement("taulell-jugador");
		this.board.init();
		
		//The board you'll attack your enemy
		this.attackBoard = document.createElement("taulell-jugador");
		
		//Your ships
		this.vaixells = [
			document.createElement("vaixell-jugador"),
			document.createElement("vaixell-jugador"),
			document.createElement("vaixell-jugador"),
			document.createElement("vaixell-jugador")
		];

		this.contenidorVaixells = document.createElement("div");
		this.contenidorVaixells.id = "vaixells-a-posar";
		this.readyButton = document.createElement("button");
		this.readyButton.innerText = "I'm ready!";
		this.readyButton.style.display = "none";
		this.readyButton.id = "ready-button";

		this.readyButton.addEventListener("click", () => {
			if(!game.enemy) return console.log("Esperant que un altre jugador entri a la partida...");
			console.log("Apunt per comensar!");
			socket.emit("readyToPlay");
			this.ready = true;
			this.readyButton.remove();
		});

		this.vaixells.forEach((vaixell, index) => {
			vaixell.x = null;
			vaixell.y = null;
			vaixell.orientation = "h";
			vaixell.estat = "no-posat";
			
			if(index == 0 || index == 3)
				vaixell.longitud = 3;

			else if (index == 1)
				vaixell.longitud = 4;          

			else 
				vaixell.longitud = 2;          
			
			vaixell.vides = vaixell.longitud;

			this.contenidorVaixells.appendChild(vaixell);

		});

		this.board.parentElement.appendChild(this.contenidorVaixells);
		this.board.parentElement.appendChild(this.readyButton);

	}
}