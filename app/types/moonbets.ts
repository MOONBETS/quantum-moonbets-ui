/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/moonbets.json`.
 */
export type Moonbets = {
    "address": "75fuoHrdGCZwtX5GFkKvd6gZf6mFqyEQ2CknVUN1ak1W",
    "metadata": {
        "name": "moonbets",
        "version": "0.1.0",
        "spec": "0.1.0",
        "description": "Created with Anchor"
    },
    "instructions": [
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
                    "writable": true
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
                    "writable": true
                },
                {
                    "name": "platformStats",
                    "writable": true
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
            "name": "callbackRollDice",
            "discriminator": [
                129,
                76,
                217,
                160,
                252,
                234,
                19,
                238
            ],
            "accounts": [
                {
                    "name": "vrfProgramIdentity",
                    "signer": true,
                    "address": "9irBy75QS2BN81FUgXuHcjqceJJRuc9oDkAe8TKVvvAw"
                },
                {
                    "name": "player",
                    "writable": true
                },
                {
                    "name": "platformStats",
                    "writable": true
                }
            ],
            "args": [
                {
                    "name": "randomness",
                    "type": {
                        "array": [
                            "u8",
                            32
                        ]
                    }
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
                    "signer": true
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
                    "writable": true
                },
                {
                    "name": "platformStats",
                    "writable": true
                },
                {
                    "name": "oracleQueue",
                    "writable": true
                },
                {
                    "name": "programIdentity",
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    105,
                                    100,
                                    101,
                                    110,
                                    116,
                                    105,
                                    116,
                                    121
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "slotHashes",
                    "address": "SysvarS1otHashes111111111111111111111111111"
                },
                {
                    "name": "vrfProgram",
                    "address": "Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz"
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "userChoice",
                    "type": "u8"
                },
                {
                    "name": "betAmount",
                    "type": "u64"
                },
                {
                    "name": "clientSeed",
                    "type": "u8"
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
                    "writable": true
                }
            ],
            "args": []
        }
    ],
    "accounts": [
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
        }
    ],
    "types": [
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
                        "name": "admin",
                        "type": "pubkey"
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
        }
    ]
};
