import { MyERC20, DAO } from "../typechain";
import { ethers } from "hardhat";

async function main() {

    // истансы контрактов
    // это токен голосования
    let erc20TOK : MyERC20;
    // это некий наградной токен, за выпуск которого будем голосовать
    let erc20award : MyERC20;
    // это контракт dao
    let dao : DAO;
    // аргументы для конструкторов контрактов
    const ercTokName = "TokToken";
    const ercTokSymbol = "TOK";
    const ercAwardName = "AwardToken";
    const ercAwardSymbol = "ARD";
    const decimals = 3;
    const time = 1800;

    const ERC20Factory = (await ethers.getContractFactory("MyERC20"));

    // деплоим erc20TOK
    erc20TOK = await ERC20Factory.deploy(ercTokName, ercTokSymbol, decimals);
    console.log("Token erc20TOK deployed to:", erc20TOK.address); 
    // деплоим erc20TOK
    erc20award = await ERC20Factory.deploy(ercAwardName, ercAwardSymbol, decimals);
    console.log("Token erc20award deployed to:", erc20award.address); 

    // деплоим DAO
    const DaoFactory = (await ethers.getContractFactory("DAO"));
    dao = await DaoFactory.deploy(erc20TOK.address, time);
    console.log("DAO deployed to:", dao.address); 

    // разрешаем контракту dao минтить токены erc20award
    // нешуточные страсти развернуться вокруг голосований о том,
    // на чей адрес наминтить новые токены
    let admin = await erc20award.administrator();
    let tx = await erc20award.grantRole(admin, dao.address);
    await tx.wait();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
/*
Token erc20TOK deployed to: 0x150bCb22767b9f873213997211e0E497679D2CD0
Token erc20award deployed to: 0x6b188f7f3F640778BfC3F44dc6406c179e4913a6
DAO deployed to: 0x906B4B34d1Ba0F4C551eE912Fcf49a974b6EBFEF
*/

