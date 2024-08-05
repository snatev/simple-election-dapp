let web3;
let admin;
let election;

window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);

        try { await window.ethereum.request({ method: 'eth_requestAccounts' }); }
        catch (error) {
            showAlert(error.message, "warning");
            return;
        }
    } else if (window.web3) web3 = new Web3(window.web3.currentProvider);
    else {
        showAlert("No Web3 Provider Found", "warning");
        return;
    }

    if (web3) {
        const electionAbi = [
            {
                "inputs": [],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "inputs": [],
                "name": "admin",
                "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
                ],
                "name": "candidates",
                "outputs": [
                {
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "voteCount",
                    "type": "uint256"
                }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [],
                "name": "candidatesCount",
                "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
                ],
                "name": "voters",
                "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [
                {
                    "internalType": "string",
                    "name": "_name",
                    "type": "string"
                }
                ],
                "name": "addCandidate",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_candidateId",
                    "type": "uint256"
                }
                ],
                "name": "removeCandidate",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_candidateId",
                    "type": "uint256"
                }
                ],
                "name": "vote",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getCandidates",
                "outputs": [
                {
                    "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "voteCount",
                        "type": "uint256"
                    }
                    ],
                    "internalType": "struct Election.Candidate[]",
                    "name": "",
                    "type": "tuple[]"
                }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            }
        ];

        const electionAddress = '0x36A275460dF7375751A7e8AdfE5b2D617BAD55FC';
        election = new web3.eth.Contract(electionAbi, electionAddress);

        const accounts = await web3.eth.getAccounts();
        admin = accounts[0];

        loadCandidates();
        checkAdmin();
    }
});

async function checkAdmin() {
    const accounts = await web3.eth.getAccounts();
    if (accounts[0] === admin) document.getElementById('adminPanel').classList.remove('d-none');
}

async function loadCandidates() {
    try {
        const candidates = await election.methods.getCandidates().call();
        const candidatesDiv = document.getElementById('candidates');
        candidatesDiv.innerHTML = '';

        const accounts = await web3.eth.getAccounts();
        const voter = accounts[0];
        const hasVoted = await election.methods.voters(voter).call();

        candidates.forEach(candidate => {
            if (candidate.name) {
                const candidateElement = document.createElement('div');

                candidateElement.className = 'list-group-item d-flex justify-content-between align-items-center';
                candidateElement.innerHTML = `
                    <span>
                        <span class="text-primary">${candidate.name}</span> - ${candidate.voteCount} votes
                    </span>
                    <div>
                        ${!hasVoted ? `<button onclick="vote(${candidate.id})" class="btn btn-primary btn-sm">Vote</button>` : ''}
                        ${voter === admin ? `<button onclick="removeCandidate(${candidate.id})" class="btn btn-danger btn-sm ms-2">X</button>` : ''}
                    </div>
                `;

                candidatesDiv.appendChild(candidateElement);
            }
        });
    } catch (error) { showAlert(error.message, "danger"); }
}

async function addCandidate() {
    try {
        const candidateName = document.getElementById('candidateName').value.trim();
        if (!candidateName) {
            showAlert("Name Cannot Be Empty", "warning");
            return;
        }

        const candidates = await election.methods.getCandidates().call();
        if (candidates.some(candidate => candidate.name === candidateName)) {
            showAlert("Candidate Already Exists", "warning");
            return;
        }

        const accounts = await web3.eth.getAccounts();
        await election.methods.addCandidate(candidateName).send({ from: accounts[0] });
        loadCandidates();
    } catch (error) { showAlert(error.message, "danger"); }
}

async function removeCandidate(candidateId) {
    try {
        const accounts = await web3.eth.getAccounts();
        await election.methods.removeCandidate(candidateId).send({ from: accounts[0] });
        loadCandidates();
    } catch (error) { showAlert(error.message, "danger"); }
}

async function vote(candidateId) {
    try {
        const accounts = await web3.eth.getAccounts();
        await election.methods.vote(candidateId).send({ from: accounts[0] });
        loadCandidates();
    } catch (error) { showAlert(error.message, "danger"); }
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.innerText = message;

    alertContainer.appendChild(alertElement);
    setTimeout(() => { alertElement.remove(); }, 3000);
}
