// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IERC721 {
    function safeTransferFrom(address from, address to, uint tokenId) external;

    function transferFrom(address, address, uint) external;
}

contract Auction {
    event Start();
    event Bid(address indexed sender, uint amount);
    event Withdraw(address indexed bidder, uint amount);
    event End(address winner, uint amount);

    IERC721 public nft;
    uint public nftId;

    address payable public seller;
    uint public endAt;
    bool public started;
    bool public ended;
    uint public auctionDuration;

    address public highestBidder;
    uint public highestBid;
    mapping(address => uint) public bids;

    bool public isEnglishAuction;

    constructor(address _nft, uint _nftId, uint _startingBid, uint _auctionDuration, bool _isEnglishAuction) {
        nft = IERC721(_nft);
        nftId = _nftId;

        seller = payable(msg.sender);
        highestBid = _startingBid;
        auctionDuration = _auctionDuration; 
        isEnglishAuction = _isEnglishAuction;
    }

   function start() external {
        require(!started, "started");
        require(msg.sender == seller, "not seller");

        nft.transferFrom(msg.sender, address(this), nftId);
        started = true;
        endAt = block.timestamp + auctionDuration;

        emit Start();
    }

    function bid() external payable {
        require(started, "not started");
        require(block.timestamp < endAt, "ended");

        uint currentPrice;
        if (isEnglishAuction) {
            currentPrice = highestBid;
        } else {
            currentPrice = getCurrentPrice();
        }

        require(msg.value > currentPrice, "value <= current price");

        if (highestBidder != address(0)) {
            bids[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;

        emit Bid(msg.sender, msg.value);
    }

    function withdraw() external {
        uint bal = bids[msg.sender];
        bids[msg.sender] = 0;
        payable(msg.sender).transfer(bal);

        emit Withdraw(msg.sender, bal);
    }

    function end() external {
        require(started, "not started");
        require(block.timestamp >= endAt, "not ended");
        require(!ended, "ended");

        ended = true;
        if (highestBidder != address(0)) {
            nft.safeTransferFrom(address(this), highestBidder, nftId);
            seller.transfer(highestBid);
        } else {
            nft.safeTransferFrom(address(this), seller, nftId);
        }

        emit End(highestBidder, highestBid);
    }

    function getCurrentPrice() public view returns (uint) {
        uint elapsedTime = block.timestamp - (started ? block.timestamp : endAt - auctionDuration);
        if (elapsedTime >= auctionDuration) {
            return 0;
        }
        return highestBid - highestBid * elapsedTime / auctionDuration;
    }
}

contract AuctionFactory {
    event AuctionCreated(address indexed auctionAddress, address indexed creator, address indexed nft, uint nftId, uint startingBid, bool isEnglishAuction);

    address[] public auctions;

    function createAuction(address _nft, uint _nftId, uint _startingBid, uint _auctionDuration, bool _isEnglishAuction) external {
        Auction newAuction = new Auction(_nft, _nftId, _startingBid, _auctionDuration, _isEnglishAuction);
        auctions.push(address(newAuction));
        emit AuctionCreated(address(newAuction), msg.sender, _nft, _nftId, _startingBid, _isEnglishAuction);
    }

    function getAuctions() external view returns (address[] memory) {
        return auctions;
    }
}
