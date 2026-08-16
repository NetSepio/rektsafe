// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RektPromise {
    enum ConditionType {
        DATE,
        APPROVAL
    }

    struct Promise {
        address sender;
        address recipient;
        address approver;
        uint256 amount;
        uint256 unlockTime;
        ConditionType conditionType;
        bool approved;
        bool claimed;
    }

    Promise[] public promises;

    uint256 public promiseCount;

    event PromiseCreated(
        uint256 indexed promiseId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        ConditionType conditionType
    );

    event PromiseApproved(
        uint256 indexed promiseId,
        address indexed approver
    );

    event PromiseClaimed(
        uint256 indexed promiseId,
        address indexed recipient,
        uint256 amount
    );

    modifier validPromise(uint256 promiseId) {
        require(promiseId < promiseCount, "Invalid promise ID");
        _;
    }

    function createDatePromise(
        address recipient,
        uint256 unlockTime
    ) external payable {
        require(recipient != address(0), "Recipient cannot be zero address");
        require(msg.value > 0, "Amount must be greater than zero");
        require(unlockTime > block.timestamp, "Unlock time must be in the future");

        uint256 promiseId = promiseCount++;

        promises.push(
            Promise({
                sender: msg.sender,
                recipient: recipient,
                approver: address(0),
                amount: msg.value,
                unlockTime: unlockTime,
                conditionType: ConditionType.DATE,
                approved: false,
                claimed: false
            })
        );

        emit PromiseCreated(
            promiseId,
            msg.sender,
            recipient,
            msg.value,
            ConditionType.DATE
        );
    }

    function createApprovalPromise(
        address recipient,
        address approver
    ) external payable {
        require(recipient != address(0), "Recipient cannot be zero address");
        require(approver != address(0), "Approver cannot be zero address");
        require(msg.value > 0, "Amount must be greater than zero");

        uint256 promiseId = promiseCount++;

        promises.push(
            Promise({
                sender: msg.sender,
                recipient: recipient,
                approver: approver,
                amount: msg.value,
                unlockTime: 0,
                conditionType: ConditionType.APPROVAL,
                approved: false,
                claimed: false
            })
        );

        emit PromiseCreated(
            promiseId,
            msg.sender,
            recipient,
            msg.value,
            ConditionType.APPROVAL
        );
    }

    function approvePromise(
        uint256 promiseId
    ) external validPromise(promiseId) {
        Promise storage p = promises[promiseId];

        require(
            p.conditionType == ConditionType.APPROVAL,
            "Only approval promises can be approved"
        );
        require(!p.approved, "Promise already approved");
        require(!p.claimed, "Promise already claimed");
        require(
            msg.sender == p.approver,
            "Only designated approver can approve"
        );

        p.approved = true;

        emit PromiseApproved(promiseId, msg.sender);
    }

    function claimPromise(uint256 promiseId) external validPromise(promiseId) {
        Promise storage p = promises[promiseId];

        require(msg.sender == p.recipient, "Only recipient can claim");
        require(!p.claimed, "Promise already claimed");

        if (p.conditionType == ConditionType.DATE) {
            require(
                block.timestamp >= p.unlockTime,
                "Unlock time has not been reached"
            );
        } else if (p.conditionType == ConditionType.APPROVAL) {
            require(p.approved, "Promise not yet approved");
        }

        uint256 amount = p.amount;
        p.claimed = true;

        (bool success, ) = payable(p.recipient).call{value: amount}("");
        require(success, "Transfer failed");

        emit PromiseClaimed(promiseId, p.recipient, amount);
    }

    function getPromise(
        uint256 promiseId
    ) external view validPromise(promiseId) returns (Promise memory) {
        return promises[promiseId];
    }

    function getPromiseCount() external view returns (uint256) {
        return promiseCount;
    }
}
