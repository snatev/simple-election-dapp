pragma solidity ^0.7.3;
pragma experimental ABIEncoderV2;

contract Election {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(address => bool) public voters;
    mapping(uint => Candidate) public candidates;

    address public admin;
    uint public candidatesCount;

    constructor() {
        admin = msg.sender;
    }

    function addCandidate(string memory _name) public {
        require(msg.sender == admin, "Only Admin Can Add");

        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function removeCandidate(uint _candidateId) public {
        require(msg.sender == admin, "Only Admin Can Remove");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid Candidate");

        delete candidates[_candidateId];
    }

    function vote(uint _candidateId) public {
        require(!voters[msg.sender], "Already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid Candidate");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
    }

    function getCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory candidatesArray = new Candidate[](candidatesCount);

        for (uint i = 1; i <= candidatesCount; i++) {
            if (bytes(candidates[i].name).length != 0) {
                candidatesArray[i - 1] = candidates[i];
            }
        }
        return candidatesArray;
    }
}
