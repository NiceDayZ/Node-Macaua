var host = false;
		var message;
		var socket = io.connect('http://localhost:3000');

		socket.on("redirect", function(){
			window.location.href = "/room-full.html";
		});

		const name = prompt("Enter your name");
		socket.emit('name', name);
		


		$("#chat-thing").submit(function(e) {
			e.preventDefault();
			message = $('#message').val();
			
			socket.emit('chat message', message);
			$('#message').val('');
			
		});

	//global variables
	var cardsToDraw = 0;
	var turnsToStay = 0;
	var hasToStay = false;
	var playerRank;
	var numberOfPlayersAtStart;
	var isTurn = false;
	var firstCard = false;
		
	$("#next").click(function(e){
		if((!firstCard && isTurn)||(turnsToStay > 0 && firstCard)){
			endTurn();
			if(turnsToStay>0) {
				turnsToStay--;
				hasToStay = true;
				if(turnsToStay == 0){
					hasToStay = false;
				}
			}
		}
	});//de pus exceptii
		
function endTurn(){
	socket.emit("next", {player: playerRank%numberOfPlayersAtStart+1,
						 cardsToDraw: cardsToDraw,
						 TurnsToStay: turnsToStay
						});
	isTurn = false;
	firstCard = false;
}
//Tell the library which element to use for the table
cards.init({table:'#card-table'});

//Create a new deck of cards
deck = new cards.Deck(); 

//By default it's in the middle of the container, put it slightly to the side
deck.x -= 50;

//cards.all contains all cards, put them all in the deck
deck.addCards(cards.all); 

//No animation here, just get the deck onto the table.
deck.render({immediate:true});

//Now lets create a couple of hands, one face down, one face up.
upperhand = new cards.Hand({faceUp:false, y:60});
lowerhand = new cards.Hand({faceUp:true, y:530});
lefthand = new cards.Hand({faceUp:false, y:150, x: 150});
rigthhand = new cards.Hand({faceUp:false, y:150, x: 650});




//Lets add a discard pile
discardPile = new cards.Deck({faceUp:true});
discardPile.x += 50;





function start(numberOfPlayers) {
	
	//Deck has a built in method to deal to hands.
	numberOfPlayersAtStart = numberOfPlayers;
	socket.emit("numberOfPlayersOnStart", numberOfPlayersAtStart)
	isTurn = true;
	firstCard = true;
	if(numberOfPlayers == 2){
	

		deck.deal(6, [upperhand, lowerhand], 50, function() {
			//This is a callback function, called when the dealing
			//is done
			for(var i=0; i<6;i++){
				socket.emit("start-cards-2", {card: lowerhand[i].shortName, playersRank: 1});
				socket.emit("start-cards-2", {card: upperhand[i].shortName, playersRank: 2});
			}

			discardPile.addCard(deck.topCard());
			discardPile.render();

			socket.emit("down-card", discardPile[0].shortName);

			socket.emit("render")
		
		});
	}
	else if(numberOfPlayers == 3){
		deck.deal(6, [upperhand, lowerhand,lefthand], 50, function() {
			//This is a callback function, called when the dealing
			//is done.
			for(var i=0; i<6;i++){
				socket.emit("start-cards-3", {card: lowerhand[i].shortName, playersRank: 1});
				socket.emit("start-cards-3", {card: upperhand[i].shortName, playersRank: 2});
				socket.emit("start-cards-3", {card: lefthand[i].shortName, playersRank: 3});	
			}


			discardPile.addCard(deck.topCard());
			discardPile.render();

			socket.emit("down-card", discardPile[0].shortName);

			socket.emit("render")
		
		});
	}
	else if(numberOfPlayers == 4){
		deck.deal(6, [upperhand, lowerhand,lefthand, rigthhand], 50, function() {
			//This is a callback function, called when the dealing
			//is done.
			
			for(var i=0; i<6;i++){
				socket.emit("start-cards-4", {card: lowerhand[i].shortName, playersRank: 1});
				socket.emit("start-cards-4", {card: rigthhand[i].shortName, playersRank: 2});
				socket.emit("start-cards-4", {card: upperhand[i].shortName, playersRank: 3});	
				socket.emit("start-cards-4", {card: lefthand[i].shortName, playersRank: 4});
			}


			discardPile.addCard(deck.topCard());
			discardPile.render();

			socket.emit("down-card", discardPile[0].shortName);

			socket.emit("render")
		
		});
	}
	//console.log(lowerhand);

	//socket.emit("hands", {upperhand: upperhand, lowerhand:lowerhand});
}
//When you click on the top card of a deck, a card is added
//to your hand

deck.click(function(card){
	if(isTurn && firstCard && turnsToStay == 0){
		if(cardsToDraw == 0){
			if (card === deck.topCard()) {
				lowerhand.addCard(deck.topCard());
				lowerhand.render();
			
				//modificat pentru n playeri		
				socket.emit("draw-card", {card: card.shortName, playersRank: playerRank});
				endTurn();
			}
				if(deck.length < 1){
					socket.emit("limita");
					while(discardPile.length > 1){
					deck.addCard(discardPile.lowerCard());
					console.log(discardPile.length);
					}deck.render();
					cards.shuffle(deck);
					deck.render();
			}
		}else{
			for(var i=1; i<=cardsToDraw; i++){
					if (card === deck.topCard()) {
					lowerhand.addCard(deck.topCard());
					lowerhand.render();
				
					//modificat pentru n playeri		
					socket.emit("draw-card", {card: card.shortName, playersRank: playerRank});
					
					}
					if(deck.length < 1){
						socket.emit("limita");
						while(discardPile.length > 1){
						deck.addCard(discardPile.lowerCard());
						console.log(discardPile.length);
						}deck.render();
						cards.shuffle(deck);
						deck.render();
					}
			}
			cardsToDraw = 0;
			endTurn();
		}
}
	
});


lowerhand.click(function(card){
	if(isTurn && firstCard && turnsToStay == 0){
		if (card.suit == discardPile.topCard().suit 
		||  card.rank == discardPile.topCard().rank) {
			
			discardPile.addCard(card);
			discardPile.render();
			lowerhand.render();
			
			socket.emit("card-put", {card: card.shortName, playersRank: playerRank});
			firstCard=false;
		}
	}else if(isTurn && !firstCard){
		if(card.rank == discardPile.topCard().rank){
			discardPile.addCard(card);
			discardPile.render();
			lowerhand.render();

			socket.emit("card-put", {card: card.shortName, playersRank: playerRank});
		}
	}
	
});




	socket.on("playerRank", function(rank){
		playerRank = rank;
		console.log(playerRank);
	});

	
	socket.on('name', function (name) {
		$('#members').empty();
		for(var i = 0; i< name.length; i++)
			$('#members').append(`<li id="member"><b>${name[i]}</b>`);
		
	});

	socket.on("chat message", function(message){
		$('#text-holder').append(message);
	});

	socket.on('start-game', function(numberOfPlayers){
		start(numberOfPlayers);
	});

	socket.on('test', function(card){
		
		discardPile.addCard(deck.findCard(card.charAt(0), card.substr(1)));
		discardPile.render();
	});

	socket.on('card', function(card){
		
		card.container = upperhand; 
		
		console.log(card);
		});

	socket.on("hands", function(hands){
		console.log(lowerhand);
		console.log(upperhand);
		deck.render();
	});

	//de modificat pentru 2 playeri
	socket.on("start-cards-2", function(cards){
		console.log("ceva");
		if(cards.playersRank == 1){
			upperhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
		}else{
			lowerhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
		}
	});
	//

	socket.on("start-cards-3", function(cards){
		if(playerRank == 2){
			if(cards.playersRank == 1){
				lefthand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if(cards.playersRank == 2){
				lowerhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if(cards.playersRank == 3){
				upperhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
		}
		else if(playerRank == 3){
			if(cards.playersRank == 1){
				upperhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if(cards.playersRank == 2){
				lefthand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if(cards.playersRank == 3){
				lowerhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
		}
	});

	socket.on("start-cards-4", function(cards){
		console.log("ceva");
		if(playerRank == 2){
			if(cards.playersRank == 1){
				lefthand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if(cards.playersRank == 2){
				lowerhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if(cards.playersRank == 3){
				rigthhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if( cards.playersRank == 4){
				upperhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
		}
		else if(playerRank == 3){
			if(cards.playersRank == 1){
				upperhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if(cards.playersRank == 2){
				lefthand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if(cards.playersRank == 3){
				lowerhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if(cards.playersRank == 4){
				rigthhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
		}
		else if(playerRank == 4){
			if(cards.playersRank == 1){
				rigthhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if(cards.playersRank == 2){
				upperhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if(cards.playersRank == 3){
				lefthand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
			else if(cards.playersRank == 4){
				lowerhand.addCard(deck.findCard(cards.card.charAt(0), cards.card.substr(1)));
			}
		}
	});

	socket.on("card-put", function(cardAndPlayer){
		if(numberOfPlayersAtStart == 2){
			addCardToDiscardPile(upperhand, cardAndPlayer.card);
		}
		else if(numberOfPlayersAtStart == 3){
			if(playerRank == 1){
				if(cardAndPlayer.playersRank == 2){
					addCardToDiscardPile(upperhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 3){
					addCardToDiscardPile(lefthand, cardAndPlayer.card)
				}
			}else if(playerRank == 2){
				if(cardAndPlayer.playersRank == 1){
					addCardToDiscardPile(lefthand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 3){
					addCardToDiscardPile(upperhand, cardAndPlayer.card);
				}
			}else if(playerRank == 3){
				if(cardAndPlayer.playersRank == 1){
					addCardToDiscardPile(upperhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 2){
					addCardToDiscardPile(lefthand, cardAndPlayer.card);
				}
			}
		}
		else if(numberOfPlayersAtStart == 4){
			if(playerRank == 1){
				if(cardAndPlayer.playersRank == 2){
					addCardToDiscardPile(rigthhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 3){
					addCardToDiscardPile(upperhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 4){
					addCardToDiscardPile(lefthand, cardAndPlayer.card);
				}
			}else if(playerRank == 2){
				if(cardAndPlayer.playersRank == 1){
					addCardToDiscardPile(lefthand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 3){
					addCardToDiscardPile(rigthhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 4){
					addCardToDiscardPile(upperhand, cardAndPlayer.card);
				}
			}else if(playerRank == 3){
				if(cardAndPlayer.playersRank == 1){
					addCardToDiscardPile(upperhand, cardAndPlayer.card)
				}else if(cardAndPlayer.playersRank == 2){
					addCardToDiscardPile(lefthand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 4){
					addCardToDiscardPile(rigthhand, cardAndPlayer.card);
				}
			}else if(playerRank == 4){
				if(cardAndPlayer.playersRank == 1){
					addCardToDiscardPile(rigthhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 2){
					addCardToDiscardPile(upperhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 3){
					addCardToDiscardPile(lefthand, cardAndPlayer.card);
				}
			}
		}
	});

	//draw a card

	socket.on("draw-card", function(cardAndPlayer){
		if(numberOfPlayersAtStart == 2){
			addCardToHandFromDeck(upperhand, cardAndPlayer.card);
		}
		else if(numberOfPlayersAtStart == 3){
			if(playerRank == 1){
				if(cardAndPlayer.playersRank == 2){
					addCardToHandFromDeck(upperhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 3){
					addCardToHandFromDeck(lefthand, cardAndPlayer.card)
				}
			}else if(playerRank == 2){
				if(cardAndPlayer.playersRank == 1){
					addCardToHandFromDeck(lefthand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 3){
					addCardToHandFromDeck(upperhand, cardAndPlayer.card);
				}
			}else if(playerRank == 3){
				if(cardAndPlayer.playersRank == 1){
					addCardToHandFromDeck(upperhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 2){
					addCardToHandFromDeck(lefthand, cardAndPlayer.card);
				}
			}
		}
		else if(numberOfPlayersAtStart == 4){
			if(playerRank == 1){
				if(cardAndPlayer.playersRank == 2){
					addCardToHandFromDeck(rigthhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 3){
					addCardToHandFromDeck(upperhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 4){
					addCardToHandFromDeck(lefthand, cardAndPlayer.card);
				}
			}else if(playerRank == 2){
				if(cardAndPlayer.playersRank == 1){
					addCardToHandFromDeck(lefthand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 3){
					addCardToHandFromDeck(rigthhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 4){
					addCardToHandFromDeck(upperhand, cardAndPlayer.card);
				}
			}else if(playerRank == 3){
				if(cardAndPlayer.playersRank == 1){
					addCardToHandFromDeck(upperhand, cardAndPlayer.card)
				}else if(cardAndPlayer.playersRank == 2){
					addCardToHandFromDeck(lefthand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 4){
					addCardToHandFromDeck(rigthhand, cardAndPlayer.card);
				}
			}else if(playerRank == 4){
				if(cardAndPlayer.playersRank == 1){
					addCardToHandFromDeck(rigthhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 2){
					addCardToHandFromDeck(upperhand, cardAndPlayer.card);
				}else if(cardAndPlayer.playersRank == 3){
					addCardToHandFromDeck(lefthand, cardAndPlayer.card);
				}
			}
		}
	});

	function addCardToDiscardPile(hand, card){
		discardPile.addCard(hand.findCard(card.charAt(0), card.substr(1)));
		hand.render();
		discardPile.render();
	}
	function addCardToHandFromDeck(hand, card){
		hand.addCard(deck.findCard(card.charAt(0), card.substr(1)));
		deck.render();
		hand.render();
	}

	socket.on("numberOfPlayersOnStart", function(number){
		numberOfPlayersAtStart = number;
	});

	socket.on("down-card", function(card){
		discardPile.addCard(deck.findCard(card.charAt(0), card.substr(1)));
	});

	socket.on("next", function(playerInfo){
		if(playerRank == playerInfo.player){
			isTurn = true;
			firstCard = true;
			cardsToDraw = playerInfo.cardsToDraw;
			turnsToStay = playerInfo.TurnsToStay;
		}
	});

	socket.on("upperhand-draw", function(card){
		upperhand.addCard(deck.findCard(card.charAt(0), card.substr(1)));
		deck.render();
		upperhand.render();
	});

	socket.on("render", function(){
		deck.render();
		upperhand.render();
		lowerhand.render();
		if(lefthand.length > 0)
			lefthand.render();
		if(lefthand.length > 0)
			rigthhand.render();	
		discardPile.render();
	});

	socket.on("limita", function(){
		while(discardPile.length > 1){
			deck.addCard(discardPile.lowerCard());
			console.log(discardPile.length);
			}
			deck.render();
			cards.shuffle(deck);
			deck.render();
	});