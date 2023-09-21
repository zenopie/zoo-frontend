document.getElementById("rules-nav").addEventListener("click", async() => {
    document.getElementById("table-nav").classList.remove("active");
    document.getElementById("rules-nav").classList.add("active");
	document.getElementById("history-nav").classList.remove("active");
    document.getElementById("blackjack-table").classList.add("remove");
    document.getElementById("show-rules").classList.remove("remove");
	document.getElementById("history-box").classList.add("remove");
});

document.getElementById("table-nav").addEventListener("click", async() => {
    document.getElementById("table-nav").classList.add("active");
    document.getElementById("rules-nav").classList.remove("active");
	document.getElementById("history-nav").classList.remove("active");
    document.getElementById("blackjack-table").classList.remove("remove");
    document.getElementById("show-rules").classList.add("remove");
	document.getElementById("history-box").classList.add("remove");
});
document.getElementById("history-nav").addEventListener("click", async() => {
    document.getElementById("table-nav").classList.remove("active");
    document.getElementById("rules-nav").classList.remove("active");
	document.getElementById("history-nav").classList.add("active");
    document.getElementById("blackjack-table").classList.add("remove");
    document.getElementById("show-rules").classList.add("remove");
	document.getElementById("history-box").classList.remove("remove");
});

document.getElementById("query-button").addEventListener("click", async() => {
    let query = await getState();
    document.getElementById("button-div").classList.add("remove");
	document.getElementById("button-div").classList.remove("cover");
    let history_box = document.getElementById("history-box");
    if (query.action != "ready") {
        let notif = document.createElement("h3");
        notif.innerText = "game in progress";
        history_box.append(notif);
    } else {
        let result = document.createElement("h3");
        result.innerText = "result - " + query.result;
        history_box.append(result);
        let winnings = document.createElement("h3");
        winnings.innerText = "winnings - " + (query.winnings / 1000000);
        history_box.append(winnings);
        let bet = document.createElement("h3");
        bet.innerText = "bet - " + (query.wager / 1000000);
        history_box.append(bet);
        let dealer_ids = [];
        for (let i = 0; i < query.dealer.length; i++) {
            dealer_ids.push(query.dealer[i].id);
        }
        let notif = document.createElement("h3");
        notif.innerText = "dealer cards";
        history_box.append(notif);
        let dealer_card_box = document.createElement("div");
        dealer_card_box.style.display = "flex";
        history_box.append(dealer_card_box);
        for (let i = 0; i < dealer_ids.length; i++) {
            random_Card_Dealer = deck[Number(dealer_ids[i])];
            dealer_Card_HTML = document.createElement("div");
            dealer_card_box.append(dealer_Card_HTML);
            dealer_Card_HTML.classList.add("card2");
            dealer_Card_HTML.style.backgroundImage = random_Card_Dealer.image;
        }
        let player_ids = [];
        for (let i = 0; i < query.player.length; i++) {
            player_ids.push(query.player[i].id);
        }
        let player_label = document.createElement("h3");
        player_label.innerText = "player cards";
        history_box.append(player_label);
        let player_card_box = document.createElement("div");
        player_card_box.style.display = "flex";
        history_box.append(player_card_box);
        for (let i = 0; i < player_ids.length; i++) {
            random_Card_Player = deck[Number(player_ids[i])];
            player_Card_HTML = document.createElement("div");
            player_card_box.append(player_Card_HTML);
            player_Card_HTML.classList.add("card2");
            player_Card_HTML.style.backgroundImage = random_Card_Player.image;
        }
        if (query.split.length > 0) {
            let split_ids = [];
            for (let i = 0; i < query.split.length; i++) {
                split_ids.push(query.split[i].id);
            }
            let split_label = document.createElement("h3");
            split_label.innerText = "split cards";
            history_box.append(split_label);
            let split_card_box = document.createElement("div");
            split_card_box.style.display = "flex";
            history_box.append(split_card_box);
            for (let i = 0; i < split_ids.length; i++) {
                random_Card_Split = deck[Number(split_ids[i])];
                split_Card_HTML = document.createElement("div");
                split_card_box.append(split_Card_HTML);
                split_Card_HTML.classList.add("card2");
                split_Card_HTML.style.backgroundImage = random_Card_Split.image;
            }
        }
    }
});

async function start() {
    try {
        viewing_key = await window.keplr.getSecret20ViewingKey(chainId, sscrt_contract);
    } catch (error) {
        notification();
        return;
    }
    cash = await querySscrt()
    cash = cash / 100;
    betAndCash(0);
    let game_state = await getState();
    if (game_state.action != "ready") {
        resume_game(game_state);
    }
}

async function querySscrt(){
	let sscrt_info = await window.secretjs.query.compute.queryContract({
	  contract_address: sscrt_contract,
	  code_hash: sscrt_hash,
	  query: {
		  balance: {
			  address: window.secretjs.address,
			  key: viewing_key,
			  time : Date.now()
		  }
	  }
	});
	snip_balance = Math.floor(sscrt_info.balance.amount / 10000);
	return(snip_balance);
};

function notification() {
    let notification = document.createElement('div');
    notification.setAttribute('id', 'notification');
    let nsnumber = document.createElement('span');
    nsnumber.setAttribute('class', 'nsnumber');
    nsnumber.innerText = "Click here for silk viewing key";
    notification.append(nsnumber);
    let raffle_box = document.getElementById("blackjack-table");
    raffle_box.prepend(notification);
    notification.addEventListener("click", async() => {
        await window.keplr.suggestToken(chainId, sscrt_contract);
        notification.remove();
        start();
    });
}
async function getState(){
	let stateinfo = await secretjs.query.compute.queryContract({
	  contract_address: lottery_contract,
	  code_hash: lottery_hash,
	  query: {
		  bj_state: {
			address: window.secretjs.address
		},
	  }
	});
    console.log("resume game state");
    console.log(stateinfo.state);
	return(stateinfo.state);
};

function resume_game(game_state) {
    bet = game_state.wager / 1000000;
    document.getElementById("bet").innerHTML = "Bet : " + "$ " + bet;
    remove_bet_and_chips();
    show_first_dealer_card(game_state.dealer[0].id);
    let player_ids = [];
    for (let i = 0; i < game_state.player.length; i++) {
        player_ids.push(game_state.player[i].id);
    }
    show_players_cards(player_ids);
    if (game_state.action == "insurance") {
        insuranceButton.classList.remove("remove");
        passButton.classList.remove("remove");
    } else if (game_state.action == "deal") {
        hitButton.classList.remove("remove");
        standButton.classList.remove("remove");
        surrenderButton.classList.remove("remove");
        if (player_Cards[0].number == player_Cards[1].number) {
            splitButton.classList.remove("remove");
        }
        let point_total = player_Cards[0].number + player_Cards[1].number;
        if (point_total == 10 || point_total == 11) {
            doubleDownButton.classList.remove("remove");
        }
    } else if (game_state.action == "play") {
        hitButton.classList.remove("remove");
        standButton.classList.remove("remove");
    } else if (game_state.action == "splitL") {
        let split_ids = [];
        for (let i = 0; i < game_state.split.length; i++) {
            split_ids.push(game_state.split[i].id);
        }
        split_bet = bet + bet;
        document.getElementById("bet").innerHTML = "Bet : " + "$ " + split_bet;
        cash -= bet;
        document.getElementById("cash").innerHTML = "Cash : " + "$ " + cash;
        splitted = true;
        left_Split = true;
        hitButton.classList.remove("remove");
        standButton.classList.remove("remove");
        build_split(player_ids, split_ids);
    } else if (game_state.action == "splitR") {
        let split_ids = [];
        for (let i = 0; i < game_state.split.length; i++) {
            split_ids.push(game_state.split[i].id);
        }
        split_bet = bet + bet;
        document.getElementById("bet").innerHTML = "Bet : " + "$ " + split_bet;
        cash -= bet;
        document.getElementById("cash").innerHTML = "Cash : " + "$ " + cash;
        hitButton.classList.remove("remove");
        standButton.classList.remove("remove");
        splitted = true;
        right_Split = true;
        build_split(player_ids, split_ids);
        split_1.classList.remove("card_split");
        split_1.classList.add("card_split2");
        split_2.classList.add("card_split");
    }
}




let cash = 0;
let deck = [...originalDeck];


async function recieve_contract(wager, action){
	let hookmsg = {
    blackjack: {
		action: action,
    }
	};
	let hookmsg64 = btoa(JSON.stringify(hookmsg));
	let msg = new MsgExecuteContract({
		sender: secretjs.address,
		contract_address: sscrt_contract,
    code_hash: sscrt_hash,
		msg: {
			send: {
				recipient: lottery_contract,
        code_hash: lottery_hash,
				amount: (wager * 1000000).toString(),
				msg: hookmsg64,
			}
		}
	});
	let tx = await secretjs.tx.broadcast([msg], {
		gasLimit: 250_000,
		gasPriceInFeeDenom: 0.1,
		feeDenom: "uscrt",
	});
    console.log("transaction log");
	console.log(tx);
    return(tx);
};



async function contract(action){
	let msg = new MsgExecuteContract({
		sender: secretjs.address,
		contract_address: lottery_contract,
    	code_hash: lottery_hash,
		msg: {
			blackjack: {
				action: action,
			},
		}
	});
	let tx = await secretjs.tx.broadcast([msg], {
		gasLimit: 250_000,
		gasPriceInFeeDenom: 0.1,
		feeDenom: "uscrt",
	});
    console.log("transaction log");
	console.log(tx);
    return tx;
};

insuranceButton = document.createElement("BUTTON");
passButton = document.createElement("BUTTON");
hitButton = document.createElement("BUTTON");
standButton = document.createElement("BUTTON");
surrenderButton = document.createElement("BUTTON");
splitButton = document.createElement("BUTTON");
doubleDownButton = document.createElement("BUTTON");
buttons = [hitButton, standButton, splitButton, surrenderButton, doubleDownButton, insuranceButton, passButton];
buttons_Text = ["Hit", "Stand", "Split", "Surrender", "Double Down", "Insurance", "Pass"];
for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.add("remove");
    buttons[i].innerHTML = buttons_Text[i];
    document.getElementById("buttons").appendChild(buttons[i]);
}
let player_Cards;

function variable_Declaring() {
    showingRules = false;
    bet = 0;
    lastBets = [];
    betArray = [1, 5, 10, 20, 50, 100];
    betting_Chips = document.getElementById("chips-table").querySelectorAll("div");
    stand = false;
    doubled_Down = false;
    player_Cards = [];
    dealer_Cards = [];
    player_Score2 = 0;
    dealer_Score = 0;
    dealer_Score2 = 0;
    player_Card_HTML = document.createElement("div");
    player_Card_HTML.classList.add("card");
    document.getElementById("player_cards").innerHTML = "";
    document.getElementById("dealer_cards").innerHTML = "";
    // REMOVING RESULT MESSAGE AND ADDING BETTING INPUT
    document.getElementById("resultMessage").classList.remove("cover2");
    document.getElementById("resultMessage").classList.add("remove");
    document.getElementById("betAlert").classList.remove("remove");
    document.getElementById("betAlert").classList.add("cover");
    // ACTIVATING CHIPS
    let chips = document.getElementById("chips-table").querySelectorAll("div");
    for (let i = 0; i < chips.length; i++) {
        chips[i].style.pointerEvents = "auto";
    }
    splitable = false;
    first_move = true;
    splitted = false;
    first_Splitt = true;
    split_Cards_Left = [];
    split_Cards_Right = [];
    player_Score_Split_Left = 0;
    player_Score_Split_Right = 0;
    split_Score_Array = [player_Score_Split_Left, player_Score_Split_Right];
    player_Score_Split_Left_Ace = 0;
    player_Score_Split_Right_Ace = 0;
    split_1 = document.createElement("DIV");
    split_1.classList.add("card_split");
    split_2 = document.createElement("DIV");
    split_2.setAttribute("id", "right_split");
    split_2.classList.add("card_split2");
    split_Array = [split_1, split_2];
    left_Split = false;
    right_Split = false;
}
variable_Declaring();


// BET AND CASH COUNT + HMTL TEXT UPDATE
function betAndCash(num) {
    if (cash - num >= 0) {
        lastBets.unshift(num);
        bet += num;
        cash -= num;
        document.getElementById("bet").innerHTML = "Bet : " + "$ " + bet;
        document.getElementById("cash").innerHTML = "silk : " + "$ " + cash;
    }
}
for (let i = 0; i < betArray.length; i++) {
    betting_Chips[i].addEventListener("click", () => {
        betAndCash(betArray[i]);
    });
}

document.getElementById("done").addEventListener("click", async() => {
    if (bet > 0) {
        let tx = await recieve_contract(bet, "deal");
        let player_cards_ids = tx.arrayLog.find(
			(log) => log.type === "wasm" && log.key === "player_cards"
		).value.split(",");
		let dealer_card = tx.arrayLog.find(
			(log) => log.type === "wasm" && log.key === "dealer_cards"
		).value;
        let result = tx.arrayLog.find(
			(log) => log.type === "wasm" && log.key === "result"
		).value;
        show_players_cards(player_cards_ids);
        if (result != "blackjack" && result != "push") {
            show_first_dealer_card(Number(dealer_card));
        } else {
            showDealersCards(dealer_card.split(","));
        }
        remove_bet_and_chips();
        // CREATES PLAYER BUTTONS
        if (result == "deal") {
            hitButton.classList.remove("remove");
            standButton.classList.remove("remove");
            surrenderButton.classList.remove("remove");
            if (player_Cards[0].number == player_Cards[1].number) {
                splitButton.classList.remove("remove");
            }
            let point_total = player_Cards[0].number + player_Cards[1].number;
            if (point_total == 10 || point_total == 11) {
                doubleDownButton.classList.remove("remove");
            }
        } else if (result == "insurance") {
                insuranceButton.classList.remove("remove");
                passButton.classList.remove("remove")
        } else if (result == "blackjack") {
            blackjack();
        } else if (result == "push"){
            draw();
        }
    }
});

insuranceButton.addEventListener("click", async() => {
    let tx = await recieve_contract((bet / 2), "insurance");
    cash -= bet / 2;
    document.getElementById("cash").innerHTML = "silk : " + "$ " + cash;
    let result = tx.arrayLog.find(
        (log) => log.type === "wasm" && log.key === "result"
    ).value;
    let dealer_cards = tx.arrayLog.find(
        (log) => log.type === "wasm" && log.key === "dealer_cards"
    ).value.split(",");
    insuranceButton.classList.add("remove");
    passButton.classList.add("remove");
    showInsuranceMessage(result);
    if (result == "insurance win") {
        showDealersCards(dealer_cards);
        document.getElementById("cash").innerHTML = "silk : " + "$ " + cash;
    }
});

passButton.addEventListener("click", async() => {
    let tx = await contract("pass");
    let result = tx.arrayLog.find(
        (log) => log.type === "wasm" && log.key === "result"
    ).value;
    let dealer_cards = tx.arrayLog.find(
        (log) => log.type === "wasm" && log.key === "dealer_cards"
    ).value.split(",");
    insuranceButton.classList.add("remove");
    passButton.classList.add("remove");
    showInsuranceMessage(result);
    if (result == "dealer blackjack") {
        showDealersCards(dealer_cards);
    }
});

standButton.addEventListener("click", async() => {
    if (splitted == false){ 

        let tx = await contract("stand");
        let result = tx.arrayLog.find(
            (log) => log.type === "wasm" && log.key === "result"
        ).value;
        let dealer_cards = tx.arrayLog.find(
            (log) => log.type === "wasm" && log.key === "dealer_cards"
        ).value.split(",");

        if (first_move == true) {
            splitButton.classList.add("remove");
            doubleDownButton.classList.add("remove");
            surrenderButton.classList.add("remove");
            first_move = false;
        }
        showDealersCards(dealer_cards);
        if (result == "win") {
            win();
        } else if (result == "lose") {
            loss();
        } else {
            draw();
        }
    }
    

    if (left_Split == false && right_Split == true) {

        let tx = await contract("splitstandR");
        let result = tx.arrayLog.find(
            (log) => log.type === "wasm" && log.key === "result"
        ).value;
        let dealer_cards = tx.arrayLog.find(
            (log) => log.type === "wasm" && log.key === "dealer_cards"
        ).value.split(",");

        split_2.classList.remove("card_split");
        split_2.classList.add("card_split2");

        showDealersCards(dealer_cards);

        Split_Final_Result(result);
        right_Split = false;
        splitted = false;
        buttonRemove();
    }
    if (left_Split == true && right_Split == false) {

        await contract("splitstandL");
        
        
        split_1.classList.remove("card_split");
        split_1.classList.add("card_split2");

        

        left_Split = false;
        right_Split = true;
        split_2.classList.add("card_split");
    }
});

hitButton.addEventListener("click", async() => {

    if (splitted == false) {

        let tx = await contract("hit");
        let result = tx.arrayLog.find(
            (log) => log.type === "wasm" && log.key === "result"
        ).value;
        let new_card = Number(tx.arrayLog.find(
            (log) => log.type === "wasm" && log.key === "new_card"
        ).value);
        random_Card_Player = deck[new_card];
        player_Cards.push(random_Card_Player);
        // ADDING PLAYER CARD TO HTML 
        player_Card_HTML = document.createElement("div");
        document.getElementById("player_cards").appendChild(player_Card_HTML);
        player_Card_HTML.classList.add("card");
        player_Card_HTML.style.backgroundImage = random_Card_Player.image;

        if (first_move == true) {
            splitButton.classList.add("remove");
            doubleDownButton.classList.add("remove");
            surrenderButton.classList.add("remove");
            first_move = false;
        }

        if (result == "lose") {
            loss();
        }
    }
    if (left_Split == true){

        let tx = await contract("splithitL");

        let result = tx.arrayLog.find(
            (log) => log.type === "wasm" && log.key === "result"
        ).value;
        let new_card = tx.arrayLog.find(
            (log) => log.type === "wasm" && log.key === "new_card"
        ).value;

        random_Card_Player = deck[Number(new_card)];
        split_Cards_Left.push(random_Card_Player);
        player_Card_HTML = document.createElement("div");
        player_Card_HTML.classList.add("card");
        split_1.appendChild(player_Card_HTML);
        player_Card_HTML.style.backgroundImage = random_Card_Player.image;
        
        if (result != "play") {
            split_1.classList.remove("card_split");
            split_1.classList.add("card_split2");

            left_Split = false;
            right_Split = true;
            split_2.classList.add("card_split");
        }
        return;
    }
    if (right_Split == true){

        let tx = await contract("splithitR");
        let result = tx.arrayLog.find(
            (log) => log.type === "wasm" && log.key === "result"
        ).value;
        let new_card = tx.arrayLog.find(
            (log) => log.type === "wasm" && log.key === "new_card"
        ).value;
        let dealer_cards = tx.arrayLog.find(
            (log) => log.type === "wasm" && log.key === "dealer_cards"
        ).value;
        random_Card_Player = deck[Number(new_card)];
        split_Cards_Right.push(random_Card_Player);
        // ADDING PLAYER CARD TO HTML 
        player_Card_HTML = document.createElement("div");
        player_Card_HTML.classList.add("card");
        split_2.appendChild(player_Card_HTML);
        player_Card_HTML.style.backgroundImage = random_Card_Player.image;
        if (result != "play") {

            if (dealer_cards != "n/a") {

                dealer_cards = dealer_cards.split(",");
                showDealersCards(dealer_cards);
            }

            Split_Final_Result(result);
            right_Split = false;
            splitted = false;
            buttonRemove();
            
        }
        return;
    }
});

surrenderButton.addEventListener("click", async() => {
    await contract("surrender");
    cash += bet / 2;
    zero_Bet();
    document.getElementById("cash").innerHTML = "silk : " + "$ " + cash;
    document.getElementById("resultMessage").innerHTML = "SURRENDER";
    buttonRemove();
    showResultMessage();
});
doubleDownButton.addEventListener("click", async() => {
    let tx = await recieve_contract(bet, "double_down");
    betAndCash(bet);
    let result = tx.arrayLog.find(
        (log) => log.type === "wasm" && log.key === "result"
    ).value;
    let new_card = tx.arrayLog.find(
        (log) => log.type === "wasm" && log.key === "new_card"
    ).value;
    let dealer_cards = tx.arrayLog.find(
        (log) => log.type === "wasm" && log.key === "dealer_cards"
    ).value.split(",");
    random_Card_Player = deck[Number(new_card)];
    player_Cards.push(random_Card_Player);
    // ADDING PLAYER CARD TO HTML 
    player_Card_HTML = document.createElement("div");
    document.getElementById("player_cards").appendChild(player_Card_HTML);
    player_Card_HTML.classList.add("card");
    player_Card_HTML.style.backgroundImage = random_Card_Player.image;
    showDealersCards(dealer_cards);
    if (result == "win") {
        win();
    } else if (result == "lose") {
        loss();
    } else {
        draw();
    }
});
splitButton.addEventListener("click", async() => {
    let tx = await recieve_contract(bet, "split");
    let left_split = tx.arrayLog.find(
        (log) => log.type === "wasm" && log.key === "left_split"
    ).value.split(",");
    let right_split = tx.arrayLog.find(
        (log) => log.type === "wasm" && log.key === "right_split"
    ).value.split(",");
    splitButton.classList.add("remove");
    doubleDownButton.classList.add("remove");
    surrenderButton.classList.add("remove");
    split_bet = bet + bet;
    document.getElementById("bet").innerHTML = "Bet : " + "$ " + split_bet;
    cash -= bet;
    document.getElementById("cash").innerHTML = "Cash : " + "$ " + cash;
    splitted = true;
    left_Split = true;
    build_split(left_split, right_split);
    
});

document.getElementById("resultMessage").addEventListener("click", () => {
    document.getElementById("chips-table").classList.remove("remove");
    document.getElementById("headerimage").classList.remove("remove");
    variable_Declaring();
});

async function build_split(left_split, right_split) {
    
    document.getElementById("player_cards").innerHTML = '';
    document.getElementById("player_cards").appendChild(split_1);
    document.getElementById("player_cards").appendChild(split_2);
    additional_Hit_Card = document.createElement("div");

    
    for (let i = 0; i < left_split.length; i++) {
        random_Card_Player = deck[Number(left_split[i])];
        split_Cards_Left.push(random_Card_Player);
        // ADDING PLAYER CARD TO HTML 
        player_Card_HTML = document.createElement("div");
        player_Card_HTML.classList.add("card");
        split_1.appendChild(player_Card_HTML);
        player_Card_HTML.style.backgroundImage = random_Card_Player.image;
    }
    for (let i = 0; i < right_split.length; i++) {
        random_Card_Player = deck[Number(right_split[i])];
        split_Cards_Right.push(random_Card_Player);
        // ADDING PLAYER CARD TO HTML 
        player_Card_HTML = document.createElement("div");
        player_Card_HTML.classList.add("card");
        split_2.appendChild(player_Card_HTML);
        player_Card_HTML.style.backgroundImage = random_Card_Player.image;
    }

    first_Splitt = false;
}




function loss() {
    zero_Bet();
    document.getElementById("cash").innerHTML = "silk : " + "$ " + cash;
    showResultMessage();
    document.getElementById("resultMessage").innerHTML = "LOSE";
    buttonRemove();
}

function win() {
    cash += bet * 2;
    zero_Bet();
    document.getElementById("cash").innerHTML = "silk : " + "$ " + cash;
    showResultMessage();
    document.getElementById("resultMessage").innerHTML = "WIN";
    buttonRemove();
}
function blackjack() {
    cash += bet * 2.5;
    zero_Bet();
    document.getElementById("cash").innerHTML = "silk : " + "$ " + cash;
    showResultMessage();
    document.getElementById("resultMessage").innerHTML = "BLACKJACK";
    buttonRemove();
}
function draw() {
    cash += bet;
    zero_Bet();
    document.getElementById("cash").innerHTML = "silk : " + "$ " + cash;
    showResultMessage();
    document.getElementById("resultMessage").innerHTML = "PUSH";
    buttonRemove();
}


function Split_Final_Result(split_result) {

    document.getElementById("resultMessage").classList.add("cover2");
    document.getElementById("resultMessage").classList.remove("remove");

    if (split_result == "win/win") {
        document.getElementById("resultMessage").innerHTML = split_result;
        cash += (bet * 4);
        document.getElementById("cash").innerHTML = "Cash : " + "$ " + cash;
        zero_Bet();
    }

    if (split_result == "win/loss") {
        document.getElementById("resultMessage").innerHTML = split_result;
        cash += (bet * 2);
        document.getElementById("cash").innerHTML = "Cash : " + "$ " + cash;
        zero_Bet();
    }

    if (split_result == "win/push") {
        document.getElementById("resultMessage").innerHTML = split_result;
        cash += (bet * 3);
        document.getElementById("cash").innerHTML = "Cash : " + "$ " + cash;
        zero_Bet();
    }

    if (split_result == "loss/win") {
        document.getElementById("resultMessage").innerHTML = split_result;
        cash += (bet * 2);
        document.getElementById("cash").innerHTML = "Cash : " + "$ " + cash;
        zero_Bet();
    }

    if (split_result == "loss/loss") {
        document.getElementById("resultMessage").innerHTML = split_result;
        document.getElementById("cash").innerHTML = "Cash : " + "$ " + cash;
        zero_Bet();
    }

    if (split_result == "loss/push") {
        document.getElementById("resultMessage").innerHTML = split_result;
        cash += bet;
        document.getElementById("cash").innerHTML = "Cash : " + "$ " + cash;
        zero_Bet();
    }

    if (split_result == "push/win") {
        document.getElementById("resultMessage").innerHTML = split_result;
        cash += (bet * 3);
        document.getElementById("cash").innerHTML = "Cash : " + "$ " + cash;
        zero_Bet();
    }

    if (split_result == "push/loss") {
        document.getElementById("resultMessage").innerHTML = split_result;
        cash += bet;
        document.getElementById("cash").innerHTML = "Cash : " + "$ " + cash;
        zero_Bet();
    }

    if (split_result == "push/push") {
        document.getElementById("resultMessage").innerHTML = split_result;
        cash += (bet * 2);
        document.getElementById("cash").innerHTML = "Cash : " + "$ " + cash;
        zero_Bet();
    }
}

function showResultMessage() {
    document.getElementById("resultMessage").classList.add("cover2");
    document.getElementById("resultMessage").classList.remove("remove");
}

function showInsuranceMessage(result) {
    document.getElementById("insurance_message").innerHTML = result.toUpperCase();
    document.getElementById("insurance_message").classList.add("cover2");
    document.getElementById("insurance_message").classList.remove("remove");
    if (result == "insurance win") {
        result = "dealer blackjack";
        cash += bet;
        document.getElementById("cash").innerHTML = "silk : " + "$ " + cash;
    } else if (result == "insurance win/push") {
        result = "dealer blackjack";
        cash += bet * 2;
        document.getElementById("cash").innerHTML = "silk : " + "$ " + cash;
    }
    if (result == "dealer blackjack") {
        document.getElementById("insurance_message").addEventListener("click", () => {
            document.getElementById("insurance_message").classList.remove("cover2");
            document.getElementById("insurance_message").classList.add("remove");
            document.getElementById("chips-table").classList.remove("remove");
            document.getElementById("headerimage").classList.remove("remove");
            variable_Declaring();
        }, { once: true });
    } else if (result == "insurance loss" || result == "no dealer blackjack") {
        document.getElementById("insurance_message").addEventListener("click", async() => {
            document.getElementById("insurance_message").classList.remove("cover2");
            document.getElementById("insurance_message").classList.add("remove");
            hitButton.classList.remove("remove");
            standButton.classList.remove("remove");
            surrenderButton.classList.remove("remove");
            if (player_Cards[0].number == player_Cards[1].number) {
                splitButton.classList.remove("remove");
            }
            let point_total = player_Cards[0].number + player_Cards[1].number;
            if (point_total == 10 || point_total == 11) {
                doubleDownButton.classList.remove("remove");
            }
        }, { once: true });

    }
}

async function play_buttons() {
    hitButton.classList.remove("remove");
    standButton.classList.remove("remove");
    surrenderButton.classList.remove("remove");
    if (player_Cards[0].number == player_Cards[1].number) {
        splitButton.classList.remove("remove");
    }
    let point_total = player_Cards[0].number + player_Cards[1].number;
    if (point_total == 10 || point_total == 11) {
        doubleDownButton.classList.remove("remove");
    }
};


function buttonRemove() {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.add("remove");
    }
}


function zero_Bet() {
    bet = 0;
    document.getElementById("bet").innerHTML = "Bet: $ 0";
}


function showDealersCards(card_array) {
    dealer_Cards = [];
    document.getElementById("dealer_cards").innerHTML = "";

    for (let i = 0; i < card_array.length; i++) {
        random_Card_Dealer = deck[Number(card_array[i])];
        dealer_Cards.push(random_Card_Dealer);
        // ADDING DEALER CARD TO HTML 
        dealer_Card_HTML = document.createElement("div");
        document.getElementById("dealer_cards").appendChild(dealer_Card_HTML);
        dealer_Card_HTML.classList.add("card");
        dealer_Card_HTML.style.backgroundImage = random_Card_Dealer.image;
    }
}

function show_players_cards(card_array){
    for (let i = 0; i < card_array.length; i++) {
        random_Card_Player = deck[Number(card_array[i])];
        player_Cards.push(random_Card_Player);
        // ADDING PLAYER CARD TO HTML 
        player_Card_HTML = document.createElement("div");
        document.getElementById("player_cards").appendChild(player_Card_HTML);
        player_Card_HTML.classList.add("card");
        player_Card_HTML.style.backgroundImage = random_Card_Player.image;
    }
}
function show_first_dealer_card(dealer_card){
    random_Card_Dealer = deck[dealer_card];
    dealer_Cards.push(random_Card_Dealer);
    dealer_Facedown_HTML = document.createElement("div");
    document.getElementById("dealer_cards").appendChild(dealer_Facedown_HTML);
    dealer_Facedown_HTML.classList.add("card-down");
    dealer_Card_HTML = document.createElement("div");
    document.getElementById("dealer_cards").appendChild(dealer_Card_HTML);
    dealer_Card_HTML.classList.add("card");
    dealer_Card_HTML.style.backgroundImage = random_Card_Dealer.image;
}
function remove_bet_and_chips(){
    document.getElementById("headerimage").classList.add("remove");
    document.getElementById("chips-table").classList.add("remove");
    document.getElementById("betAlert").classList.remove("cover");
    document.getElementById("betAlert").classList.add("remove");
	
    bet_Chips = document.getElementById("chips-table").querySelectorAll("div");
    for (let i = 0; i < bet_Chips.length; i++) {
        bet_Chips[i].style.pointerEvents = "none";
    }
    document.getElementById("buttons").classList.remove("noPointerEvents");
}