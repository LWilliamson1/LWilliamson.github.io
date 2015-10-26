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
			for(var i=0; i < this.hand.length; i++){
				if(isNaN(this.hand[i]["value"])){
					if(this.hand[i]["value"]!="ACE"){
						this.score = this.score + 10;
					}
					else{
						aceCount++;
						this.score = this.score + 11;
					}
				}
				else{
					this.score = this.score + Number(this.hand[i]["value"]);
				}
				
			}
			while(this.score > 21 && aceCount > 0){
				this.score = this.score - 10;
				aceCount--;
			}
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
			//var self = this.showHand.bind(this);
			//setTimeout(self.showHand,2000);
			this.showHand();
			this.displayScore();
			
			if(this.score > 21 && this.type == "player"){
				endGame();
			}
		}
		
		this.showHand = function showHand() {
			var cardsToShow = this.hand.length;

			for(var i = this.cardCount; i < cardsToShow; i++){
				if(this.cardCount % 3 == 0 && this.cardCount != 0){
					$("#"+this.name+" tr").last().after("<tr><td><img src="+this.hand[i]["image"]+"></img></td>");
				}
				else{
					$("#"+this.name+" tr").last().append("<td><img src="+this.hand[i]["image"]+"></img></td>");
				}
			}
			
			this.cardCount = this.hand.length;
			
		}
	}

	Dealer.prototype = new Player();
	Dealer.prototype.constructor = Dealer;
	
	function Dealer(deckId){
		this.name = "Dealer";
		this.type = "dealer";
		this.hand = [];
		this.setFirstCardScore = function setFirstCardScore(){
			if(isNaN(this.hand[0]["value"])){
				if(this.hand[0]["value"]!="ACE"){
					this.score = this.score + 10;
				}
				else{
					this.score = this.score + 11;
				}
			}
			else{
				this.score = this.score + Number(this.hand[0]["value"]);
			}
			this.displayScore();
		}
		this.showFirstCard = function showFirstCard(){
			$("#"+this.name+" tr").last().after("<tr><td><img src="+this.hand[0]["image"]+"></img></td>");
			this.cardCount = 1;
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
		dealer.showHand();
		dealer.setScore();
		dealer.displayScore();
		
		while(dealer.score < 17 && dealer.score < 21){
			dealer.hit(deckId);	
		}
	}
	
	displayWinner = function(){
		dealer.displayScore();

		if(dealer.score > player.score && dealer.score <= 21 || player.score > 21){
			loseCount++;
			if(dealer.hand.length == 2 && dealer.score==21){
				$("#dealerStatus").html("BLACKJACK!").css("color", "gold");
				
			}
			else{
				$("#dealerStatus").html("Winner!");
			}
		}
		else if(player.score > dealer.score && player.score <= 21 || dealer.score > 21){
			winCount++;
			if(player.hand.length == 2 && player.score==21){
				$("#playerStatus").html("BLACKJACK!").css("color", "gold");
				
			}
			else{
				$("#playerStatus").html("Winner!");
			}
		}
		else{
			//
			$("#playerStatus").html("Push");
			$("#dealerStatus").html("Push");
		}
		$("#scoreCount").html(winCount+"-"+loseCount);
		console.log(dealer.hand);
		console.log(player.hand);
	}
	
	startGame = function() {
		
		draw(deck.id, player, 2);
		draw(deck.id, dealer, 2);

		player.showHand();
		dealer.showFirstCard();
		
		player.setScore();
		player.displayScore();
		
		dealer.setFirstCardScore();
		dealer.displayScore();
		dealer.setScore();
		
		if(player.score == 21 || dealer.score == 21){
			displayWinner(dealer,player);
			hit.prop("disabled",true);
			dealer.showHand();
			stay.prop("disabled",true);
			playAgain.removeClass("hidden");
			
		}
		
		
		
	
	}

	endGame = function() {
		playAgain.removeClass("hidden");
		hit.prop("disabled",true);
		dealer.showHand();
		stay.prop("disabled",true);
		playDealer(dealer, deck.id);
		displayWinner(dealer, player);
	}
	
	var deck;
	createNewDeck();
	
	if(deck.success){

		var player = new Player("player", "Player1", deck.id);	
		var dealer = new Dealer(deck.id);
	}
	else{
		//error message
	}
	var hit = $("#hit");
	var stay = $("#stay");
	var playAgain = $("#playAgain");
	var winCount = 0;
	var loseCount = 0;	
	
	startGame();
	
	hit.mouseup(function() {
		player.hit(deck.id);

	});
	stay.mouseup(function() {
		endGame();
	});
	playAgain.mouseup(function() {
		if(deck.remaining < 100){
			shuffleDeck(deck);
		}
			
		if(deck.success){
			playAgain.addClass("hidden");
			player = new Player("player", "Player1", deck.id);	
			dealer = new Dealer(deck.id);
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
