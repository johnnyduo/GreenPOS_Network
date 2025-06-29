Smart Contract Interaction
List Deployed Smart Contracts

**Note: This API only return smart contract(s) deployed through your organisation API key

GET

API_URL/api/contract/smart-contracts

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

Params
Name	Required	Description
filter-version	No	Filter smart contract by version slug
filter-deployment_id	No	Filter smart contract by deployment id
The returned values will be in the format of

Sample Result
{
    "result": [
        {
            "contract_address": "0x8dAaE2E5bf2AC0833B2287864A15Fa860B98EbDd",
            "deployment_params": [],
            "contract_name": "ContractA",
            "project_name": "Test Project",
            "version": "v1.0.0",
            "deployed_at": "2024-12-05T07:12:42.000000Z"
        },
        ...
    ],
    "pagination": {
        "current_page": 1,
        "first_page_url": "http://localhost/api/contract/smart-contracts?page=1",
        "last_page": 1,
        "last_page_url": "http://localhost/api/contract/smart-contracts?page=1",
        "next_page_url": null,
        "per_page": 10,
        "prev_page_url": null,
        "total": 4
    },
    "message": "Success"
}


Get Contract Details By Address
Get Contract Details By Address

GET

API_URL/api/contract/smart-contracts/{address}

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

The returned values will be in the format of

Sample Result
{
    "message": "Success",
    "result": {
        "contract_address": "0x8dAaE2E5bf2AC0833B2287864A15Fa860B98EbDd",
        "deployment_params": [],
        "artifact": {
            "id": 18,
            "contract_name": "ContractA",
            "contract_abi": [
                {
                    "name": "CountIncreased",
                    "type": "event",
                    "inputs": [
                        {
                            "name": "_count",
                            "type": "uint256",
                            "indexed": false,
                            "internalType": "uint256"
                        }
                    ],
                    "anonymous": false
                },
                {
                    "name": "count",
                    "type": "function",
                    "inputs": [],
                    "outputs": [
                        {
                            "name": "",
                            "type": "uint256",
                            "internalType": "uint256"
                        }
                    ],
                    "stateMutability": "view"
                },
                {
                    "name": "increment",
                    "type": "function",
                    "inputs": [],
                    "outputs": [],
                    "stateMutability": "nonpayable"
                }
            ],
            "bytecode": "0x60806040526000...",
            "source_code": "fileUrl",
            "created_at": "2024-12-05T06:55:50.000000Z",
            "updated_at": "2024-12-05T06:55:50.000000Z"
        },
        "deployed_at": "2024-12-05T07:12:42.000000Z",
        "deployment_id": "test-project_1-v100_1733382752",
        "deploy_gas_used": 144321,
        "total_gas_used": 310275
    }
}


Smart Contract Call (Read)
Smart Contract Call (Read)

POST

API_URL/api/contract/smart-contracts/{address}/call

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

Params
Name	Required	Description
from	Yes	The address to call the smart contract from
method_name	Yes	The method name to call
contract_abi	No	By default, the contract abi of the contract's compiled artifact will be used. In case of interaction with a proxy's implementation contract, you will be required to provide this information for successful interaction.
params	Required if method requires parameter	Key-value array list of parameters required for the method call
Sample Request Body
{
    "from": "0xC7F59f4F9E...Cabb9F9Cf5c48ac6",
    "method_name": "methodName",
    "contract_abi": [...], // Optional - see description
    "params": {
        "fieldA": "...",
        ...
    }
}

The returned values will be in the format of

Sample Result
{
    "message": "Success",
    "result": {
        "_count": "0",
        "_count2": "0"
    }
}


Smart Contract Execute (Write)
Smart Contract Execute (Write)

POST

API_URL/api/contract/smart-contracts/{address}/execute

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

Example using custodial wallet
Params
Name	Required	Description
wallet_options.type	Yes	Wallet type to be used for contract execution. Accepted values: organisation, end_user
wallet_options.address	Yes	Wallet address to be used for contract execution
method_name	Yes	The method name of the function to execute
contract_abi	No	By default, the contract abi of the contract's compiled artifact will be used. In case of interaction with a proxy's implementation contract, you will be required to provide this information for successful interaction. Not required if executed through signed transaction.
params	Required if method requires parameter	Key-value array list of parameters required for the method execution
callback_url	No	Callback URL to receive transaction receipt when it is available
Sample Request Body (Custodial Wallet)
{
    "wallet_options": {
        "type": "organisation",
        "address": "0xC7F59f4F9E9e490023576E33Cabb9F9Cf5c48ac6"
    },
    "method_name": "increment",
    "contract_abi": [...], // Optional - see description
    "params": {
        "fieldA": "...",
        ...
    }
}

The returned values will be in the format of

Sample Result (Custodial Wallet)
{
    "message": "Success",
    "result": {
        "transaction_hash": "0x26d6fa69315459f1bc2bce83047c9ef047a3d10aa937282a8fcd454a55662c57"
    }
}

Example using non-custodial wallet
Params
Name	Required	Description
wallet_options.type	Yes	Wallet type to be used to for contract execution. Accepted values: non_custodial
wallet_options.address	Yes	Wallet address to be used for contract execution
method_name	Yes	The method name of the function to execute
signed_trx	Yes	The self-signed transaction for the contract execution
callback_url	No	Callback URL to receive transaction receipt when it is available
Sample Request Body (Non-custodial Wallet)
{
    "wallet_options": {
        "type": "non_custodial",
        "address": "0x6BCEB78D049FFE517b060fbD6DC1eA11b8e3f4f7"
    },
    "method_name": "increment",
    "signed_trx": "0xf866048083..."
}

The returned values will be in the format of

Sample Result (Non-custodial Wallet)
{
    "message": "Success",
    "result": {
        "transaction_hash": "0x26d6fa69315459f1bc2bce83047c9ef047a3d10aa937282a8fcd454a55662c57"
    }
}

Callback Response Format
The returned result for a callback response will be in the below format:

**Note: The callback will only trigger once the transaction receipt is available, or if an error occured during contract execution.

Sample Callback Response
{
  "status": "Success", // Returns Error if any error occured
  "transactionHash": "0x26d6fa69315459f1bc2bce83047c9ef047a3d10aa937282a8fcd454a55662c57",
  "receipt": {
    "transactionHash": "0x26d6fa69315459f1bc2bce83047c9ef047a3d10aa937282a8fcd454a55662c57",
    "transactionIndex": 0,
    "blockHash": "0xaa473178b5120e42a31de6a882344903ffaeb54ccb01a63a897654c43d2f7fba",
    "from": "0xc7f59f4f9e9e490023576e33cabb9f9cf5c48ac6",
    "to": "0x22e726f2d2049bd6b7af65115590c157450f738c",
    "blockNumber": 5998304,
    "gasUsed": 27659,
    "contractAddress": null,
    "logs": [
      {
        "address": "0x22E726F2d2049BD6b7af65115590C157450F738c",
        "topics": [
          "0x7ca2ca9527391044455246730762df008a6b47bbdb5d37a890ef78394535c040"
        ],
        "data": "0x0000000000000000000000000000000000000000000000000000000000000019",
        "blockHash": "0xaa473178b5120e42a31de6a882344903ffaeb54ccb01a63a897654c43d2f7fba",
        "blockNumber": 5998304,
        "transactionHash": "0x26d6fa69315459f1bc2bce83047c9ef047a3d10aa937282a8fcd454a55662c57",
        "transactionIndex": 0,
        "logIndex": 0,
        "transactionLogIndex": "0x0",
        "removed": false,
        "id": "log_c554cb45"
      }
    ],
    "logsBloom": "0x00000000000000...",
    "status": true,
    "type": "0x0"
  }
}


Smart Contract Token Transfers
List Smart Contract Token Transfer History

GET

API_URL/api/contract/smart-contracts/{address}/token-transfers

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

The returned values will be in the format of

Sample Result
{
    "message": "Success",
    "result": [
        {
            "block_hash": "0x8fd74fd2765e15e551ddd5102b27762e6af805ffad9cd14180df9b6cdceecaaa",
            "block_number": 6488863,
            "from": {
                "ens_domain_name": null,
                "hash": "0xc7DD0E0275FCB2b3578f04CEd86F44D1CaF618a6",
                "implementations": [],
                "is_contract": false,
                "is_scam": false,
                "is_verified": false,
                "metadata": null,
                "name": null,
                "private_tags": [],
                "proxy_type": null,
                "public_tags": [],
                "watchlist_names": []
            },
            "log_index": 0,
            "method": "transfer",
            "timestamp": "2025-04-09T09:52:30.000000Z",
            "to": {
                "ens_domain_name": null,
                "hash": "0x4891F984221cF124F6b041B533F07Fb298c1b75e",
                "implementations": [],
                "is_contract": true,
                "is_scam": false,
                "is_verified": true,
                "metadata": null,
                "name": "CoKeepsMultisigFinal",
                "private_tags": [],
                "proxy_type": null,
                "public_tags": [],
                "watchlist_names": []
            },
            "token": {
                "address": "0xA6D2D34530874B92ABC81500E5029050bD1a918a",
                "circulating_market_cap": null,
                "decimals": "18",
                "exchange_rate": null,
                "holders": "6",
                "icon_url": null,
                "name": "TestToken",
                "symbol": "TTK",
                "total_supply": "1000000000000000000000000",
                "type": "ERC-20",
                "volume_24h": null
            },
            "total": {
                "decimals": "18",
                "value": "100"
            },
            "transaction_hash": "0xe5dace25f6be4821f2121445df15eaf2721f942c9371f0ac367b321529b42dae",
            "type": "token_transfer"
        },
        ...
    ],
    "pagination": {
        "next_page_url": null
    }
}

Transactions & Accounts Endpoint
Get Account Nonce
Get Account nonce by address

GET

API_URL/api/contract/accounts/{address}/nonce

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

The returned values will be in the format of

Sample Result
{
    "message": "Success",
    "result": 15
}


Get Account Token Transfers
Get Account Token Transfer by Contract Address

GET

API_URL/api/contract/accounts/{address}/token-transfers/{contract_address}

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

Params
Name	Required	Description
filter	No	"to", "from", "to|from"
The returned values will be in the format of

Sample Result
{
    "message": "Success",
    "result": [
        {
            "block_hash": "0x8fd74fd2765e15e551ddd5102b27762e6af805ffad9cd14180df9b6cdceecaaa",
            "block_number": 6488863,
            "from": {
                "ens_domain_name": null,
                "hash": "0xc7DD0E0275FCB2b3578f04CEd86F44D1CaF618a6",
                "implementations": [],
                "is_contract": false,
                "is_scam": false,
                "is_verified": false,
                "metadata": null,
                "name": null,
                "private_tags": [],
                "proxy_type": null,
                "public_tags": [],
                "watchlist_names": []
            },
            "log_index": 0,
            "method": "transfer",
            "timestamp": "2025-04-09T09:52:30.000000Z",
            "to": {
                "ens_domain_name": null,
                "hash": "0x4891F984221cF124F6b041B533F07Fb298c1b75e",
                "implementations": [],
                "is_contract": true,
                "is_scam": false,
                "is_verified": true,
                "metadata": null,
                "name": "CoKeepsMultisigFinal",
                "private_tags": [],
                "proxy_type": null,
                "public_tags": [],
                "watchlist_names": []
            },
            "token": {
                "address": "0xA6D2D34530874B92ABC81500E5029050bD1a918a",
                "circulating_market_cap": null,
                "decimals": "18",
                "exchange_rate": null,
                "holders": "6",
                "icon_url": null,
                "name": "TestToken",
                "symbol": "TTK",
                "total_supply": "1000000000000000000000000",
                "type": "ERC-20",
                "volume_24h": null
            },
            "total": {
                "decimals": "18",
                "value": "100"
            },
            "transaction_hash": "0xe5dace25f6be4821f2121445df15eaf2721f942c9371f0ac367b321529b42dae",
            "type": "token_transfer"
        },
        ...
    ],
    "pagination": {
        "next_page_url": null
    }
}


Get Transaction
Get Transaction Details by Hash

GET

API_URL/api/contract/transactions/{hash}

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

The returned values will be in the format of

Sample Result
{
    "message": "Success",
    "result": {
        "hash": "0x2ae066ac32a5df95a92449739dead9aae99c1d3ecbd370c2ff66d000703cb0cc",
        "nonce": 80,
        "blockHash": "0xb73f52b07c2c70d4c539323f2a6b1ec4c7e5840391c1146f3c29fcf41823ba2f",
        "blockNumber": 5996828,
        "transactionIndex": 0,
        "from": "0xC7F59f4F9E9e490023576E33Cabb9F9Cf5c48ac6",
        "to": "0x22E726F2d2049BD6b7af65115590C157450F738c",
        "value": "0",
        "gasPrice": "0",
        "gas": 6000000,
        "input": "0xd09de08a",
        "creates": null,
        "raw": "0xf8665080835b8d809422e...",
        "publicKey": "0x37eef5a82a94f6ee0872547...fc9e779471ef586fd8fe40",
        "chainId": "0x89f",
        "standardV": "0x1",
        "v": "0x1162",
        "r": "0x15aa0d4696696e39f39...a66132d76a2dbe6a9e20e34ca2f4b4408",
        "s": "0x844dce7dd3035761a9c...c9afa2e5e7b3b74a97aee8b807b30539",
        "accessList": null,
        "type": 0
    }
}


Get Transaction Receipt
Get Transaction Receipt by Hash

GET

API_URL/api/contract/transactions/{hash}/receipt

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

The returned values will be in the format of

Sample Result
{
    "message": "Success",
    "result": {
        "transactionHash": "0x2ae066ac32a5df95a92449739dead9aae99c1d3ecbd370c2ff66d000703cb0cc",
        "transactionIndex": 0,
        "blockHash": "0xb73f52b07c2c70d4c539323f2a6b1ec4c7e5840391c1146f3c29fcf41823ba2f",
        "from": "0xc7f59f4f9e9e490023576e33cabb9f9cf5c48ac6",
        "to": "0x22e726f2d2049bd6b7af65115590c157450f738c",
        "blockNumber": 5996828,
        "cumulativeGasUsed": 27659,
        "gasUsed": 27659,
        "contractAddress": null,
        "logs": [
            {
                "address": "0x22E726F2d2049BD6b7af65115590C157450F738c",
                "topics": [
                    "0x7ca2ca9527391044455246730762df008a6b47bbdb5d37a890ef78394535c040"
                ],
                "data": "0x0000000000000000000000000000000000000000000000000000000000000018",
                "blockHash": "0xb73f52b07c2c70d4c539323f2a6b1ec4c7e5840391c1146f3c29fcf41823ba2f",
                "blockNumber": 5996828,
                "transactionHash": "0x2ae066ac32a5df95a92449739dead9aae99c1d3ecbd370c2ff66d000703cb0cc",
                "transactionIndex": 0,
                "logIndex": 0,
                "transactionLogIndex": "0x0",
                "removed": false,
                "id": "log_5d63faca"
            }
        ],
        "logsBloom": "0x00000000000000000...",
        "status": true,
        "effectiveGasPrice": 0,
        "type": "0x0"
    }
}


Wallet API
Get Wallet list
Retrieves all wallet records for an organization from the database.

GET

API_URL/api/wallet/wallet?type=1

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

content-type   application/json

Params
type 1 : organisation
type 2 : end_user


Sample result
{
    "status": 200,
    "result": [
        {
            "id": 1,
            "wallet_type": 'organisation',
            "address": "0x147f2......",
            "name": null,
        }
    ]
}


Get Wallet by address
Retrieves a specific wallet record by its ID from the database.

GET

API_URL/api/wallet/wallet/{address}

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

content-type   application/json

Sample result
{
    "status": 200,
    "result": {
        "id" : 1,
        "entity_id": 1,
        "address": "0x147f20........",
        "name": null,
        "is_active" : 1,
        'wallet_type' : 'end_user',
    }
}


Create Organisation Wallet
Creates an wallet by organisation id and storing it in MasChain.

POST

API_URL/api/wallet/wallet

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

content-type   application/json

BODY
Name	Type	Required
name	string	yes
wallet_category_id	array	No
entity_id	int	No
entity_category_id	int	No
Sample request
{
    "name":"test",
}

Sample result
{
    "status": 200,
    "result": {
        "id": 1,
        "address": "0xF821eaD377B6689D25.....",
        "name": "test",
        "wallet_type": "organisation",
        "is_active": 1,
        "entity_id": null,
        "entity_category_id": null,
    }
}


Create User Wallet
Creates a User and storing it in MasChain.

POST

API_URL/api/wallet/create-user

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

content-type   application/json

BODY
Name	Type	Required
name	string	Yes
email	string	Yes
ic	string	Yes
wallet_name	string	No
phone	string	No
entity_id	int	No
entity_category_id	int	No
Sample request
{
    "name":"test name2",
    "email":"testemail9@gmail.com",
    "ic":"test ic",
    "phone":"test ic",
    "entity_id":1,
}

Sample result
{
    "status": 200,
    "result": {
        "user": {
            "name": "Bob",
            "email": "test@gmail.com",
            "ic": "123131231",
            "phone": null
        },
        "wallet": {
            "wallet_id": 1,
            "wallet_name": "bob wallet",
            "wallet_address": "0x556283a26F5C3d7bcB9a...",
            "wallet_type": "user",
            "is_active": 1,
            "entity_id": null,
            "entity_category_id": null,
        }
    }
}


Update Wallet by address
Update wallet by address and store to db.

PUT

API_URL/api/wallet/wallet/{address}

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

content-type   application/json

BODY
Name	Type	Required
entity_id	int	no
name	string	no
Sample request
{
    "entity_id" : 1,
    "name":"update name",
}

Sample result
{
    "status": 200,
    "result": {
        "id" : 1
        "entity_id" : 1,
        "is_active": 1,
        "name":"update name",
        'wallet_type' : 'end_user',
        "address": "0x147f20........",
    }
}


Activate Wallet by address
Activate wallet by address.

PUT

API_URL/api/wallet/wallet/{address}/activate

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

content-type   application/json

Sample result
{
    "status": 200,
    "result": {
        "id" : 1
        "entity_id" : 1,
        "is_active": 1,
        "name":"name",
        'wallet_type' : 'end_user',
        "address": "0x147f20........",
    }
}


Deactivate Wallet by address
Deactivate wallet by address.

PUT

API_URL/api/wallet/wallet/{address}/deactivate

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

content-type   application/json

Sample result
{
    "status": 200,
    "result": {
        "id" : 1
        "entity_id" : 1,
        "is_active": 1,
        "name":"name",
        'wallet_type' : 'end_user',
        "address": "0x147f20........",
    }
}


Get Wallet Transaction Count
Retrieves the number of transaction initiated by a wallet address including pending transactions

GET

API_URL/api/wallet/wallet/{address}/transactions-count?block=pending

HEADERS
client_id   9b16ae5638534ae1961fb370f874b6cc*

client_secret   sk_9b16ae5638534ae1961fb370f874b6cc*

content-type   application/json

Params
Use this endpoint to get the nonce for next transaction to execute. When use it as nonce, please query with block = "pending"
Default block values : "pending"
Supported block values: "earliest", "latest", "pending", "safe", "finalized"


Sample result
{
    "status": 200,
    "result": {
        "wallet_address" : "0x147f20.....",
        "block_type" : "pending" 
        "transaction_count" : 1
    }
}

