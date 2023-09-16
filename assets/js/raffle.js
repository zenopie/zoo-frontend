document.getElementById("rules-nav").addEventListener("click", async() => {
    document.getElementById("raffle-nav").classList.remove("active");
    document.getElementById("rules-nav").classList.add("active");
    document.getElementById("ticket-nav").classList.remove("active");
    document.getElementById("raffle-box").classList.add("remove");
    document.getElementById("rules-box").classList.remove("remove");
    document.getElementById("tickets-box").classList.add("remove");
});

document.getElementById("raffle-nav").addEventListener("click", async() => {
    document.getElementById("raffle-nav").classList.add("active");
    document.getElementById("rules-nav").classList.remove("active");
    document.getElementById("ticket-nav").classList.remove("active");
    document.getElementById("raffle-box").classList.remove("remove");
    document.getElementById("rules-box").classList.add("remove");
    document.getElementById("tickets-box").classList.add("remove");
});
document.getElementById("ticket-nav").addEventListener("click", async() => {
    document.getElementById("ticket-nav").classList.add("active");
    document.getElementById("raffle-nav").classList.remove("active");
    document.getElementById("rules-nav").classList.remove("active");
    document.getElementById("tickets-box").classList.remove("remove");
    document.getElementById("rules-box").classList.add("remove");
    document.getElementById("raffle-box").classList.add("remove");

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
    console.log(quantity);
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
	let resp = await secretjs.tx.broadcast([msg], {
		gasLimit: 1_000_000,
		gasPriceInFeeDenom: 0.1,
		feeDenom: "uscrt",
	});
	console.log(resp);
};


async function start(){
    let state = await getState();
    setInterval(getState,100000);
    next_drawing = state.drawing_end / 1000000;
    let ticket_log = await query();
    console.log(ticket_log);
    for (let i = 0; i < ticket_log.length; i++) {
        let tickets_box = document.getElementById("tickets-box");
        let bank = document.createElement('div');
        bank.setAttribute('class', 'ticket');
        bank.innerText = 'TICKET #' + ticket_log[i];
        tickets_box.append(bank);
    }
}
async function query(){
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