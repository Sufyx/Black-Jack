/**
* Black-Jack project
* Asaf Gilboa
 */


// Arrays for card suits and ranks, named to match image file names
var suits = ['_of_hearts', '_of_diamonds', '_of_clubs', '_of_spades'];
var rank = new Array(14);
rank[1] = "ace";
rank[11] = "jack";
rank[12] = "queen";
rank[13] = "king";
rank[0] = "joker"; // Currently not included

var turnDraws; // Number of draws so far in round
var pHand; // Sum of card values in the player's hand
var dHand; // Sum of card values in the dealer's hand
var pAces; // Number of Aces in the player's hand
var dAces; // Number of Aces in the dealer's hand
var gameDeck; // Cards drawn so far in round
var badBet = 0; // Illegal bet attempt counter
var credit = 100; // Remaining player credit
var dealerMessage = document.getElementById("infoBox");


/**
 * Disable game buttons and enable bet buttons
 */
function setBetBtns() {
    document.getElementById("hitBtn").disabled = true;
    document.getElementById("holdBtn").disabled = true;
    document.getElementById("bet").disabled = false;
    document.getElementById("dealBtn").disabled = false;
}


startGame();
function startGame() {
    for (var i = 2; i <= 10; i++) {
        rank[i] = i;
    }
    setBetBtns();
    document.getElementById("playerCredit").innerHTML = credit;
    dealerMessage.innerHTML = "Please place your bet and press <b style='color:blue;'>Deal</b>.<br/> Let's have a good time :)";
}

/**
 * "Deal" button click handler"
 */
function dealClick() {
    let roundBet;
    roundBet = parseInt(document.getElementById("bet").value);

    if (credit <= 0) {
        dealerMessage.innerHTML = 'You seem to be out of "money" ...';
        document.getElementById("bet").disabled = true;
        document.getElementById("dealBtn").disabled = true;
        document.getElementById("hitBtn").disabled = true;
        document.getElementById("holdBtn").disabled = true;
    } else {
        if ((roundBet <= 0) || (isNaN(roundBet))) {
            dealerMessage.innerHTML = "Please enter a bet in a positive number.";
        } else if (roundBet > credit) {
            dealerMessage.innerHTML = "You don't have enough money.<br/>Choose a lower bet and press <b style='color:blue;'>Deal</b>.";
        } else {
            drawPhase();
        }
        badBet++;
        if (badBet > 4) {
            dealerMessage.innerHTML = " . . . <br/>choose a legal bet.";
        }
    }
}


function drawPhase() {
    dealerMessage.innerHTML = `Press <b style='color:green;'>Hit</b> to flip next card, 
        for a maximum of five.<br/>Press <b style='color:red;'>Stand</b> to end your turn.`

    document.getElementById('hitBtn').disabled = false;
    document.getElementById('holdBtn').disabled = false;
    document.getElementById('dealBtn').disabled = true;
    document.getElementById('bet').disabled = true;

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

    // Keeps track of cards drawn so far in current round
    gameDeck = new Array(14);
    for (let j = 1; j <= 13; j++) {
        gameDeck[j] = new Array(4);
        for (let i = 0; i <= 3; i++) {
            gameDeck[j][i] = false;
        }
    }

    let cards = document.getElementsByClassName('cardClass');
    for (let i = 0; i < cards.length; i++) {
        cards[i].style.transform = 'none';
    }

    hitDealer(1);
    hitMe();
    hitMe();
    if (pHand == 21) {
        win(true);
    }
}


/**
 * Player card flip
 */
function hitMe() {
    turnDraws++; 
    let cardRank = flip(turnDraws, 'p');

    // Update player hand
    if (cardRank == 1) {
        pAces++;
        pHand += 10;
    }
    if (cardRank <= 10) {
        pHand += cardRank;
    } else {
        pHand += 10;
    }
    if ((pHand > 21) && (pAces > 0)) {
        pAces = pAces - 1;
        pHand = pHand - 10;
    }

    document.getElementById('playerScore').innerHTML = pHand;

    if (pHand > 21) {
        lose();
    } else { // Conditions for ending player turn
        if (((pHand == 21) && (turnDraws > 2)) || (turnDraws >= 5)) {
            dealerTurn();
        }
    }
}

/**
 * Dealer card flip
 */
function hitDealer(drawNum) {
    let cardRank = flip(drawNum, `d`);

    if (cardRank == 1) { 
        dAces++;
        dHand += 10;
    }
    if (cardRank <= 10) { 
        dHand += cardRank;
    } else {
        dHand += 10;
    }

    if ((dHand > 21) && (dAces > 0)) {
        dAces = dAces - 1;
        dHand = dHand - 10;
    }

    setTimeout(function () {
        document.getElementById("dealerScore").innerHTML = dHand;
    }, 1000 * drawNum);
}


function dealerTurn() {
    dealerMessage.innerHTML = "</br></br>Dealer turn.";
    document.getElementById("hitBtn").disabled = true;
    document.getElementById("holdBtn").disabled = true;

    let draws = 2;
    while ((dHand < pHand) && (draws <= 5)) {
        hitDealer(draws);
        draws++;
    }

    setTimeout(function () {
        if ((dHand < pHand) || (dHand > 21)) {
            win(false);
        } else {
            lose();
        }
    }, 700 * (draws - 1));
}


/**
 * Single card flip/draw
 */
function flip(drawNum, side) {
    let cardShape;
    let cardRank;
    do {
        cardShape = getRandom(4) - 1;
        cardRank = getRandom(13);
    } while (gameDeck[cardRank][cardShape]);
    gameDeck[cardRank][cardShape] = true;

    let flipped = document.getElementsByClassName('cardClass');
    let cardIndex;
    if (side == `p`) {
        cardIndex = 4 + drawNum;
    } else {
        cardIndex = drawNum - 1;
    }

    // Animate card draw
    let widthFactor = 160;
    let flipSpace = 45;
    switch (true) {
        case ((window.innerWidth <= 1300) && (window.innerWidth > 960)):
            widthFactor = 150;
            flipSpace = 40;
            break;
        case ((window.innerWidth <= 960) && (window.innerWidth > 600)):
            widthFactor = 120;
            flipSpace = 15;
            break;
        case ((window.innerWidth <= 600)):
            widthFactor = 100;
            flipSpace = 5;
            break;
        default:
            break;
    }
    let delay = 400;
    if (side == `d`) {
        delay += 400 * (drawNum);
    }
    setTimeout(function () {
        let fullCard = "<img src='images/cards/" + (rank[cardRank] + suits[cardShape]) + ".png' class='card' >";
        flipped[cardIndex].innerHTML += fullCard;
        flipped[cardIndex].style.transform = "translateX(" + (widthFactor + flipSpace * drawNum) + "px)";
    }, delay);

    return cardRank;
}


function lose() {
    setBetBtns(); 
    var b = parseInt(document.getElementById("bet").value);
    dealerMessage.innerHTML = "You lose! </br> Lost &#8362;" + b + ".<br/>";
    dealerMessage.innerHTML += "Please place your next bet and press <b style='color:blue;'>Deal</b>.";
    credit = credit - b;
    document.getElementById("playerCredit").innerHTML = credit;
}


function win(isBJ) {
    setBetBtns();
    var b = parseInt(document.getElementById("bet").value);
    if (isBJ) {
        dealerMessage.innerHTML = "BLACKJACK!<br/> You win :D";
    } else {
        dealerMessage.innerHTML = "You win!";
    }
    dealerMessage.innerHTML += "</br>Gained &#8362;" + b + ".<br/>" + "Please place your next bet and press <b style='color:blue;'>Deal</b>.";
    credit = credit + b;
    document.getElementById("playerCredit").innerHTML = credit;
}


function getRandom(max) {
    var r = Math.random() * max + 1; // [1,max] 
    r = Math.floor(r);
    return r;
}
