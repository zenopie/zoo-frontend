document.getElementById("rules-nav").addEventListener("click", async() => {
    document.getElementById("table-nav").classList.remove("active");
    document.getElementById("rules-nav").classList.add("active");
	document.getElementById("history-nav").classList.remove("active");
    document.getElementById("table").classList.add("remove");
    document.getElementById("show-rules").classList.remove("remove");
	document.getElementById("history-box").classList.add("remove");
});

document.getElementById("table-nav").addEventListener("click", async() => {
    document.getElementById("table-nav").classList.add("active");
    document.getElementById("rules-nav").classList.remove("active");
	document.getElementById("history-nav").classList.remove("active");
    document.getElementById("table").classList.remove("remove");
    document.getElementById("show-rules").classList.add("remove");
	document.getElementById("history-box").classList.add("remove");
});
document.getElementById("history-nav").addEventListener("click", async() => {
    document.getElementById("table-nav").classList.remove("active");
    document.getElementById("rules-nav").classList.remove("active");
	document.getElementById("history-nav").classList.add("active");
    document.getElementById("table").classList.add("remove");
    document.getElementById("show-rules").classList.add("remove");
	document.getElementById("history-box").classList.remove("remove");
});

async function query_last_roulette(){
	let query = await secretjs.query.compute.queryContract({
	  contract_address: lottery_contract,
	  code_hash: lottery_hash,
	  query: {
		  last_roulette: {
			address: window.secretjs.address
		},
	  }
	});
    console.log(query.last_spin);
	return(query.last_spin);
};
document.getElementById("query-button").addEventListener("click", async() => {
    let query = await query_last_roulette();
    document.getElementById("betAlert").classList.add("remove");
	document.getElementById("betAlert").classList.remove("cover");
    let history_box = document.getElementById("history-box");
    let winner = document.createElement("h2");
    winner.innerText = "winning number - " + query.winning_number;
    history_box.append(winner);
    let ticket_label = document.createElement("h2");
    ticket_label.innerText = "my bets";
    history_box.append(ticket_label);
    for (let i = 0; i < query.bets.length; i++) {
        let bank = document.createElement('div');
        bank.innerText = "bet type: " + query.bets[i].bet_type + " numbers: " + query.bets[i].numbers + " wager: " + query.bets[i].wager;
        history_box.append(bank);
    }
	let winnings = document.createElement("h2");
	winnings.innerText = "winnings - " + query.winnings;
	history_box.append(winnings);


});


let i;
let c;
let style;
let num

let bankValue = 0;
let currentBet = 0;
let wager = 5;
let lastWager = 0;
let bet = [];
let numbersBet = [];
let previousNumbers = [];
let objType;

let numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
let wheelnumbersAC = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];

let table = document.createElement('div');
table.setAttribute("id", "table");
let container = document.createElement('div');
container.setAttribute('id', 'container');
document.body.append(table);
table.append(container);

startGame();

let wheel = document.getElementsByClassName('wheel')[0];
let ballTrack = document.getElementsByClassName('ballTrack')[0];


async function start(){
	viewing_key = await window.keplr.getSecret20ViewingKey(chainId, sscrt_contract);
	bankValue = await querySscrt();
	resetGame();
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
	snip_balance = Math.floor(sscrt_info.balance.amount / 1000000);
	return(snip_balance);
};

async function enter(bets, amount){
	let hookmsg = {
		roulette: {bets: bets}
	}
	let hookmsg64 = btoa(JSON.stringify(hookmsg));
	let msg = new MsgExecuteContract({
		sender: secretjs.address,
		contract_address: sscrt_contract,
    code_hash: sscrt_hash,
		msg: {
			send: {
				recipient: lottery_contract,
        code_hash: lottery_hash,
				amount: (amount * 1000000).toString(),
				msg: hookmsg64,
			}
		}
	});
	let tx = await secretjs.tx.broadcast([msg], {
		gasLimit: 1_000_000,
		gasPriceInFeeDenom: 0.1,
		feeDenom: "uscrt",
	});
	console.log("transaction log");
	console.log(tx);
	try {
		const random_number = Number(tx.arrayLog.find(
			(log) => log.type === "wasm" && log.key === "random_number"
		).value);
		const winValue = Number(tx.arrayLog.find(
			(log) => log.type === "wasm" && log.key === "winValue"
		).value);
		const betTotal = Number(tx.arrayLog.find(
			(log) => log.type === "wasm" && log.key === "betTotal"
		).value);
		return [random_number, winValue, betTotal];
	} catch(error){
		console.log(error);
	}	
};



async function resetGame(){
	bankValue =  await querySscrt();
	currentBet = 0;
	wager = 5;
	bet = [];
	numbersBet = [];
	previousNumbers = [];
	document.getElementById('betting_board').remove();
	buildBettingBoard();
}

async function startGame(){
	buildWheel();
	buildBettingBoard();
}

function gameOver(){
	let notification = document.createElement('div');
	notification.setAttribute('id', 'notification');
		let nSpan = document.createElement('span');
		nSpan.setAttribute('class', 'nSpan');
		nSpan.innerText = 'Bankrupt';
		notification.append(nSpan);

		let nBtn = document.createElement('div');
		nBtn.setAttribute('class', 'nBtn');
		nBtn.innerText = 'Purchase Silk';	
		nBtn.onclick = function(){
			document.getElementById('notification').remove();
			window.open("https://app.shadeprotocol.io/swap?input=sSCRT&output=SILK");
			resetGame();
		};
		notification.append(nBtn);
	container.prepend(notification);
}

function buildWheel(){
	let wheel = document.createElement('div');
	wheel.setAttribute('class', 'wheel');

	let outerRim = document.createElement('div');
	outerRim.setAttribute('class', 'outerRim');
	wheel.append(outerRim);

	let numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
	for(i = 0; i < numbers.length; i++){
		let a = i + 1;
		let spanClass = (numbers[i] < 10)? 'single' : 'double';
		let sect = document.createElement('div');
		sect.setAttribute('id', 'sect'+a);
		sect.setAttribute('class', 'sect');
		let span = document.createElement('span');
		span.setAttribute('class', spanClass);
		span.innerText = numbers[i];
		sect.append(span);
		let block = document.createElement('div');
		block.setAttribute('class', 'block');
		sect.append(block);
		wheel.append(sect);
	}

	let pocketsRim = document.createElement('div');
	pocketsRim.setAttribute('class', 'pocketsRim');
	wheel.append(pocketsRim);

	let ballTrack = document.createElement('div');
	ballTrack.setAttribute('class', 'ballTrack');
	let ball = document.createElement('div');
	ball.setAttribute('class', 'ball');
	ballTrack.append(ball);
	wheel.append(ballTrack);

	let pockets = document.createElement('div');
	pockets.setAttribute('class', 'pockets');
	wheel.append(pockets);

	let cone = document.createElement('div');
	cone.setAttribute('class', 'cone');
	wheel.append(cone);

	let turret = document.createElement('div');
	turret.setAttribute('class', 'turret');
	wheel.append(turret);

	let turretHandle = document.createElement('div');
	turretHandle.setAttribute('class', 'turretHandle');
	let thendOne = document.createElement('div');
	thendOne.setAttribute('class', 'thendOne');
	turretHandle.append(thendOne);
	let thendTwo = document.createElement('div');
	thendTwo.setAttribute('class', 'thendTwo');
	turretHandle.append(thendTwo);
	wheel.append(turretHandle);

	container.append(wheel);
}

function buildBettingBoard(){
	let bettingBoard = document.createElement('div');
	bettingBoard.setAttribute('id', 'betting_board');

	let wl = document.createElement('div');
	wl.setAttribute('class', 'winning_lines');
	
	var wlttb = document.createElement('div');
	wlttb.setAttribute('id', 'wlttb_top');
	wlttb.setAttribute('class', 'wlttb');
	for(i = 0; i < 11; i++){
		let j = i;
		var ttbbetblock = document.createElement('div');
		ttbbetblock.setAttribute('class', 'ttbbetblock');
		var numA = (1 + (3 * j));
		var numB = (2 + (3 * j));
		var numC = (3 + (3 * j));
		var numD = (4 + (3 * j));
		var numE = (5 + (3 * j));
		var numF = (6 + (3 * j));
		let num = numA + ', ' + numB + ', ' + numC + ', ' + numD + ', ' + numE + ', ' + numF;
		ttbbetblock.onclick = function(){
			setBet(this, num, 'double_street', 5);
		};
		ttbbetblock.oncontextmenu = function(e){
			e.preventDefault();
			removeBet(this, num, "double_street", 5);
		};
		wlttb.append(ttbbetblock);
	}
	wl.append(wlttb);

	for(c =  1; c < 4; c++){
		let d = c;
		var wlttb = document.createElement('div');
		wlttb.setAttribute('id', 'wlttb_'+c);
		wlttb.setAttribute('class', 'wlttb');
		for(i = 0; i < 12; i++){
			let j = i;
			var ttbbetblock = document.createElement('div');
			ttbbetblock.setAttribute('class', 'ttbbetblock');
			ttbbetblock.onclick = function(){
				if(d == 1 || d == 2){
					var numA = ((2 - (d - 1)) + (3 * j));
					var numB = ((3 - (d - 1)) + (3 * j));
					var num = numA + ', ' + numB;
				}
				else{
					var numA = (1 + (3 * j));
					var numB = (2 + (3 * j));
					var numC = (3 + (3 * j));
					var num = numA + ', ' + numB + ', ' + numC;
				}
				objType = (d == 3)? 'street' : 'split';
				var odd = (d == 3)? 11 : 17;
				setBet(this, num, objType, odd);
			};
			ttbbetblock.oncontextmenu = function(e){
				e.preventDefault();
				if(d == 1 || d == 2){
					var numA = ((2 - (d - 1)) + (3 * j));
					var numB = ((3 - (d - 1)) + (3 * j));
					var num = numA + ', ' + numB;
				}
				else{
					var numA = (1 + (3 * j));
					var numB = (2 + (3 * j));
					var numC = (3 + (3 * j));
					var num = numA + ', ' + numB + ', ' + numC;
				}
				objType = (d == 3)? 'street' : 'split';
				var odd = (d == 3)? 11 : 17;
				removeBet(this, num, objType, odd);
			};
			wlttb.append(ttbbetblock);
		}
		wl.append(wlttb);
	}

	for(c = 1; c < 12; c++){
		let d = c;
		var wlrtl = document.createElement('div');
		wlrtl.setAttribute('id', 'wlrtl_'+c);
		wlrtl.setAttribute('class', 'wlrtl');
		for(i = 1; i < 4; i++){
			let j = i;
			var rtlbb = document.createElement('div');
			rtlbb.setAttribute('class', 'rtlbb'+i);
			var numA = (3 + (3 * (d - 1))) - (j - 1);
			var numB = (6 + (3 * (d - 1))) - (j - 1);
			let num = numA + ', ' + numB;
			rtlbb.onclick = function(){
				setBet(this, num, 'split', 17);
			};
			rtlbb.oncontextmenu = function(e){
				e.preventDefault();
				removeBet(this, num, 'split', 17);
			};
			wlrtl.append(rtlbb);
		}
		wl.append(wlrtl);
	}
	
	for(c = 1; c < 3; c++){
		var wlcb = document.createElement('div');
		wlcb.setAttribute('id', 'wlcb_'+c);
		wlcb.setAttribute('class', 'wlcb');
		for(i = 1; i < 12; i++){
			let count = (c == 1)? i : i + 11;
			var cbbb = document.createElement('div');
			cbbb.setAttribute('id', 'cbbb_'+count);
			cbbb.setAttribute('class', 'cbbb');
			var numA = '2';
			var numB = '3';
			var numC = '5';
			var numD = '6';
			let num = (count >= 1 && count < 12)? (parseInt(numA) + ((count - 1) * 3)) + ', ' + (parseInt(numB)+((count - 1) * 3)) + ', ' + (parseInt(numC)+((count - 1) * 3)) + ', ' + (parseInt(numD)+((count - 1) * 3)) : ((parseInt(numA) - 1) + ((count - 12) * 3)) + ', ' + ((parseInt(numB) - 1)+((count - 12) * 3)) + ', ' + ((parseInt(numC) - 1)+((count - 12) * 3)) + ', ' + ((parseInt(numD) - 1)+((count - 12) * 3));
			cbbb.onclick = function(){
				setBet(this, num, "corner_bet", 8);
			};
			cbbb.oncontextmenu = function(e){
				e.preventDefault();
				removeBet(this, num, "corner_bet", 8);
			};
			wlcb.append(cbbb);
		}
		wl.append(wlcb);
	}

	bettingBoard.append(wl);

	let bbtop = document.createElement('div');
	bbtop.setAttribute('class', 'bbtop');
	let bbtopBlocks = ['1 to 18', '19 to 36'];
	for(i = 0; i < bbtopBlocks.length; i++){
		let f = i;
		var bbtoptwo = document.createElement('div');
		bbtoptwo.setAttribute('class', 'bbtoptwo');
		let num = (f == 0)? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18' : '19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36';
		bbtoptwo.onclick = function(){
			setBet(this, num, "outside_high_low", 1);
		};
		bbtoptwo.oncontextmenu = function(e){
			e.preventDefault();
			removeBet(this, num, "outside_high_low", 1);
		};
		bbtoptwo.innerText = bbtopBlocks[i];
		bbtop.append(bbtoptwo);
	}
	bettingBoard.append(bbtop);

	let numberBoard = document.createElement('div');
	numberBoard.setAttribute('class', 'number_board');

	let zero = document.createElement('div');
	zero.setAttribute('class', 'number_0');
	var odds = 35;
	zero.onclick = function(){
		setBet(this, '0', "inside_whole", odds);
	};
	zero.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '0', "inside_whole", odds);
	};
	let nbnz = document.createElement('div');
	nbnz.setAttribute('class', 'nbn');
	nbnz.innerText = '0';
	zero.append(nbnz);
	numberBoard.append(zero);
	
	var numberBlocks = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, '2 to 1', 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, '2 to 1', 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, '2 to 1'];
	var redBlocks = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
	for(i = 0; i < numberBlocks.length; i++){
		let a = i;
		var nbClass = (numberBlocks[i] == '2 to 1')? 'tt1_block' : 'number_block';
		var colourClass = (redBlocks.includes(numberBlocks[i]))? ' redNum' : ((nbClass == 'number_block')? ' blackNum' : '');
		var numberBlock = document.createElement('div');
		numberBlock.setAttribute('class', nbClass + colourClass);
		numberBlock.onclick = function(){
			if(numberBlocks[a] != '2 to 1'){
				setBet(this, ''+numberBlocks[a]+'', 'inside_whole', 35);
			}else{
				num = (a == 12)? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : ((a == 25)? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
				setBet(this, num, 'outside_column', 2);
			}
		};
		numberBlock.oncontextmenu = function(e){
			e.preventDefault();
			if(numberBlocks[a] != '2 to 1'){
				removeBet(this, ''+numberBlocks[a]+'', 'inside_whole', 35);
			}else{
				num = (a == 12)? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : ((a == 25)? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
				removeBet(this, num, 'outside_column', 2);
			}
		};
		var nbn = document.createElement('div');
		nbn.setAttribute('class', 'nbn');
		nbn.innerText = numberBlocks[i];
		numberBlock.append(nbn);
		numberBoard.append(numberBlock);
	}
	bettingBoard.append(numberBoard);

	let bo3Board = document.createElement('div');
	bo3Board.setAttribute('class', 'bo3_board');	
	let bo3Blocks = ['1 to 12', '13 to 24', '25 to 36'];
	for(i = 0; i < bo3Blocks.length; i++){
		let b = i;
		var bo3Block = document.createElement('div');
		bo3Block.setAttribute('class', 'bo3_block');
		bo3Block.onclick = function(){
			num = (b == 0)? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : ((b == 1)? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
			setBet(this, num, 'outside_dozen', 2);
		};
		bo3Block.oncontextmenu = function(e){
			e.preventDefault();
			num = (b == 0)? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : ((b == 1)? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
			removeBet(this, num, 'outside_dozen', 2);
		};
		bo3Block.innerText = bo3Blocks[i];
		bo3Board.append(bo3Block);
	}
	bettingBoard.append(bo3Board);

	let otoBoard = document.createElement('div');
	otoBoard.setAttribute('class', 'oto_board');	
	let otoBlocks = ['EVEN', 'RED', 'BLACK', 'ODD'];
	for(i = 0; i < otoBlocks.length; i++){
		let d = i;
		var colourClass = (otoBlocks[i] == 'RED')? ' redNum' : ((otoBlocks[i] == 'BLACK')? ' blackNum' : '');
		var otoBlock = document.createElement('div');
		otoBlock.setAttribute('class', 'oto_block' + colourClass);
		otoBlock.onclick = function(){
			num = (d == 0)? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : ((d == 1)? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' : ((d == 2)? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' : '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
			setBet(this, num, 'outside_oerb', 1);
		};
		otoBlock.oncontextmenu = function(e){
			num = (d == 0)? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : ((d == 1)? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' : ((d == 2)? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' : '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
			e.preventDefault();
			removeBet(this, num, 'outside_oerb', 1);
		};
		otoBlock.innerText = otoBlocks[i];
		otoBoard.append(otoBlock);
	}
	bettingBoard.append(otoBoard);

	let chipDeck = document.createElement('div');
	chipDeck.setAttribute('class', 'chipDeck');
	let chipValues = [1, 5, 10, 100, 'clear'];
	for(i = 0; i < chipValues.length; i++){
		let cvi = i;
		let chipColour = (i == 0)? 'red' : ((i == 1)? 'blue cdChipActive' : ((i == 2)? 'orange' : ((i == 3)? 'gold' : 'clearBet')));
		let chip = document.createElement('div');
		chip.setAttribute('class', 'cdChip ' + chipColour);
		chip.onclick = function(){
			if(cvi !== 4){
				let cdChipActive = document.getElementsByClassName('cdChipActive');
				for(i = 0; i < cdChipActive.length; i++){
					cdChipActive[i].classList.remove('cdChipActive');
				}
				let curClass = this.getAttribute('class');
				if(!curClass.includes('cdChipActive')){
					this.setAttribute('class', curClass + ' cdChipActive');
				}
				wager = parseInt(chip.childNodes[0].innerText);
			}else{
				bankValue = bankValue + currentBet;
				currentBet = 0;
				document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
				document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
				if (document.getElementById("spinBtn")) {
					document.getElementById("spinBtn").remove();
				}
				clearBet();
				removeChips();
				resetGame();
			}
		};
		let chipSpan = document.createElement('span');
		chipSpan.setAttribute('class', 'cdChipSpan');
		chipSpan.innerText = chipValues[i];
		chip.append(chipSpan);
		chipDeck.append(chip);
	}
	bettingBoard.append(chipDeck);

	let bankContainer = document.createElement('div');
	bankContainer.setAttribute('class', 'bankContainer');

	let bank = document.createElement('div');
	bank.setAttribute('class', 'bank');
	let bankSpan = document.createElement('span');
	bankSpan.setAttribute('id', 'bankSpan');
	bankSpan.innerText = '' + bankValue.toLocaleString("en-GB") + '';
	bank.append(bankSpan);
	bankContainer.append(bank);

	let bet = document.createElement('div');
	bet.setAttribute('class', 'bet');
	let betSpan = document.createElement('span');
	betSpan.setAttribute('id', 'betSpan');
	betSpan.innerText = '' + currentBet.toLocaleString("en-GB") + '';
	bet.append(betSpan);
	bankContainer.append(bet);	

	let maxBet = document.createElement('div');
	maxBet.setAttribute('class', 'maxBet');
	let maxBetSpan = document.createElement('span');
	maxBetSpan.setAttribute('id', 'maxBetSpan');
	maxBetSpan.innerText = 'MAX BET - 100 silk';
	maxBet.append(maxBetSpan);
	bankContainer.append(maxBet);




	bettingBoard.append(bankContainer);
	
	

	let pnBlock = document.createElement('div');
	pnBlock.setAttribute('class', 'pnBlock');
	let pnContent = document.createElement('div');
	pnContent.setAttribute('id', 'pnContent');
	pnContent.onwheel = function(e){
		e.preventDefault();
		pnContent.scrollLeft += e.deltaY;
	};
	pnBlock.append(pnContent);	
	bettingBoard.append(pnBlock);
	
	container.append(bettingBoard);

	
}


function clearBet(){
	bet = [];
	numbersBet = [];
}

function setBet(e, n, t, o){
	lastWager = wager;
	wager = (bankValue < wager)? bankValue : wager;
	if ((currentBet + wager) > 100) {
		return
	} 
	if(wager > 0){
		if(!container.querySelector('.spinBtn')){
			let spinBtn = document.createElement('div');
			spinBtn.setAttribute('class', 'spinBtn');
			spinBtn.setAttribute('id', 'spinBtn');
			spinBtn.innerText = 'spin';
			spinBtn.onclick = function(){
				this.remove();
				spin();
			};
			container.append(spinBtn);
		}
		bankValue = bankValue - wager;
		currentBet = currentBet + wager;
		document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
		document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
		for(i = 0; i < bet.length; i++){
			if(bet[i].numbers == n && bet[i].type == t){
				bet[i].amt = bet[i].amt + wager;
				let chipColour = (bet[i].amt < 5)? 'red' : ((bet[i].amt < 10)? 'blue' : ((bet[i].amt < 100)? 'orange' : 'gold'));
				e.querySelector('.chip').style.cssText = '';
				e.querySelector('.chip').setAttribute('class', 'chip ' + chipColour);
				let chipSpan = e.querySelector('.chipSpan');
				chipSpan.innerText = bet[i].amt;
				return;
			}
		}
		var obj = {
			amt: wager,
			type: t,
			odds: o,
			numbers: n
		};
		bet.push(obj);
		
		let numArray = n.split(',').map(Number);
		for(i = 0; i < numArray.length; i++){
			if(!numbersBet.includes(numArray[i])){
				numbersBet.push(numArray[i]);
			}
		}

		if(!e.querySelector('.chip')){
			let chipColour = (wager < 5)? 'red' : ((wager < 10)? 'blue' : ((wager < 100)? 'orange' : 'gold'));
			let chip = document.createElement('div');
			chip.setAttribute('class', 'chip ' + chipColour);
			let chipSpan = document.createElement('span');
			chipSpan.setAttribute('class', 'chipSpan');
			chipSpan.innerText = wager;
			chip.append(chipSpan);
			e.append(chip);
		}
	}
}

async function spin(){
	let sendBets = [];
	for (i = 0; i < bet.length; i++) {
		if (bet[i].amt !== 0) {
			let single_bet = {
				bet_type: bet[i].type,
				numbers: bet[i].numbers,
				wager: bet[i].amt.toString()
			};
			sendBets.push(single_bet);
		}
	}
	let contract_values = await enter(sendBets, currentBet);
	let winningSpin = contract_values[0];
	spinWheel(contract_values[0]);
	setTimeout(function(){
		win(contract_values[0], contract_values[1], contract_values[2]);
		currentBet = 0;
		document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
		document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
		
		let pnClass = (numRed.includes(winningSpin))? 'pnRed' : ((winningSpin == 0)? 'pnGreen' : 'pnBlack');
		let pnContent = document.getElementById('pnContent');
		let pnSpan = document.createElement('span');
		pnSpan.setAttribute('class', pnClass);
		pnSpan.innerText = winningSpin;
		pnContent.append(pnSpan);
		pnContent.scrollLeft = pnContent.scrollWidth;

		bet = [];
		numbersBet = [];
		removeChips();
		wager = lastWager;
		if(bankValue == 0 && currentBet == 0){
			gameOver();
		}
	}, 10000);
}

function win(winningSpin, winValue, betTotal){
	if(winValue > 0){
		bankValue += winValue;
		bankValue += betTotal;
		let notification = document.createElement('div');
		notification.setAttribute('id', 'notification');
			let nSpan = document.createElement('div');
			nSpan.setAttribute('class', 'nSpan');
				let nsnumber = document.createElement('span');
				nsnumber.setAttribute('class', 'nsnumber');
				nsnumber.style.cssText = (numRed.includes(winningSpin))? 'color:red' : 'color:black';
				nsnumber.innerText = winningSpin;
				nSpan.append(nsnumber);
				let nsTxt = document.createElement('span');
				nsTxt.innerText = ' Win';
				nSpan.append(nsTxt);
				let nsWin = document.createElement('div');
				nsWin.setAttribute('class', 'nsWin');
					let nsWinBlock = document.createElement('div');
					nsWinBlock.setAttribute('class', 'nsWinBlock');
					nsWinBlock.innerText = 'Bet: ' + betTotal;
					nSpan.append(nsWinBlock);
					nsWin.append(nsWinBlock);
					nsWinBlock = document.createElement('div');
					nsWinBlock.setAttribute('class', 'nsWinBlock');
					nsWinBlock.innerText = 'Win: ' + winValue;
					nSpan.append(nsWinBlock);
					nsWin.append(nsWinBlock);
					nsWinBlock = document.createElement('div');
					nsWinBlock.setAttribute('class', 'nsWinBlock');
					nsWinBlock.innerText = 'Payout: ' + (winValue + betTotal);
					nsWin.append(nsWinBlock);
				nSpan.append(nsWin);
			notification.append(nSpan);
		container.prepend(notification);
		setTimeout(function(){
			notification.style.cssText = 'opacity:0';
		}, 3000);
		setTimeout(function(){
			notification.remove();
		}, 4000);
	}
}

function removeBet(e, n, t, o){
	wager = (wager == 0)? 100 : wager;
	for(i = 0; i < bet.length; i++){
		if(bet[i].numbers == n && bet[i].type == t){
			if(bet[i].amt != 0){
				wager = (bet[i].amt > wager)? wager : bet[i].amt;
				bet[i].amt = bet[i].amt - wager;
				bankValue = bankValue + wager;
				currentBet = currentBet - wager;
				document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
				document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
				if(bet[i].amt == 0){
					e.querySelector('.chip').style.cssText = 'display:none';
				}else{
					let chipColour = (bet[i].amt < 5)? 'red' : ((bet[i].amt < 10)? 'blue' : ((bet[i].amt < 100)? 'orange' : 'gold'));
					e.querySelector('.chip').setAttribute('class', 'chip ' + chipColour);
					let chipSpan = e.querySelector('.chipSpan');
					chipSpan.innerText = bet[i].amt;
				}
			}
		}
	}

	if(currentBet == 0 && container.querySelector('.spinBtn')){
		document.getElementsByClassName('spinBtn')[0].remove();
	}
}

function spinWheel(winningSpin){
	for(i = 0; i < wheelnumbersAC.length; i++){
		if(wheelnumbersAC[i] == winningSpin){
			var degree = (i * 9.73) + 362;
		}
	}
	wheel.style.cssText = 'animation: wheelRotate 5s linear infinite;';
	ballTrack.style.cssText = 'animation: ballRotate 1s linear infinite;';

	setTimeout(function(){
		ballTrack.style.cssText = 'animation: ballRotate 2s linear infinite;';
		style = document.createElement('style');
		style.type = 'text/css';
		style.innerText = '@keyframes ballStop {from {transform: rotate(0deg);}to{transform: rotate(-'+degree+'deg);}}';
		document.head.appendChild(style);
	}, 2000);
	setTimeout(function(){
		ballTrack.style.cssText = 'animation: ballStop 3s linear;';
	}, 6000);
	setTimeout(function(){
		ballTrack.style.cssText = 'transform: rotate(-'+degree+'deg);';
	}, 9000);
	setTimeout(function(){
		wheel.style.cssText = '';
		style.remove();
	}, 10000);
}

function removeChips(){
	var chips = document.getElementsByClassName('chip');
	if(chips.length > 0){
		for(i = 0; i < chips.length; i++){
			chips[i].remove();
		}
		removeChips();
	}
}
