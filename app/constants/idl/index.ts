export type IDL = {
  "address": "1ckXSJ2TDNizSpBWftmgCtxCZ22crs2ELsrdgeeAfi8",
  "metadata": {
    "name": "lock",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "asrClaim",
      "discriminator": [
        208,
        204,
        203,
        207,
        48,
        165,
        24,
        5
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "user"
          ]
        },
        {
          "name": "auth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "analytics"
              }
            ]
          }
        },
        {
          "name": "lock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "lock.creator",
                "account": "lock"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "signerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "analytics",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  116,
                  105,
                  99,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "asrDeposit",
      "discriminator": [
        195,
        224,
        114,
        12,
        46,
        70,
        232,
        44
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "lock"
          ]
        },
        {
          "name": "auth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "analytics"
              }
            ]
          }
        },
        {
          "name": "lock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "signerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "analytics",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  116,
                  105,
                  99,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
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
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "auth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "analytics"
              }
            ]
          }
        },
        {
          "name": "analytics",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  116,
                  105,
                  99,
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
      "name": "lockNew",
      "discriminator": [
        99,
        67,
        134,
        216,
        18,
        202,
        123,
        157
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "auth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "analytics"
              }
            ]
          }
        },
        {
          "name": "lock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "signerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "analytics",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  116,
                  105,
                  99,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "config",
          "type": "u8"
        },
        {
          "name": "votingPeriod",
          "type": "i64"
        },
        {
          "name": "lockDuration",
          "type": "i64"
        },
        {
          "name": "threshold",
          "type": "u8"
        },
        {
          "name": "quorum",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        }
      ]
    },
    {
      "name": "proposalExecute",
      "discriminator": [
        11,
        199,
        235,
        200,
        187,
        186,
        18,
        4
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "lock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "lock.creator",
                "account": "lock"
              },
              {
                "kind": "account",
                "path": "lock.mint",
                "account": "lock"
              }
            ]
          }
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "proposal.id",
                "account": "proposal"
              }
            ]
          }
        },
        {
          "name": "analytics",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  116,
                  105,
                  99,
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
      "name": "proposalNew",
      "discriminator": [
        94,
        164,
        227,
        29,
        12,
        125,
        35,
        221
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "lock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "lock.creator",
                "account": "lock"
              },
              {
                "kind": "account",
                "path": "lock.mint",
                "account": "lock"
              }
            ]
          }
        },
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "analytics",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  116,
                  105,
                  99,
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
          "name": "title",
          "type": "string"
        },
        {
          "name": "choices",
          "type": {
            "vec": {
              "defined": {
                "name": "choice"
              }
            }
          }
        }
      ]
    },
    {
      "name": "register",
      "discriminator": [
        211,
        124,
        67,
        15,
        211,
        194,
        178,
        240
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "auth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "analytics"
              }
            ]
          }
        },
        {
          "name": "lock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "lock.creator",
                "account": "lock"
              },
              {
                "kind": "account",
                "path": "lock.mint",
                "account": "lock"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "analytics",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  116,
                  105,
                  99,
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
      "name": "stakeClaim",
      "discriminator": [
        206,
        208,
        31,
        82,
        213,
        249,
        175,
        1
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "auth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "analytics"
              }
            ]
          }
        },
        {
          "name": "lock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "lock.creator",
                "account": "lock"
              },
              {
                "kind": "account",
                "path": "lock.mint",
                "account": "lock"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "signerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "analytics",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  116,
                  105,
                  99,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "stakeDeactivate",
      "discriminator": [
        224,
        10,
        93,
        175,
        175,
        145,
        237,
        169
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "user"
          ]
        },
        {
          "name": "lock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "lock.creator",
                "account": "lock"
              },
              {
                "kind": "account",
                "path": "lock.mint",
                "account": "lock"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "analytics",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  116,
                  105,
                  99,
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
      "name": "stakeNew",
      "discriminator": [
        84,
        232,
        75,
        245,
        13,
        56,
        78,
        53
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "auth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "analytics"
              }
            ]
          }
        },
        {
          "name": "lock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "lock.creator",
                "account": "lock"
              },
              {
                "kind": "account",
                "path": "lock.mint",
                "account": "lock"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "signerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "analytics",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  116,
                  105,
                  99,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
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
      "name": "voteNew",
      "discriminator": [
        44,
        255,
        253,
        157,
        138,
        24,
        18,
        203
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "lock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "lock.creator",
                "account": "lock"
              },
              {
                "kind": "account",
                "path": "lock.mint",
                "account": "lock"
              }
            ]
          }
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "lock"
              },
              {
                "kind": "account",
                "path": "proposal.id",
                "account": "proposal"
              }
            ]
          }
        },
        {
          "name": "analytics",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  116,
                  105,
                  99,
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
          "name": "index",
          "type": "u64"
        },
        {
          "name": "id",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "analytics",
      "discriminator": [
        135,
        28,
        189,
        27,
        51,
        143,
        253,
        88
      ]
    },
    {
      "name": "lock",
      "discriminator": [
        8,
        255,
        36,
        202,
        210,
        22,
        57,
        137
      ]
    },
    {
      "name": "proposal",
      "discriminator": [
        26,
        94,
        189,
        187,
        116,
        136,
        53,
        33
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "lockerNameEmpty",
      "msg": "Locker Name Empty."
    },
    {
      "code": 6001,
      "name": "lockerNameTooLong",
      "msg": "Locker Name Too Long, 50 Characters Max."
    },
    {
      "code": 6002,
      "name": "symbolEmpty",
      "msg": "Symbol Empty"
    },
    {
      "code": 6003,
      "name": "symbolTooLong",
      "msg": "Symbol Too Long, 10 Characters Max."
    },
    {
      "code": 6004,
      "name": "pollTitleEmpty",
      "msg": "Poll Title Empty."
    },
    {
      "code": 6005,
      "name": "pollTitleTooLong",
      "msg": "Poll Title Too Long, 50 Characters Max."
    },
    {
      "code": 6006,
      "name": "pollContentEmpty",
      "msg": "Poll Content Empty."
    },
    {
      "code": 6007,
      "name": "pollContentTooLong",
      "msg": "Poll Content Too Long, 280 Characters Max."
    },
    {
      "code": 6008,
      "name": "votingPeriodOutOfBounds",
      "msg": "Voting Period Out Of Bounds : Min 1 Day, Max 1 Week"
    },
    {
      "code": 6009,
      "name": "lockDurationOutOfBounds",
      "msg": "Lock Duration Out Of Bounds : Min 1 Month, Max 5 Years"
    },
    {
      "code": 6010,
      "name": "invalidLockDuration",
      "msg": "Invalid Lock Duration"
    },
    {
      "code": 6011,
      "name": "thresholdOutOfBounds",
      "msg": "Threshold Out Of Bounds : Min 50%, Max 100%"
    },
    {
      "code": 6012,
      "name": "quorumOutOfBounds",
      "msg": "Quorum Out Of Bounds : Min 0%, Max 100%"
    },
    {
      "code": 6013,
      "name": "wrongLockerMint",
      "msg": "Wrong Locker Mint"
    },
    {
      "code": 6014,
      "name": "notEnoughDepositsToStartPoll",
      "msg": "Not Enough Deposits To Start Poll."
    },
    {
      "code": 6015,
      "name": "noDepositsForThisUserInThisLocker",
      "msg": "No Deposits For This User In This Locker"
    },
    {
      "code": 6016,
      "name": "userHaveNoVotingPowerInThisLock",
      "msg": "No Voting Power For This User Found In This Lock"
    },
    {
      "code": 6017,
      "name": "votingPeriodExpired",
      "msg": "Voting Period Expired."
    },
    {
      "code": 6018,
      "name": "userAlreadyVotedThisPoll",
      "msg": "User Already Voted This Poll."
    },
    {
      "code": 6019,
      "name": "waitForVotingPeriodToEnd",
      "msg": "Wait For Voting Period To End."
    },
    {
      "code": 6020,
      "name": "pollAlreadyExecuted",
      "msg": "Poll Already Executed."
    },
    {
      "code": 6021,
      "name": "noDepositsReadyToClaimForThisUserInThisLocker",
      "msg": "No Deposits Ready To Claim For This User In This Locker"
    },
    {
      "code": 6022,
      "name": "configUnrecognized",
      "msg": "Config Unrecognized"
    },
    {
      "code": 6023,
      "name": "instructionUnavailableForThisLock",
      "msg": "Instruction Unavailable For This Lock"
    },
    {
      "code": 6024,
      "name": "userAlreadyClaimedThis",
      "msg": "User Already Claimed This"
    }
  ],
  "types": [
    {
      "name": "asr",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "analytics",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "locks",
            "type": "u64"
          },
          {
            "name": "polls",
            "type": "u64"
          },
          {
            "name": "votes",
            "type": "u64"
          },
          {
            "name": "approved",
            "type": "u64"
          },
          {
            "name": "rejected",
            "type": "u64"
          },
          {
            "name": "points",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "authBump",
            "type": "u8"
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "choice",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u8"
          },
          {
            "name": "votingPower",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "claim",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "season",
            "type": "u8"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "deposit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "deactivating",
            "type": "bool"
          },
          {
            "name": "deactivationStart",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "lock",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "u8"
          },
          {
            "name": "votingPeriod",
            "type": "i64"
          },
          {
            "name": "lockDuration",
            "type": "i64"
          },
          {
            "name": "threshold",
            "type": "u8"
          },
          {
            "name": "quorum",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "totalDeposits",
            "type": "u64"
          },
          {
            "name": "polls",
            "type": "u64"
          },
          {
            "name": "votes",
            "type": "u64"
          },
          {
            "name": "approved",
            "type": "u64"
          },
          {
            "name": "rejected",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "lockBump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "seasons",
            "type": {
              "vec": {
                "defined": {
                  "name": "season"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "lock",
            "type": "pubkey"
          },
          {
            "name": "summoner",
            "type": "pubkey"
          },
          {
            "name": "season",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "endsAt",
            "type": "i64"
          },
          {
            "name": "executed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "status"
              }
            }
          },
          {
            "name": "result",
            "type": {
              "option": {
                "defined": {
                  "name": "choice"
                }
              }
            }
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "choices",
            "type": {
              "vec": {
                "defined": {
                  "name": "choice"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "season",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "season",
            "type": "u8"
          },
          {
            "name": "points",
            "type": "u64"
          },
          {
            "name": "asr",
            "type": {
              "vec": {
                "defined": {
                  "name": "asr"
                }
              }
            }
          },
          {
            "name": "seasonStart",
            "type": "i64"
          },
          {
            "name": "seasonEnd",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "status",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "approved"
          },
          {
            "name": "rejected"
          },
          {
            "name": "voting"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "lock",
            "type": "pubkey"
          },
          {
            "name": "points",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "deposits",
            "type": {
              "vec": {
                "defined": {
                  "name": "deposit"
                }
              }
            }
          },
          {
            "name": "votes",
            "type": {
              "vec": {
                "defined": {
                  "name": "vote"
                }
              }
            }
          },
          {
            "name": "claims",
            "type": {
              "vec": {
                "defined": {
                  "name": "claim"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "vote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "season",
            "type": "u8"
          },
          {
            "name": "poll",
            "type": "u64"
          },
          {
            "name": "votingPower",
            "type": "u64"
          },
          {
            "name": "choice",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
