// import "hardhat-tracer";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MyERC20, DAO } from "../typechain";
import { hrtime } from "process";

describe("Testing DAO",  function () {

    // истансы контрактов
    // это токен голосования
    let erc20TOK : MyERC20;
    // это некий наградной токен, за выпуск которого будем голосовать
    let erc20award : MyERC20;
    // это контракт dao
    let dao : DAO;

    // аккаунты
    let owner : SignerWithAddress;
    let voter_1 : SignerWithAddress;
    let voter_2 : SignerWithAddress;
    let voter_3 : SignerWithAddress;
    let voter_4 : SignerWithAddress;
    let hacker : SignerWithAddress;

    // прочие полезности
    let amountMintAward = 10000;
    const value = 10000;
    const time = 259200;

    // аргументы для конструкторов контрактов
    const ercTokName = "TokToken";
    const ercTokSymbol = "TOK";
    const ercAwardName = "AwardToken";
    const ercAwardSymbol = "ARD";
    const decimals = 3;

    before(async function(){
        [owner, voter_1, voter_2, voter_3, voter_4, hacker] = await ethers.getSigners();

        // деплоим erc20TOK
        const ERC20Factory = (await ethers.getContractFactory("MyERC20"));
        erc20TOK = await ERC20Factory.deploy(ercTokName, ercTokSymbol, decimals);

        // деплоим erc20Award
        erc20award = await ERC20Factory.deploy(ercAwardName, ercAwardSymbol, decimals);

        // деплоим DAO
        const DaoFactory = (await ethers.getContractFactory("DAO"));
        dao = await DaoFactory.deploy(erc20TOK.address, time);
    })

    // минтим токены на адреса избирателей
    it("mint() erc20", async function(){
    
        let tx  = await erc20TOK.mint(voter_1.address, value);
        await tx.wait();
        tx  = await erc20TOK.mint(voter_2.address, value);
        await tx.wait();
        tx  = await erc20TOK.mint(voter_3.address, value);
        await tx.wait();
        tx  = await erc20TOK.mint(voter_4.address, value);
        await tx.wait();
        //tx  = await erc20TOK.mint(hacker.address, value);
        //await tx.wait();
    })

    // добавляем депозит
    // для этого надо апрувнуть токены для контракта dao и вызывать функцию addDeposit
    it("check addDeposit()", async function(){
        
        // вносим депозит для 1 избирателя
        let deposit = 10000;
        let depositBefore = await dao.connect(voter_1).getDeposit();
        let balanceBefore = await erc20TOK.balanceOf(voter_1.address);
        // апруваем токены
        let tx = await erc20TOK.connect(voter_1).approve(dao.address, deposit);
        await tx.wait();
        // делаем депозит
        tx = await dao.connect(voter_1).addDeposit(deposit);
        await tx.wait();
        // проверим, что изменился баланс и депозит
        expect(await erc20TOK.balanceOf(voter_1.address)).equal(balanceBefore.sub(deposit));
        expect((await dao.connect(voter_1).getDeposit()).allTokens).equal(depositBefore.allTokens.add(deposit));

        // вносим депозит для 2 избирателя
        deposit = 5000;
        depositBefore = await dao.connect(voter_2).getDeposit();
        balanceBefore = await erc20TOK.balanceOf(voter_2.address);
        // апруваем токены
        tx = await erc20TOK.connect(voter_2).approve(dao.address, deposit);
        await tx.wait();
        // делаем депозит
        tx = await dao.connect(voter_2).addDeposit(deposit);
        await tx.wait();
        // проверим, что изменился баланс и депозит
        expect(await erc20TOK.balanceOf(voter_2.address)).equal(balanceBefore.sub(deposit));
        expect((await dao.connect(voter_2).getDeposit()).allTokens).equal(depositBefore.allTokens.add(deposit));

        // вносим депозит для 3 избирателя
        deposit = 5000;
        depositBefore = await dao.connect(voter_3).getDeposit();
        balanceBefore = await erc20TOK.balanceOf(voter_3.address);
        // апруваем токены
        tx = await erc20TOK.connect(voter_3).approve(dao.address, deposit);
        await tx.wait();
        // делаем депозит
        tx = await dao.connect(voter_3).addDeposit(deposit);
        await tx.wait();
        // проверим, что изменился баланс и депозит
        expect(await erc20TOK.balanceOf(voter_3.address)).equal(balanceBefore.sub(deposit));
        expect((await dao.connect(voter_3).getDeposit()).allTokens).equal(depositBefore.allTokens.add(deposit));

        // вносим депозит для 4 избирателя
        deposit = 5000;
        depositBefore = await dao.connect(voter_4).getDeposit();
        balanceBefore = await erc20TOK.balanceOf(voter_4.address);
        // апруваем токены
        tx = await erc20TOK.connect(voter_4).approve(dao.address, deposit);
        await tx.wait();
        // делаем депозит
        tx = await dao.connect(voter_4).addDeposit(deposit);
        await tx.wait();
        // проверим, что изменился баланс и депозит
        expect(await erc20TOK.balanceOf(voter_4.address)).equal(balanceBefore.sub(deposit));
        expect((await dao.connect(voter_4).getDeposit()).allTokens).equal(depositBefore.allTokens.add(deposit));
    })

    // сделать голосование 1
    // Нужен контракт на котором будут голосовать!
    // проголосовать, чтобы был кворум, более 50% токенов
    // завершить голосование, проверить результат
    // чтобы была победа YES
    // сделать голосование 2
    // проголосовать, чтобы был кворум, более 50% токенов
    // заершить голосование, проверить результат
    // чтобы была победа NO
    // сделать голосование 3
    // проголосовать, чтобы не было кворума, проверить результат


    // может добавить функцию для смены админа DAO
    // тогда нужны будут роли и вот это вот всё

    // сделать голосования
    it("check addProposal() dao", async function(){
        
        // разрешаем контракту dao минтить токены erc20award
        // нешуточные страсти развернуться вокруг голосований о том,
        // на чей адрес наминтить новые токены
        let admin = await erc20award.administrator();
        let tx = await erc20award.grantRole(admin, dao.address);
        await tx.wait();
        expect(await erc20award.hasRole(admin, dao.address)).equal(true);

        let jsonAbi =    [{
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "_value",
                    "type": "uint256"
                }
            ],
                "name": "mint",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        }];

        let jsonText =  `[{
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "_value",
                    "type": "uint256"
                }
            ],
                "name": "mint",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        }];`
        const iface = new ethers.utils.Interface(jsonAbi);
        const recipient = erc20award.address;
        // голосование 1
        // это голосование наберёт кворум - более 50% токенов
        // в этом голосовании победят голосовавшие ЗА
        let description = `mint ${amountMintAward} token to address ${voter_1.address}`;
        let abiArguments = `${jsonText},[${voter_1.address},${amountMintAward}]`;
        let calldata = iface.encodeFunctionData('mint', [voter_1.address, amountMintAward]);
        tx = await dao.addProposal(description, abiArguments, calldata, erc20award.address);
        await tx.wait();

        // проверяем, что голосование добавилось правильно
        let proposal = await dao.getProposalByID(1);
        expect(proposal.pDescription).equal(description);
        expect(proposal.pAbiArguments).equal(abiArguments);
        expect(proposal.pCallData).equal(calldata);
        expect(proposal.pCallAddres).equal(erc20award.address);

        // голосование 2
        // это голосование наберёт кворум - более 50% токенов
        // в этом голосовании победят голосовавшие ПРОТИВ
        description = `mint ${amountMintAward} token to address ${voter_3.address}`;
        abiArguments = `${jsonText},[${voter_3.address}, ${amountMintAward}]`;
        calldata = iface.encodeFunctionData('mint', [voter_3.address, amountMintAward]);

        tx = await dao.addProposal(description, abiArguments, calldata, erc20award.address);
        await tx.wait();

        // проверяем, что голосование добавилось правильно
        proposal = await dao.getProposalByID(2);
        expect(proposal.pDescription).equal(description);
        expect(proposal.pAbiArguments).equal(abiArguments);
        expect(proposal.pCallData).equal(calldata);
        expect(proposal.pCallAddres).equal(erc20award.address);

        // голосование 3
        // это голосование не наберёт кворум - более 50% токенов
        description = `mint ${amountMintAward} token to address ${voter_4.address}`;
        abiArguments = `${jsonText},[${voter_4.address}, ${amountMintAward}]`;
        calldata = iface.encodeFunctionData('mint', [voter_4.address, amountMintAward]);

        tx = await dao.addProposal(description, abiArguments, calldata, erc20award.address);
        await tx.wait();

        // проверяем, что голосование добавилось правильно
        proposal = await dao.getProposalByID(3);
        expect(proposal.pDescription).equal(description);
        expect(proposal.pAbiArguments).equal(abiArguments);
        expect(proposal.pCallData).equal(calldata);
        expect(proposal.pCallAddres).equal(erc20award.address);

        // проверяем, что только chairman может добавлять голосования
        await expect(
            dao.connect(hacker).addProposal(description, abiArguments, calldata, erc20award.address)
        ).to.be.revertedWith("You do not have permission to add proposal");
    })

    // Голосуем
    it("check vote() dao", async function(){
        
        // голосование 1
        // это голосование наберёт кворум - более 50% токенов
        // в этом голосовании победят голосовавшие ЗА
        let tx = await dao.connect(voter_1).vote(1, true);
        await tx.wait();
        tx = await dao.connect(voter_2).vote(1, true);
        await tx.wait();
        tx = await dao.connect(voter_3).vote(1, false);
        await tx.wait();
        tx = await dao.connect(voter_4).vote(1, false);
        await tx.wait();

        // голосование 2
        // это голосование наберёт кворум - более 50% токенов
        // в этом голосовании победят голосовавшие ПРОТИВ
        tx = await dao.connect(voter_1).vote(2, false);
        await tx.wait();
        tx = await dao.connect(voter_2).vote(2, false);
        await tx.wait();
        tx = await dao.connect(voter_3).vote(2, true);
        await tx.wait();
        tx = await dao.connect(voter_4).vote(2, true);
        await tx.wait();

        // голосование 3
        // это голосование не наберёт кворум - более 50% токенов
        tx = await dao.connect(voter_4).vote(3, true);
        await tx.wait();

        // проверяем, что 
        // нельзя проголосовать, если не внесён депозит
        await expect(
            dao.connect(hacker).vote(3, true)
        ).to.be.revertedWith("You did not make a deposit");
        // нельзя проголосовать дважды с одно аккаунта в одном голосовании
        await expect(
            dao.connect(voter_1).vote(1, true)
        ).to.be.revertedWith("You already voted");
    })

    // Завершаем голосования
    it("check finishProposal()", async function(){
        
        let deposit = 5000;
        // проверяем, что 
        // нельзя завершить голосование, пока не прошло три дня
        await expect(
            dao.connect(hacker).finishProposal(1)
        ).to.be.revertedWith("Voting time is not over yet");
        // нельзя вывести токены, задействованные в голосовании
        await expect(
            dao.connect(voter_2).withdrawDeposit(deposit)
        ).to.be.revertedWith("This number of tokens is not available for withdrawal from the deposit"); 

        // можно вывести токены не участвовавшие в голосовании,
        // для этого сначала их надо добавить в депозит
        // апруваем токены
        let tx = await erc20TOK.connect(voter_2).approve(dao.address, deposit);
        await tx.wait();
        // делаем депозит
        let depositBefore = (await dao.connect(voter_2).getDeposit()).allTokens;
        tx = await dao.connect(voter_2).addDeposit(deposit);
        await tx.wait();
        expect((await dao.connect(voter_2).getDeposit()).allTokens).equal(depositBefore.add(deposit));
        
        // теперь выводим
        depositBefore = (await dao.connect(voter_2).getDeposit()).allTokens;
        tx = await dao.connect(voter_2).withdrawDeposit(deposit)
        await tx.wait();
        expect((await dao.connect(voter_2).getDeposit()).allTokens).equal(depositBefore.sub(deposit));

        // прогоняем три дня
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const endTime = block.timestamp + time;
        await ethers.provider.send('evm_increaseTime', [endTime]);

        // завершаем голосования и проверяем, что они завершены
        // также ловим евенты и смотрим как завершились голосования
        // кроме того проверям, что функция mint на erc20award сработала

        // голосование 1 должно набрать кворум, победили те, кто ЗА,
        // на адресс voter_1 должны быть заминчины токены erc20award
        let balanceBefore = await erc20award.balanceOf(voter_1.address);
        
        tx = await dao.finishProposal(1);
        let receipt = await tx.wait();

        // вытаскиваем евенты и проверяем, результаты голосования
        let proposal = await dao.getProposalByID(1)
        let events = receipt.events ?? []
        let event = events[1].args ?? ""
        let description = event[0]
        let quorum = event[1]
        let result = event[2]
        let success = event[3]

        // проверка, что    
        // статус голосования изменился
        expect(await proposal.pStatusEnd).equal(true);
        // описание из евента совпадает с описанием голосования
        expect(await proposal.pDescription).equal(description);
        // набрался кворум
        expect(quorum).equal(true);
        // по результату голосов победили ЗА
        expect(result).equal(true);
        // функция за которую голосовали, выполнена успешно
        expect(success).equal(true);
        // токены erc20award успешно заминчины на адрес voter_1
        expect(await erc20award.balanceOf(voter_1.address)).equal(balanceBefore.add(amountMintAward));

        // голосование 2 должно набрать кворум, победили те, кто ПРОТИВ,
        // на адресс voter_3 не будут заминчины токены erc20award
        balanceBefore = await erc20award.balanceOf(voter_3.address);
        
        tx = await dao.finishProposal(2);
        receipt = await tx.wait();

        // вытаскиваем евенты и проверяем, результаты голосования
        proposal = await dao.getProposalByID(2)
        events = receipt.events ?? []
        event = events[0].args ?? ""
        description = event[0]
        quorum = event[1]
        result = event[2]
        success = event[3]

        // проверка, что    
        // статус голосования изменился
        expect(await proposal.pStatusEnd).equal(true);
        // описание из евента совпадает с описанием голосования
        expect(await proposal.pDescription).equal(description);
        // набрался кворум
        expect(quorum).equal(true);
        // по результату голосов победили ПРОТИВ
        expect(result).equal(false);
        // функция за которую голосовали, выполнена успешно
        expect(success).equal(false);
        // токены erc20award не были заминчины на адрес voter_3
        expect(await erc20award.balanceOf(voter_3.address)).equal(balanceBefore);


        // голосование 3 не набрало кворум,
        // на адресс voter_4 не будут заминчины токены erc20award
        balanceBefore = await erc20award.balanceOf(voter_4.address);
        
        tx = await dao.finishProposal(3);
        receipt = await tx.wait();

        // вытаскиваем евенты и проверяем, результаты голосования
        proposal = await dao.getProposalByID(3)
        events = receipt.events ?? []
        event = events[0].args ?? ""
        description = event[0]
        quorum = event[1]
        result = event[2]
        success = event[3]

        // проверка, что    
        // статус голосования изменился
        expect(await proposal.pStatusEnd).equal(true);
        // описание из евента совпадает с описанием голосования
        expect(await proposal.pDescription).equal(description);
        // набрался кворум
        expect(quorum).equal(false);
        // по результату голосов победили ПРОТИВ
        expect(result).equal(false);
        // функция за которую голосовали, выполнена успешно
        expect(success).equal(false);
        // токены erc20award не были заминчины на адрес voter_3
        expect(await erc20award.balanceOf(voter_4.address)).equal(balanceBefore);


        // проверка, что теперь можно вывести средства
        balanceBefore = await erc20TOK.balanceOf(voter_1.address);
        depositBefore = (await dao.connect(voter_1).getDeposit()).allTokens;

        tx = await dao.connect(voter_1).withdrawDeposit(deposit)
        await tx.wait();

        expect(await erc20TOK.balanceOf(voter_1.address)).equal(balanceBefore.add(deposit));
        expect((await dao.connect(voter_1).getDeposit()).allTokens).equal(depositBefore.sub(deposit));

        // проверяем, что 
        // нельзя завершить голосование, котрое уже завершено
        await expect(
            dao.connect(hacker).finishProposal(1)
        ).to.be.revertedWith("Voting is now over");
        // нельзя проголосовать в завершённом голосовании
        await expect(
            dao.connect(voter_1).vote(3, false)
        ).to.be.revertedWith("Voting time is over");
    })

        // Завершаем голосования
    it("check getAllProposal() getProposalByID()", async function(){
        
        let tx = dao.getAllProposal();

        // проверка, что нельзя получить голосование по несуществующему индексу
        await expect(
            dao.getProposalByID(4)
        ).to.be.revertedWith("There is no vote with this id");
    })
});
