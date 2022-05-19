import { MyERC20__factory, DAO__factory } from "../typechain";
import { task } from "hardhat/config";
import '@nomiclabs/hardhat-ethers'

// daoAddress 0x906B4B34d1Ba0F4C551eE912Fcf49a974b6EBFEF
// пример description
// "mint 10000 token to address 0x7B55f2b7708EaF2ac2165f6b5F86d41f674002b7"
// пример abiArguments
// '[{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name": "_value","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"}],["0x7B55f2b7708EaF2ac2165f6b5F86d41f674002b7",10000]'
// пример calldata 
// "0x40c10f190000000000000000000000007b55f2b7708eaf2ac2165f6b5f86d41f674002b70000000000000000000000000000000000000000000000000000000000002710"
// callAddres 0x6b188f7f3F640778BfC3F44dc6406c179e4913a6



// функция addProposal
task("addProposal", "add new proposal")
    .addParam("daoAddress")
    .addParam("description")
    .addParam("abiArguments")
    .addParam("calldata")
    .addParam("callAddres")
    .setAction(async (args, hre) => {
        // подключаемся к контракту
        const DaoFactory = (await hre.ethers.getContractFactory("DAO")) as DAO__factory;
        const dao = await DaoFactory.attach(args.daoAddress);
        console.log(`Successfully connected to the contract DAO`);

        // создаём голосование
        let tx = await dao.addProposal(args.description, args.abiArguments, args.calldata, args.callAddres);
        let receipt = await tx.wait();

        // вытаскиваем event
        let proposals = await dao.getAllProposal();

        // вытаскиваем голосование
        let proposal = await dao.getProposalByID(proposals.length);

        // выводим инфу по голосованию
        console.log(`Add proposal with ID ${proposals.length}`);
        console.log(`Proposal end time ${proposal.pEndTime}`);
        console.log(`Proposal description ${proposal.pDescription}`);
        console.log(`Proposal abi and arguments ${proposal.pAbiArguments}`);
        console.log(`Proposal callData ${proposal.pCallData}`);
        console.log(`Proposal callAddres ${proposal.pCallAddres}`);
});

// функция addDeposit
task("addDeposit", "add deposit to DAO")
    .addParam("daoAddress")
    .addParam("tokenAddress")
    .addParam("deposit")
    .setAction(async (args, hre) => {
        // подключаемся к контракту DAO
        const DaoFactory = (await hre.ethers.getContractFactory("DAO")) as DAO__factory;
        const dao = await DaoFactory.attach(args.daoAddress);
        console.log(`Successfully connected to the contract DAO`);

        // подключаемся к контракту токенов для голосования
        const ERC20Factory = (await hre.ethers.getContractFactory("MyERC20"));
        const erc20TOK = await ERC20Factory.attach(args.tokenAddress);
        console.log(`Successfully connected to the token contract`);

        // апруваем токены
        let tx = await erc20TOK.approve(dao.address, args.deposit);
        await tx.wait();
        console.log(`Successfully approve token`);

        // делаем депозит
        tx = await dao.addDeposit(args.deposit);
        await tx.wait();
        console.log(`Deposit made successfully`);

        // вытаскиваем депозит
        let deposit = await dao.getDeposit();

        // выводим инфу по голосованию
        console.log(`Deposit successfully added`);
        console.log(`Your deposit is ${deposit.allTokens}`);
        console.log(`Of which frozen ${deposit.frozenToken}`);
});


// функция Vote
task("Vote", "Vote to proposal")
    .addParam("daoAddress")
    .addParam("pId")
    .addParam("choice")
    .setAction(async (args, hre) => {
        // подключаемся к контракту DAO
        const DaoFactory = (await hre.ethers.getContractFactory("DAO")) as DAO__factory;
        const dao = await DaoFactory.attach(args.daoAddress);
        console.log(`Successfully connected to the contract DAO`);

        // голосуем
        let tx = await dao.vote(args.pId, args.choice);
        await tx.wait();
        console.log(`Your vote is accepted`);
});

// функция finishProposal дописать
task("finishProposal", "finish proposal")
    .addParam("daoAddress")
    .addParam("pId")
    .setAction(async (args, hre) => {
        // подключаемся к контракту DAO
        const DaoFactory = (await hre.ethers.getContractFactory("DAO")) as DAO__factory;
        const dao = await DaoFactory.attach(args.daoAddress);
        console.log(`Successfully connected to the contract DAO`);

        // заканчиваем голосование
        let tx = await dao.finishProposal(args.pId);
        await tx.wait();

        console.log(`Voting successfully completed`)
});