/**
 * @author Asaf Gilboa
 * Black-Jack project script
 */



/*** Global variables ***/

// Arrays for card suits and ranks, named to match image file names
var suits =['_of_hearts','_of_diamonds','_of_clubs','_of_spades']; 
var rank = new Array(14);
rank[1] = "ace";
rank[11] = "jack";
rank[12] = "queen";
rank[13] = "king";
rank[0] = "joker"; // Not included in current release


var turnDraws; // Number of draws so far in round
var pHand; // Sum of card values in the player's hand
var dHand; // Sum of card values in the dealer's hand
var pAces; // Number of Aces in the player's hand
var dAces; // Number of Aces in the dealer's hand
var gameDeck; // Cards drawn so far in round
var badBet = 0; // Illegal bet attempt counter
var credit = 100; // Remaining player credit
var dealerMessage = document.getElementById("infoBox");



startGame();


/**
 * Starts a new game
 * Updates deck, buttons and message
 */
function startGame() {
    for (var i=2; i <= 10; i++) {
        rank[i] = i;
    }
    setBetBtns(); // Prepare buttons for bet phase
    document.getElementById("playerCredit").innerHTML = credit; // Update credit 
    // Update info bubble
    dealerMessage.innerHTML = "Please place your bet and press <b>Deal</b>.<br/> Let's have a good time :)";
}


/**
 * Makes sure the player has entered a valid bet value
 * and moves to draw phase if they did
 * Activated when player clicks 'Deal'
 */
function activate() {

    let roundBet; // current bet value
    roundBet = parseInt(document.getElementById("bet").value);
     
    // When the player runs out of credit
    if (credit <= 0) {
        dealerMessage.innerHTML = "You seem to be out of money. Exit is to your left, loser.";
        document.getElementById("bet").disabled = true;
        document.getElementById("dealBtn").disabled = true;
        document.getElementById("hitBtn").disabled = true;
        document.getElementById("holdBtn").disabled = true;
    } else {

        // Check that the player entered a valid bet value
        console.log(`bet = ${roundBet}`);
        if ( (roundBet <= 0) || (isNaN(roundBet)) ) {
            dealerMessage.innerHTML = "Please enter a bet in a positive number. smartass.";
        } else if (roundBet > credit) {
            dealerMessage.innerHTML = "You don't have enough money.<br/>Choose a lower bet and press <b>Deal</b>.";
        } else {
            drawPhase(); // If bet value is valid, enter draw phase
        }

        // In case player repeatedly enters illegal bet values
        badBet++;
        if (badBet > 4) {
            dealerMessage.innerHTML = "DON'T MAKE ME CALL SECURITY!<br/>Choose a legal bet.";  
        }
    }
    
}


/**
 * After bets are done, start the drawing phase
 * Initializes global variables and performs mandatory first draws
 */
function drawPhase() {

    // Info bubble message
    dealerMessage.innerHTML = `Press <b>Hit</b> to flip next card, for a total of five.<br/>Press <b>Stand</b> to end your turn.`

    // Enable draw buttons and disable bet buttons
    document.getElementById('hitBtn').disabled = false;
    document.getElementById('holdBtn').disabled = false;
    document.getElementById('dealBtn').disabled = true;
    document.getElementById('bet').disabled = true;

    // Initializes global variables
    turnDraws = 0;
    pHand = 0;
    dHand = 0;
    pAces = 0;
    dAces = 0;
    badBet = 0;
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`player${i}`).innerHTML = ``;
        document.getElementById(`dealer${i}`).innerHTML = ``;
    }

    // This is a 2d boolean array where card rank and suit are represented by the indexes
    // will keep track of cards drawn in round
    gameDeck = new Array(14);
    for (let j=1; j <=13; j++) {
        gameDeck[j] = new Array(4);
        for (let i=0; i <=3; i++) {
            gameDeck[j][i] = false;
        }
    }

    // Reset card animations
    let j = document.getElementsByClassName('cardClass');
    for (let i = 0; i < j.length; i++) {
        j[i].style.transform = 'none';
    }
    
    // Flip 1 card for the dealer and 2 for the player
    hitDealer(1);
    hitMe();
    hitMe();

    // If player gets 'Natural Blackjack', automatic win
    if (pHand == 21) {
        win(true);
    }
}


/**
 * Performs a single draw for the dealer
 * Activated when player clicks 'Hit'
 */
function hitMe() {
    
    turnDraws++; // Update turn counter
    let cardRank = flip(turnDraws, 'p'); // Randomly draw a card, present it and get its value

    // Update the dealer's hand worth so far
    if (cardRank == 1) { // Drew an Ace
        pAces++;
        pHand += 10;
    }
    if (cardRank <= 10) { // Drew a card between 2 and 9
        pHand += cardRank;
    } else {
        pHand += 10;
    }

   // Determine if aces should be 11 or 1
    if ( (pHand > 21) && (pAces > 0) ) {
        pAces = pAces -1;
        pHand = pHand - 10;
    }

    // Update scoreboard
    document.getElementById('playerScore').innerHTML = pHand;
    
    // Player hands passed value of 21
    if (pHand > 21 ) {
        lose();
    } else { // Conditions for ending player turn
        if ( ((pHand == 21) && (turnDraws > 2)) || (turnDraws >=5 ) ) {
            dealerTurn();
        }
    }
}


/**
 * Performs a full turn for the dealer
 * Activated when player clicks 'Stand'
 */
function dealerTurn() {
    dealerMessage.innerHTML = "</br></br>Dealer turn.";
    document.getElementById("hitBtn").disabled = true;
    document.getElementById("holdBtn").disabled = true;

    let draws = 2; // Number of draws

    // Keep drawing cards until dealer hands either beats player hand or reaches 5 cards
    while ((dHand < pHand) && (draws <= 5) ) {
        hitDealer(draws);
        draws++;
    }

    // Check who won
    setTimeout(function(){
        if ( (dHand < pHand) || (dHand > 21) ) {
            win(false);
        } else {
            lose();
        }
    }, 700 * (draws - 1)); 

}


/**
 * Performs a single draw for the dealer
 * 
 * @param {Number} drawNum - Which card draw is it this turn
 */
function hitDealer(drawNum) {

    let cardRank = flip(drawNum,`d`); // Randomly draw a card, present it and get its value

    // Update the dealer's hand worth so far
    if (cardRank == 1) { // Drew an Ace
        dAces++;
        dHand += 10;
    }
    if (cardRank <= 10) { // Drew a card between 2 and 9
        dHand += cardRank;
    } else {
        dHand += 10;
    }

    // Determine if aces should be 11 or 1
    if ( (dHand > 21) && (dAces > 0) ) {
        dAces = dAces -1;
        dHand = dHand - 10;
    }

    // Update the scoreboard
    // document.getElementById("dealerScore").innerHTML = dHand;
    setTimeout(function(){
        document.getElementById("dealerScore").innerHTML = dHand;
    }, 1000 * drawNum);    
    
}


/**
 * Performs a single card draw
 * Visually presents the card, and returns its value
 * 
 * @param {NUMBER} drawNum  - Which card draw is it this turn
 * @param {CHAR} side - Is it a player draw ('p') or a dealer draw ('d')
 */
function flip(drawNum, side) {

    // Randomize number and shape for a card that wasn't used yet
    let cardShape; 
    let cardRank; 
    do {
        cardShape = getRandom(4) - 1;
        cardRank = getRandom(13) ;
    } while (gameDeck[cardRank][cardShape]);

    // Update the deck with the newly drawn card
    gameDeck[cardRank][cardShape] = true;

    // Get the element to present the card
    let flipped = document.getElementsByClassName('cardClass');
    let cardIndex;
    if (side == `p`) {
        cardIndex = 4 + drawNum;
    } else {
        cardIndex = drawNum - 1;
    }


    // Animate the card drawn onto the board
    let widthFactor = 230;
    let flipSpace = 93;
    switch (true) {
        case ((window.innerWidth <= 1300) && (window.innerWidth > 960)):
            widthFactor = 170;
            flipSpace = 70;
            break;
        case ((window.innerWidth <= 960) && (window.innerWidth > 600)):
            widthFactor = 150;
            flipSpace = 50;
            break;
        case ((window.innerWidth <= 960) && (window.innerWidth > 600)):
            widthFactor = 100;
            flipSpace = 40;
            break;    
        default:
            break;
    }

    let delay = 0;
    if (side == `d`) {
        delay = 400 * (drawNum);
    }

    setTimeout(function(){
        let fullCard = "<img src='images/cards/" + (rank[cardRank] + suits[cardShape]) + ".png' class='card' >";
        flipped[cardIndex].innerHTML += fullCard; 
        flipped[cardIndex].style.transform = "translateX(" + (widthFactor + flipSpace * drawNum) + "px)";
        // console.log(`cclass: ${cardIndex} |card: ${rank[cardRank]} of ${suits[cardShape]} |side=${side}`);
    }, delay);
    

    return cardRank; // Returns the numerical value of the drawn card
}


/**
 * Activated when the dealer wins the round
 */
function lose() {

    setBetBtns(); // Disable/Enable buttons for a new round

    // Update remaining credit and prepare new round
    var b = parseInt(document.getElementById("bet").value);
    dealerMessage.innerHTML = "You lose! </br> Lost &#8362;" + b + ".<br/>";
    dealerMessage.innerHTML += "Please place your next bet and press <b>Deal</b>.";
    credit = credit - b;
    document.getElementById("playerCredit").innerHTML = credit;
}



/**
 * Activated when the player wins.
 * 
 * @param {Boolean} isBJ - True if player drew a 'Blackjack' (Ace + Royal)
 */
function win(isBJ) {
    
    setBetBtns(); // Disable/Enable buttons for a new round

    // Update remaining credit and prepare new round
    var b = parseInt(document.getElementById("bet").value);
    if (isBJ) {
        dealerMessage.innerHTML = "BLACKJACK!<br/> You win :D";
    } else {
        dealerMessage.innerHTML = "You win!";
    }
    dealerMessage.innerHTML += "</br>Gained &#8362;" + b + ".<br/>" + "Please place your next bet and press <b>Deal</b>.";
    credit = credit + b;
    document.getElementById("playerCredit").innerHTML = credit;

}


/**
 * Disable game buttons and enable bet buttons
 */
function setBetBtns() {   
    document.getElementById("hitBtn").disabled = true;
    document.getElementById("holdBtn").disabled = true;
    document.getElementById("bet").disabled = false;
    document.getElementById("dealBtn").disabled = false;
}


 /**
  * Returns a random interger between 1 and max
  * @param {*} max - Maximum range for the randomized number
  */
function getRandom(max) {
    var r = Math.random() * max + 1; // [1,max] 
    r = Math.floor(r);
    return r;
}
