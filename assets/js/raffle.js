document.getElementById("rules-nav").addEventListener("click", async() => {
    document.getElementById("raffle-nav").classList.remove("active");
    document.getElementById("rules-nav").classList.add("active");
    document.getElementById("ticket-nav").classList.remove("active");
    document.getElementById("history-nav").classList.remove("active");
    document.getElementById("raffle-box").classList.add("remove");
    document.getElementById("rules-box").classList.remove("remove");
    document.getElementById("tickets-box").classList.add("remove");
    document.getElementById("history-box").classList.add("remove");
});

document.getElementById("raffle-nav").addEventListener("click", async() => {
    document.getElementById("raffle-nav").classList.add("active");
    document.getElementById("rules-nav").classList.remove("active");
    document.getElementById("ticket-nav").classList.remove("active");
    document.getElementById("history-nav").classList.remove("active");
    document.getElementById("raffle-box").classList.remove("remove");
    document.getElementById("rules-box").classList.add("remove");
    document.getElementById("tickets-box").classList.add("remove");
    document.getElementById("history-box").classList.add("remove");
});
document.getElementById("ticket-nav").addEventListener("click", async() => {
    document.getElementById("ticket-nav").classList.add("active");
    document.getElementById("raffle-nav").classList.remove("active");
    document.getElementById("rules-nav").classList.remove("active");
    document.getElementById("history-nav").classList.remove("active");
    document.getElementById("tickets-box").classList.remove("remove");
    document.getElementById("rules-box").classList.add("remove");
    document.getElementById("raffle-box").classList.add("remove");
    document.getElementById("history-box").classList.add("remove");
});
document.getElementById("history-nav").addEventListener("click", async() => {
    document.getElementById("history-nav").classList.add("active");
    document.getElementById("ticket-nav").classList.remove("active");
    document.getElementById("raffle-nav").classList.remove("active");
    document.getElementById("rules-nav").classList.remove("active");
    document.getElementById("tickets-box").classList.add("remove");
    document.getElementById("rules-box").classList.add("remove");
    document.getElementById("raffle-box").classList.add("remove");
    document.getElementById("history-box").classList.remove("remove");
});


let cross_test;
let drawing_end = false;

function test() {
    if (cross_test) {
        return;
    }
    if (drawing_end) {
        endRaffle();
        return;
    }
    let quantity = document.getElementById("numberinput").value;
    setTimeout(() => {
        document.getElementById("numberinput").value = 1;
    }, 2000);
    enterRaffle(quantity);
    event.preventDefault();
}

function changeValue() {
    cross_test = true;
    console.log("change");
    event.preventDefault();
    setTimeout(function(){
        cross_test = false;
    },1);
}

async function enterRaffle(quantity){
	let hookmsg = {
    raffle: {
      quantity: Number(quantity)
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
				amount: (quantity * 1000000).toString(),
				msg: hookmsg64,
			}
		}
	});
	let tx = await secretjs.tx.broadcast([msg], {
		gasLimit: 1_000_000,
		gasPriceInFeeDenom: 0.1,
		feeDenom: "uscrt",
	});
	console.log(tx);
    let tickets = tx.arrayLog.find(
        (log) => log.type === "wasm" && log.key === "tickets"
    ).value.split(",");
    notification(tickets);
};


async function start(){
    let state = await getState();
    setInterval(getState,100000);
    next_drawing = state.drawing_end / 1000000;
    let ticket_log = await query_ticket_log();
    for (let i = 0; i < ticket_log.length; i++) {
        let tickets_box = document.getElementById("tickets-box");
        let bank = document.createElement('div');
        bank.setAttribute('class', 'ticket');
        bank.innerText = 'TICKET #' + ticket_log[i];
        tickets_box.append(bank);
    }
}
function notification(tickets) {
    let notification = document.createElement('div');
    notification.setAttribute('id', 'notification');
    let nsnumber = document.createElement('span');
    nsnumber.setAttribute('class', 'nsnumber');
    nsnumber.innerText = "Succsessfully purchased " + tickets.length + " tickets";
    notification.append(nsnumber);
    let raffle_box = document.getElementById("raffle-box");
    raffle_box.prepend(notification);
    let tickets_box = document.getElementById("tickets-box");
    for (let i = 0; i < tickets.length; i++) {
        let ticket = document.createElement('div');
        ticket.setAttribute('class', 'ticket');
        ticket.innerText = 'TICKET #' + tickets[i];
        tickets_box.append(ticket);
    }
    setTimeout(function(){
        notification.style.cssText = 'opacity:0';
    }, 3000);
    setTimeout(function(){
        notification.remove();
    }, 4000);
}
async function query_ticket_log(){
	let query = await secretjs.query.compute.queryContract({
	  contract_address: lottery_contract,
	  code_hash: lottery_hash,
	  query: {
		  ticket_log: {
			address: window.secretjs.address
		},
	  }
	});
    console.log("ticket log");
    console.log(query);
	return(query.tickets);
};
document.getElementById("query-button").addEventListener("click", async() => {
    let query = await query_last_drawing();
    document.getElementById("betAlert").classList.add("remove");
    let history_box = document.getElementById("history-box");
    let winner = document.createElement("h2");
    winner.innerText = "last winner - " + query.winner;
    history_box.append(winner);
    let ticket_label = document.createElement("h2");
    ticket_label.innerText = "my tickets";
    history_box.append(ticket_label);
    for (let i = 0; i < query.tickets.length; i++) {
        let bank = document.createElement('div');
        bank.setAttribute('class', 'ticket');
        bank.innerText = 'TICKET #' + query.tickets[i];
        history_box.append(bank);
    }



});
async function query_last_drawing(){
	let query = await secretjs.query.compute.queryContract({
	  contract_address: lottery_contract,
	  code_hash: lottery_hash,
	  query: {
		  last_raffle: {
			address: window.secretjs.address
		},
	  }
	});
    console.log("ticket log");
    console.log(query);
	return(query);
};


let next_drawing;

async function endRaffle(){
	let msg = new MsgExecuteContract({
		sender: secretjs.address,
		contract_address: lottery_contract,
    code_hash: lottery_hash,
		msg: {
			raffle: {},
		}
	});
	let resp = await secretjs.tx.broadcast([msg], {
		gasLimit: 1_000_000,
		gasPriceInFeeDenom: 0.1,
		feeDenom: "uscrt",
	});
	console.log(resp);
};

async function getState(){
	let stateinfo = await secretjs.query.compute.queryContract({
	  contract_address: lottery_contract,
	  code_hash: lottery_hash,
	  query: {
		  get_state: {},
	  }
	});
    let jackpot = stateinfo.state.jackpot / 1000000;
    console.log("jackpot");
    console.log(jackpot);
    document.getElementById("change").innerHTML = Math.floor(jackpot);
    if (stateinfo.state.drawing_end < Date.now() * 1000000) {
        drawing_end = true;
        document.getElementById("button").innerHTML = "Get Winner";
    }
	return(stateinfo.state);
};

function updateTimer(state) {
    future = next_drawing;
    now = new Date();
    diff = future - now;

    days = Math.floor(diff / (1000 * 60 * 60 * 24));
    hours = Math.floor(diff / (1000 * 60 * 60));
    mins = Math.floor(diff / (1000 * 60));
    secs = Math.floor(diff / 1000);

    d = days;
    h = hours - days * 24;
    m = mins - hours * 60;
    s = secs - mins * 60;

    document.getElementById("timer")
        .innerHTML =
        '<div>' + d + '<span>Days</span></div>' +
        '<div>' + h + '<span>Hours</span></div>' +
        '<div>' + m + '<span>Minutes</span></div>' +
        '<div>' + s + '<span>Seconds</span></div>';
}
setInterval('updateTimer()', 1000);