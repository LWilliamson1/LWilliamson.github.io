$(document).ready(function() {

	function Deck(id, remaining, success, shuffled){
		this.id = id;
		this.remaining = remaining;
		this.success = success;
		this.shuffled = shuffled;
	}

	function Player(type, name, deckId) {
		this.type = type;
		this.name = name;
		this.score = 0;
		this.cardCount = 0;
		this.hand = [];
		this.setScore = function setScore(){
			this.score = 0;
			var aceCount = 0;
			var countNum = this.hand.length;
			var oneCardScore = 0;
			var twoCardScore = 0;
			if(this.type == "dealer" && this.cardCount==0){
				countNum = 1;
			}
			
			for(var i=0; i < countNum; i++){
				if(isNaN(this.hand[i]["value"])){
					if(this.hand[i]["value"]!="ACE"){
						this.score = this.score + 10;
					}
					else{
						aceCount++;
						this.score = this.score + 11;
						/*
						if(this.score <= 10){
							this.score = this.score + 11;
						}
						else{
							this.score = this.score + 1;
						}*/
					}
				}
				else{
					this.score = this.score + Number(this.hand[i]["value"]);
				}
				if(this.type=="dealer" && this.cardCount==0){
					if(oneCardScore == 0){
						oneCardScore = this.score;
						if(oneCardScore > 9){
							countNum++;
						}
					}
					if(oneCardScore!=0 && this.score == 21){
						//this.cardCount = 2;
						displayWinner();
					}
					else{
						this.score=oneCardScore;
					}
				}
				
				
			}
			while(this.score > 21 && aceCount > 0){
				this.score = this.score - 10;
				aceCount--;
			}
			this.displayScore();
		}
		this.getScore = function getScore(){	
			return this.score;	
		}
		this.displayScore = function displayScore(){
			$("#"+this.type+"Status").html("Count:"+this.score);
		}
		
		this.bust = function bust(){
			$("#"+this.type+"Status").html("Bust");
			busted();
		}
		this.hit = function hit(deckId){
			draw(deckId, this, 1);
			this.setScore();
			this.showHand();
			
			if(this.score > 21){
				this.bust();
			}
		}
		
		this.showHand = function showHand() {
			var cardsToShow = this.hand.length;
			if(this.type=="dealer" && cardsToShow == 2){
				cardsToShow = 1;
			}
			
			for(var i = this.cardCount; i < cardsToShow; i++){
				if(this.cardCount % 3 == 0 && this.cardCount != 0){
					$("#"+this.name+" tr").last().after("<tr><td><img src="+this.hand[i]["image"]+"></img></td>");
				}
				else{
					$("#"+this.name+" tr").last().append("<td><img src="+this.hand[i]["image"]+"></img></td>");
				}
			}
			if(this.cardCount==0 && this.type == "player"){
				this.cardCount = 2;
			}
			else{
				this.cardCount++;
			}
		}
	}

	createNewDeck = function () {
		var newDeck = new XMLHttpRequest();
		var url = "http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6";
		newDeck.open("GET", url, false);
		newDeck.send();
		newDeck = JSON.parse(newDeck.responseText);
		deck = new Deck(newDeck["deck_id"], newDeck["remaining"],newDeck["success"], newDeck["shuffled"]);

	}

	shuffleDeck = function (deck) {
		var shuffle = new XMLHttpRequest();
		var url = "http://deckofcardsapi.com/api/deck/"+deck.id+"/shuffle/";
		shuffle.open("GET", url, false);
		shuffle.send();
		var newDeck = JSON.parse(newDeck.responseText);
		deck = new Deck(newDeck["deck_id"], newDeck["remaining"],newDeck["success"], newDeck["shuffled"]);
	}
	
	draw = function (id, player, count) {

		var draw = new XMLHttpRequest();
		var url = "http://deckofcardsapi.com/api/deck/"+id+"/draw/?count="+count;
		draw.open("GET", url, false);
		draw.send();
		var hand = player.hand;
		var cards = JSON.parse(draw.responseText)["cards"]

		for(var i=0; i < cards.length; i++){
			hand.push(cards[i]);
		}
		player.hand = hand;
		return JSON.parse(draw.responseText);
	}
	
	addToHand = function(id, player, cards){
		var pile = new XMLHttpRequest();
		var url = "http://deckofcardsapi.com/api/deck/"+id+"/pile/"+player.name+"/add/?cards="+hand;
		pile.open("GET", url, false);
		pile.send();
		console.log(JSON.parse(pile.responseText));

		return JSON.parse(pile.responseText);			
	}
	
	
	playDealer = function(dealer, deckId){	 
		dealer.setScore();
		while(dealer.score < 17 && dealer.score < 21){
			dealer.hit(deckId);
			setTimeout(function(){
			},1000);
		}
	}
	
	displayWinner = function(){
		dealer.showHand();
		console.log(player.score);
		console.log(dealer.score);
		if(dealer.score > player.score && dealer.score <= 21 || player.score > 21){
			if(dealer.hand.length == 2 && dealer.score==21){
				$("#dealerStatus").html("BLACKJACK!").css("color", "gold");
			}
			else{
				$("#dealerStatus").html("Winner!");
			}
		}
		else if(player.score > dealer.score && player.score <= 21 || dealer.score > 21){
			if(player.hand.length == 2 && player.score==21){
				$("#playerStatus").html("BLACKJACK!").css("color", "gold");
				
			}
			else{
				$("#playerStatus").html("Winner!");
			}
		}
		else{
			//push
			$("#playerStatus").html("Push");
			$("#dealerStatus").html("Push");
		}
		
		console.log(dealer.hand);
		console.log(player.hand);
	}
	busted = function(){
		displayWinner(dealer, player);
		hit.prop("disabled",true);
		dealer.showHand();
		stay.prop("disabled",true);
		playAgain.removeClass("hidden");
	}
	
	startGame = function() {
		
		draw(deck.id, player, 2);
		draw(deck.id, dealer, 2);

		player.showHand();
		dealer.showHand();
		
		player.setScore();
		dealer.setScore();
		
		if(player.score == 21){
			displayWinner(dealer,player);
			hit.prop("disabled",true);
			dealer.showHand();
			stay.prop("disabled",true);
			playAgain.removeClass("hidden");
			
		}
		
		
		
	
	}

	var deck;
	createNewDeck();
	
	if(deck.success){

		var player = new Player("player", "Player1", deck.id);	
		var dealer = new Player("dealer", "Dealer");
	}
	else{
		//error message
	}
	var hit = $("#hit");
	var stay = $("#stay");
	var playAgain = $("#playAgain");
	
	startGame();
	
	hit.mouseup(function() {
		player.hit(deck.id);

	});
	stay.mouseup(function() {
		playAgain.removeClass("hidden");
		hit.prop("disabled",true);
		dealer.showHand();
		stay.prop("disabled",true);
		playDealer(dealer, deck.id);
		displayWinner(dealer, player);
	});
	playAgain.mouseup(function() {
		if(deck.remaining < 100){
			shuffleDeck(deck);
		}
			
		if(deck.success){
			playAgain.addClass("hidden");
			player = new Player("player", "Player1", deck.id);	
			dealer = new Player("dealer", "Dealer", deck.id);
			hit.prop("disabled",false);
			stay.prop("disabled",false);
			$(".table").html("<tr></tr>");
			$("#playerStatus").css("color", "#F7FCF8");
			$("#dealerStatus").css("color", "#F7FCF8");
		}
		else{
			//error message
		}
		
		
		startGame();
	});
});
