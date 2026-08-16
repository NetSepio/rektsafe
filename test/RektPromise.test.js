const { expect } = require("chai");
const hre = require("hardhat");

describe("RektPromise", function () {
  let rektPromise;
  let owner, sender, recipient, approver, other;

  beforeEach(async function () {
    [owner, sender, recipient, approver, other] = await hre.ethers.getSigners();
    const RektPromise = await hre.ethers.getContractFactory("RektPromise");
    rektPromise = await RektPromise.deploy();
    await rektPromise.waitForDeployment();
  });

  describe("Date promises", function () {
    it("should create a date promise", async function () {
      const unlockTime = (await hre.ethers.provider.getBlock("latest")).timestamp + 3600;
      const amount = hre.ethers.parseEther("1");

      await expect(
        rektPromise.connect(sender).createDatePromise(recipient, unlockTime, { value: amount })
      )
        .to.emit(rektPromise, "PromiseCreated")
        .withArgs(0, sender.address, recipient.address, amount, 0);

      const promise = await rektPromise.getPromise(0);
      expect(promise.sender).to.equal(sender.address);
      expect(promise.recipient).to.equal(recipient.address);
      expect(promise.amount).to.equal(amount);
      expect(promise.conditionType).to.equal(0);
      expect(promise.claimed).to.equal(false);
    });

    it("should reject a past unlock date", async function () {
      const unlockTime = (await hre.ethers.provider.getBlock("latest")).timestamp - 1;
      const amount = hre.ethers.parseEther("1");

      await expect(
        rektPromise.createDatePromise(recipient, unlockTime, { value: amount })
      ).to.be.revertedWith("Unlock time must be in the future");
    });

    it("should reject a zero amount", async function () {
      const unlockTime = (await hre.ethers.provider.getBlock("latest")).timestamp + 3600;
      await expect(
        rektPromise.createDatePromise(recipient, unlockTime, { value: 0 })
      ).to.be.revertedWith("Amount must be greater than zero");
    });

    it("should reject a zero recipient", async function () {
      const unlockTime = (await hre.ethers.provider.getBlock("latest")).timestamp + 3600;
      await expect(
        rektPromise.createDatePromise(hre.ethers.ZeroAddress, unlockTime, { value: hre.ethers.parseEther("1") })
      ).to.be.revertedWith("Recipient cannot be zero address");
    });

    it("should reject an early claim", async function () {
      const unlockTime = (await hre.ethers.provider.getBlock("latest")).timestamp + 3600;
      const amount = hre.ethers.parseEther("1");

      await rektPromise.connect(sender).createDatePromise(recipient, unlockTime, { value: amount });

      await expect(
        rektPromise.connect(recipient).claimPromise(0)
      ).to.be.revertedWith("Unlock time has not been reached");
    });

    it("should reject a claim by the wrong wallet", async function () {
      const unlockTime = (await hre.ethers.provider.getBlock("latest")).timestamp + 3600;
      const amount = hre.ethers.parseEther("1");

      await rektPromise.connect(sender).createDatePromise(recipient, unlockTime, { value: amount });

      await expect(
        rektPromise.connect(other).claimPromise(0)
      ).to.be.revertedWith("Only recipient can claim");
    });

    it("should allow a successful claim after the unlock time passes", async function () {
      const unlockTime = (await hre.ethers.provider.getBlock("latest")).timestamp + 2;
      const amount = hre.ethers.parseEther("1");

      await rektPromise.connect(sender).createDatePromise(recipient, unlockTime, { value: amount });

      await hre.network.provider.send("evm_increaseTime", [5]);
      await hre.network.provider.send("evm_mine");

      const beforeBalance = await hre.ethers.provider.getBalance(recipient);

      await expect(rektPromise.connect(recipient).claimPromise(0))
        .to.emit(rektPromise, "PromiseClaimed")
        .withArgs(0, recipient.address, amount);

      const afterBalance = await hre.ethers.provider.getBalance(recipient);
      expect(afterBalance).to.be.greaterThan(beforeBalance);

      const promise = await rektPromise.getPromise(0);
      expect(promise.claimed).to.equal(true);
    });

    it("should reject a double claim", async function () {
      const unlockTime = (await hre.ethers.provider.getBlock("latest")).timestamp + 2;
      const amount = hre.ethers.parseEther("1");

      await rektPromise.connect(sender).createDatePromise(recipient, unlockTime, { value: amount });

      await hre.network.provider.send("evm_increaseTime", [5]);
      await hre.network.provider.send("evm_mine");

      await rektPromise.connect(recipient).claimPromise(0);

      await expect(
        rektPromise.connect(recipient).claimPromise(0)
      ).to.be.revertedWith("Promise already claimed");
    });
  });

  describe("Approval promises", function () {
    it("should create an approval promise", async function () {
      const amount = hre.ethers.parseEther("1");

      await expect(
        rektPromise.connect(sender).createApprovalPromise(recipient, approver, { value: amount })
      )
        .to.emit(rektPromise, "PromiseCreated")
        .withArgs(0, sender.address, recipient.address, amount, 1);

      const promise = await rektPromise.getPromise(0);
      expect(promise.sender).to.equal(sender.address);
      expect(promise.recipient).to.equal(recipient.address);
      expect(promise.approver).to.equal(approver.address);
      expect(promise.conditionType).to.equal(1);
      expect(promise.approved).to.equal(false);
    });

    it("should reject a zero approver", async function () {
      const amount = hre.ethers.parseEther("1");
      await expect(
        rektPromise.createApprovalPromise(recipient, hre.ethers.ZeroAddress, { value: amount })
      ).to.be.revertedWith("Approver cannot be zero address");
    });

    it("should reject approval by the wrong wallet", async function () {
      const amount = hre.ethers.parseEther("1");
      await rektPromise.connect(sender).createApprovalPromise(recipient, approver, { value: amount });

      await expect(
        rektPromise.connect(other).approvePromise(0)
      ).to.be.revertedWith("Only designated approver can approve");
    });

    it("should allow the approver to approve", async function () {
      const amount = hre.ethers.parseEther("1");
      await rektPromise.connect(sender).createApprovalPromise(recipient, approver, { value: amount });

      await expect(rektPromise.connect(approver).approvePromise(0))
        .to.emit(rektPromise, "PromiseApproved")
        .withArgs(0, approver.address);

      const promise = await rektPromise.getPromise(0);
      expect(promise.approved).to.equal(true);
    });

    it("should reject a double approval", async function () {
      const amount = hre.ethers.parseEther("1");
      await rektPromise.connect(sender).createApprovalPromise(recipient, approver, { value: amount });

      await rektPromise.connect(approver).approvePromise(0);

      await expect(
        rektPromise.connect(approver).approvePromise(0)
      ).to.be.revertedWith("Promise already approved");
    });

    it("should reject a recipient claim before approval", async function () {
      const amount = hre.ethers.parseEther("1");
      await rektPromise.connect(sender).createApprovalPromise(recipient, approver, { value: amount });

      await expect(
        rektPromise.connect(recipient).claimPromise(0)
      ).to.be.revertedWith("Promise not yet approved");
    });

    it("should allow a successful recipient claim after approval", async function () {
      const amount = hre.ethers.parseEther("1");
      await rektPromise.connect(sender).createApprovalPromise(recipient, approver, { value: amount });

      await rektPromise.connect(approver).approvePromise(0);

      const beforeBalance = await hre.ethers.provider.getBalance(recipient);

      await expect(rektPromise.connect(recipient).claimPromise(0))
        .to.emit(rektPromise, "PromiseClaimed")
        .withArgs(0, recipient.address, amount);

      const afterBalance = await hre.ethers.provider.getBalance(recipient);
      expect(afterBalance).to.be.greaterThan(beforeBalance);

      const promise = await rektPromise.getPromise(0);
      expect(promise.claimed).to.equal(true);
    });

    it("should reject a double claim", async function () {
      const amount = hre.ethers.parseEther("1");
      await rektPromise.connect(sender).createApprovalPromise(recipient, approver, { value: amount });

      await rektPromise.connect(approver).approvePromise(0);
      await rektPromise.connect(recipient).claimPromise(0);

      await expect(
        rektPromise.connect(recipient).claimPromise(0)
      ).to.be.revertedWith("Promise already claimed");
    });
  });
});
