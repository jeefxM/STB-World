const PERMIT2_ABI = [
  [
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "token",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "amount",
        "type": "uint160",
        "internalType": "uint160"
      },
      {
        "name": "expiration",
        "type": "uint48",
        "internalType": "uint48"
      },
      {
        "name": "nonce",
        "type": "uint48",
        "internalType": "uint48"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "permitTransferFrom",
    "inputs": [
      {
        "name": "permit",
        "type": "tuple",
        "internalType": "struct IPermit2.PermitTransferFrom",
        "components": [
          {
            "name": "permitted",
            "type": "tuple",
            "internalType": "struct IPermit2.TokenPermissions",
            "components": [
              {
                "name": "token",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
              }
            ]
          },
          {
            "name": "nonce",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "deadline",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "transferDetails",
        "type": "tuple",
        "internalType": "struct IPermit2.SignatureTransferDetails",
        "components": [
          {
            "name": "to",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "requestedAmount",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "signature",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
]

] as const 

export default PERMIT2_ABI
