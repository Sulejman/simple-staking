pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingContract is Ownable, ReentrancyGuard {
    using Address for address;
    using SafeMath for uint256;

    // staking token
    IERC20 public token;

    // staking period in seconds
    uint stakingPeriod = 86400;

    // staking reward points per 1 token during stakingPeriod
    uint256 stakingReward = 1;

    // staking points mapping
    mapping(address => StakingRecord) public stakingRecords;

    struct StakingRecord {
        uint256 lastBlockTime;
        uint256 lastPoints;
        uint256 lastValue;
    }

    event Staked (
        address indexed _from,
        uint256 _blockTimestamp,
        uint256 _value,
        StakingRecord record
    );

    event Released (
        address indexed _from,
        uint256 _blockTimestamp,
        uint256 _value,
        StakingRecord record
    );

    constructor (
        address _tokenAddress,
        uint256 _stakingPeriod
    ) {
        require(_tokenAddress.isContract(), "not a contract address");
        require(_stakingPeriod > 0);
        token = IERC20(_tokenAddress);
        stakingPeriod = _stakingPeriod;
    }

    function stake(uint256 amount) public payable {
        require(token.transferFrom(msg.sender, address(this), amount));
        _stake(amount);
        emit Staked(msg.sender, block.timestamp, amount, stakingRecords[msg.sender]);
    }

    function release(uint256 amount) public {
        _releaseStake(amount);
        emit Released(msg.sender, block.timestamp, amount, stakingRecords[msg.sender]);
    }

    function viewStakingPoints(address stakeholder) public view returns (uint256 points) {
        points = _calculateStakingPoints(stakeholder);
        return points;
    }

    function viewStakedAmount(address stakeholder) public view returns (uint256 stakedAmount) {
        stakedAmount= stakingRecords[stakeholder].lastValue;
        return stakedAmount;
    }

    function _calculateStakingPoints(address stakeholder) private view returns (uint256 _newPoints) {
        _newPoints = stakingRecords[stakeholder].lastPoints +
                    ((block.timestamp - stakingRecords[stakeholder].lastBlockTime) / stakingPeriod) *
                    stakingRecords[stakeholder].lastValue;
        return _newPoints;
    }

    function _stake(uint256 amount) private nonReentrant {
        stakingRecords[msg.sender] = StakingRecord({
            lastBlockTime : block.timestamp,
            lastPoints : _calculateStakingPoints(msg.sender),
            lastValue : stakingRecords[msg.sender].lastValue + amount
        });
    }

    function _releaseStake(uint256 amount) private nonReentrant {
        stakingRecords[msg.sender] = StakingRecord({
            lastBlockTime : block.timestamp,
            lastPoints : _calculateStakingPoints(msg.sender),
            lastValue : stakingRecords[msg.sender].lastValue - amount
        });
        token.transfer(msg.sender, amount);
    }
}
