const { SecretNetworkClient, MsgExecuteContract } = window.secretjs;


const zoo_contract =  "secret1hqt9aus6v8fmlj9zzhzek2mh2u8qfazl0khrzr";
const zoo_hash =  "ecdeedee3debd2d1a6aa22b80d499a0a58096922dcceac12c0a7e22712145a71";
const snip_contract = 'secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd';
const snip_hash = '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e';
const decimal = 1000000;

let viewing_key;
let snip_balance;


window.onload = async () => {
    connectKeplr();
};
window.addEventListener("keplr_keystorechange", () => {
    console.log("changed accounts")
    location.reload(true);
})

            
async function connectKeplr() {

    this.chainId = 'secret-4';

    await window.keplr.enable(chainId);

    const keplrOfflineSigner = window.keplr.getOfflineSignerOnlyAmino(chainId);
    const accounts = await keplrOfflineSigner.getAccounts();
    this.address = accounts[0].address;

    const url = "https://lcd.secret.express";

    window.secretjs = new SecretNetworkClient({
        url,
        chainId: this.chainId,
        wallet: keplrOfflineSigner,
        walletAddress: this.address,
        encryptionUtils: window.keplr.getEnigmaUtils(chainId),
    });

    if (this.address) {
        try {
            start();
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("error connecting to keplr");
    }
}

