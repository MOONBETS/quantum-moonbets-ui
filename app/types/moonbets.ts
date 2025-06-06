/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/moonbets.json`.
 */
export type Moonbets = {
  "address": "CyANVDG4GNTj9YiRxg22sLoXeczP2Mymd2mHL8NrXXRB",
  "metadata": {
    "name": "moonbets",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addAdmin",
      "discriminator": [
        177,
        236,
        33,
        205,
        124,
        152,
        55,
        186
      ],
      "accounts": [
        {
          "name": "primaryAdmin",
          "writable": true,
          "signer": true
        },
        {
          "name": "platformStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "newAdmin"
              }
            ]
          }
        },
        {
          "name": "newAdmin"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "adminDeposit",
      "discriminator": [
        210,
        66,
        65,
        182,
        102,
        214,
        176,
        30
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "platformVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "platformStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "adminAccount",
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "adminWithdraw",
      "discriminator": [
        160,
        166,
        147,
        222,
        46,
        220,
        75,
        224
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "platformVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "platformStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "adminAccount",
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializePlatform",
      "discriminator": [
        119,
        201,
        101,
        45,
        75,
        122,
        89,
        3
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "platformStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "platformVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "adminAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializePlayer",
      "discriminator": [
        79,
        249,
        88,
        177,
        220,
        62,
        56,
        128
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "platformStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "play",
      "discriminator": [
        213,
        157,
        193,
        142,
        228,
        56,
        248,
        150
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "platformVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "platformStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "quantumNoise",
          "type": "u8"
        },
        {
          "name": "betAmount",
          "type": "u64"
        },
        {
          "name": "quantumIstResult",
          "type": "u8"
        }
      ]
    },
    {
      "name": "removeAdmin",
      "discriminator": [
        74,
        202,
        71,
        106,
        252,
        31,
        72,
        183
      ],
      "accounts": [
        {
          "name": "primaryAdmin",
          "writable": true,
          "signer": true
        },
        {
          "name": "platformStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "updatePlatformLimit",
      "discriminator": [
        105,
        216,
        249,
        68,
        246,
        250,
        214,
        173
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "platformStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "adminAccount",
          "optional": true
        }
      ],
      "args": [
        {
          "name": "field",
          "type": "string"
        },
        {
          "name": "value",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "platformVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "platformStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "admin",
      "discriminator": [
        244,
        158,
        220,
        65,
        8,
        73,
        4,
        65
      ]
    },
    {
      "name": "platformStats",
      "discriminator": [
        230,
        145,
        51,
        113,
        44,
        85,
        153,
        126
      ]
    },
    {
      "name": "player",
      "discriminator": [
        205,
        222,
        112,
        7,
        165,
        155,
        206,
        218
      ]
    }
  ],
  "events": [
    {
      "name": "adminAdded",
      "discriminator": [
        23,
        13,
        37,
        90,
        130,
        53,
        75,
        251
      ]
    },
    {
      "name": "adminDeposited",
      "discriminator": [
        179,
        88,
        176,
        235,
        167,
        5,
        42,
        9
      ]
    },
    {
      "name": "adminRemoved",
      "discriminator": [
        59,
        133,
        36,
        27,
        156,
        79,
        75,
        146
      ]
    },
    {
      "name": "adminWithdrawn",
      "discriminator": [
        12,
        67,
        18,
        232,
        19,
        82,
        237,
        212
      ]
    },
    {
      "name": "diceRolled",
      "discriminator": [
        7,
        111,
        244,
        16,
        252,
        210,
        24,
        250
      ]
    },
    {
      "name": "platformInitialized",
      "discriminator": [
        16,
        222,
        212,
        5,
        213,
        140,
        112,
        162
      ]
    },
    {
      "name": "platformLimitUpdated",
      "discriminator": [
        8,
        254,
        198,
        113,
        12,
        94,
        133,
        91
      ]
    },
    {
      "name": "playerInitialized",
      "discriminator": [
        214,
        37,
        153,
        142,
        63,
        109,
        206,
        15
      ]
    },
    {
      "name": "playerWithdrawal",
      "discriminator": [
        156,
        217,
        238,
        4,
        144,
        93,
        128,
        57
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidChoice",
      "msg": "Choice must be between 1 and 6"
    },
    {
      "code": 6001,
      "name": "noBetPlaced",
      "msg": "No bet placed yet"
    },
    {
      "code": 6002,
      "name": "exceedsMaxBet",
      "msg": "Bet exceeds max allowed"
    },
    {
      "code": 6003,
      "name": "nothingToWithdraw",
      "msg": "Nothing to withdraw"
    },
    {
      "code": 6004,
      "name": "dailyLimitReached",
      "msg": "Platform daily payout limit reached"
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6006,
      "name": "maxAdminsReached",
      "msg": "Maximum number of admins reached"
    },
    {
      "code": 6007,
      "name": "cannotRemovePrimaryAdmin",
      "msg": "Cannot remove primary admin"
    },
    {
      "code": 6008,
      "name": "invalidField",
      "msg": "Invalid field name provided"
    },
    {
      "code": 6009,
      "name": "insufficientVaultBalance",
      "msg": "Insufficient vault balance"
    },
    {
      "code": 6010,
      "name": "platformNotInitialized",
      "msg": "Platform not initialized"
    },
    {
      "code": 6011,
      "name": "playerNotFound",
      "msg": "Player account not found"
    },
    {
      "code": 6012,
      "name": "adminAlreadyExists",
      "msg": "Admin already exists"
    },
    {
      "code": 6013,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    }
  ],
  "types": [
    {
      "name": "admin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "pubkey"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "adminAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "addedBy",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "adminDeposited",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "adminRemoved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "removedBy",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "adminWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "dailyWithdrawal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "date",
            "type": "i64"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "diceRolled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "quantumNoise",
            "type": "u8"
          },
          {
            "name": "result",
            "type": "u8"
          },
          {
            "name": "won",
            "type": "bool"
          },
          {
            "name": "payout",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "platformInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "platformLimitUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "field",
            "type": "string"
          },
          {
            "name": "oldValue",
            "type": "u64"
          },
          {
            "name": "newValue",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "platformStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "lastReset",
            "type": "i64"
          },
          {
            "name": "withdrawnToday",
            "type": "u64"
          },
          {
            "name": "primaryAdmin",
            "type": "pubkey"
          },
          {
            "name": "adminCount",
            "type": "u8"
          },
          {
            "name": "totalBets",
            "type": "u64"
          },
          {
            "name": "totalVolume",
            "type": "u64"
          },
          {
            "name": "totalUsers",
            "type": "u64"
          },
          {
            "name": "dailyWithdrawal",
            "type": {
              "defined": {
                "name": "dailyWithdrawal"
              }
            }
          },
          {
            "name": "totalProfit",
            "type": "u64"
          },
          {
            "name": "totalOwed",
            "type": "u64"
          },
          {
            "name": "currentActiveUsers",
            "type": "u64"
          },
          {
            "name": "maxBetLamports",
            "type": "u64"
          },
          {
            "name": "dailyWithdrawLimit",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lastResult",
            "type": "u8"
          },
          {
            "name": "currentBet",
            "type": "u8"
          },
          {
            "name": "lastBetAmount",
            "type": "u64"
          },
          {
            "name": "pendingWithdrawal",
            "type": "u64"
          },
          {
            "name": "wins",
            "type": "u16"
          },
          {
            "name": "losses",
            "type": "u16"
          },
          {
            "name": "totalGames",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "playerInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "playerWithdrawal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
