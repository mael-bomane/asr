import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Asr } from "../target/types/asr";
import { BN } from "bn.js";
import * as assert from "assert";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

const commitment: Commitment = "confirmed";

describe("lock", () => {

  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const program = anchor.workspace.Asr as Program<Asr>;

  //@ts-ignore
  const connection: Connection = anchor.getProvider().connection;

  const wallet = provider.wallet as anchor.Wallet;

  const user1 = new Keypair();
  const user2 = new Keypair();
  const user3 = new Keypair();

  const rpc = provider.connection.rpcEndpoint;

  console.log("rpc : ", rpc);

  let mint: PublicKey;

  const keypair = Keypair.generate();

  mint = rpc == "https://api.devnet.solana.com" ? new PublicKey('FZPduNH9a1FdBauDcooD7dw14iV3ywZWZmJJwsvD4SRZ') : keypair.publicKey;

  const analytics = PublicKey.findProgramAddressSync(
    [Buffer.from("analytics")],
    program.programId
  )[0];

  const auth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), analytics.toBuffer()],
    program.programId
  )[0];

  const lock = PublicKey.findProgramAddressSync(
    // seeds = [b"locker", creator.key().as_ref(), mint.key().as_ref()]
    [Buffer.from("lock"), rpc == "https://api.devnet.solana.com" ? wallet.publicKey.toBytes() : user1.publicKey.toBytes(), mint.toBytes()],
    program.programId
  )[0];

  const user1Pda = PublicKey.findProgramAddressSync(
    // seeds = [b"user", lock.key().as_ref(), signer.key().as_ref()]
    [Buffer.from("user"), lock.toBytes(), rpc == "https://api.devnet.solana.com" ? wallet.publicKey.toBytes() : user1.publicKey.toBytes()],
    program.programId
  )[0];

  const user1Vault = PublicKey.findProgramAddressSync(
    // seeds = [b"vault", creator.key().as_ref(), mint.key().as_ref()]
    [Buffer.from("vault"), lock.toBytes(), user1.publicKey.toBytes()],
    program.programId
  )[0];

  const user2Pda = PublicKey.findProgramAddressSync(
    // seeds = [b"user", lock.key().as_ref(), signer.key().as_ref()]
    [Buffer.from("user"), lock.toBytes(), user2.publicKey.toBytes()],
    program.programId
  )[0];

  const user2Vault = PublicKey.findProgramAddressSync(
    // seeds = [b"vault", lock.key().as_ref(), owner.key().as_ref()]
    [Buffer.from("vault"), lock.toBytes(), user2.publicKey.toBytes()],
    program.programId
  )[0];

  const user3Pda = PublicKey.findProgramAddressSync(
    // seeds = [b"user", lock.key().as_ref(), signer.key().as_ref()]
    [Buffer.from("user"), lock.toBytes(), user3.publicKey.toBytes()],
    program.programId
  )[0];

  const user3Vault = PublicKey.findProgramAddressSync(
    // seeds = [b"vault", lock.key().as_ref(), owner.key().as_ref()]
    [Buffer.from("vault"), lock.toBytes(), user3.publicKey.toBytes()],
    program.programId
  )[0];

  const vault = PublicKey.findProgramAddressSync(
    // seeds = [b"vault", creator.key().as_ref(), mint.key().as_ref()]
    [Buffer.from("vault"), lock.toBytes(), mint.toBytes()],
    program.programId
  )[0];

  const proposal1 = PublicKey.findProgramAddressSync(
    // seeds = [b"poll", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
    [Buffer.from("proposal"), lock.toBytes(), new BN(1).toArrayLike(Buffer, 'le', 8)],
    program.programId
  )[0];

  const proposalCoreUser2 = PublicKey.findProgramAddressSync(
    // seeds = [b"poll", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
    [Buffer.from("proposal"), lock.toBytes(), new BN(2).toArrayLike(Buffer, 'le', 8)],
    program.programId
  )[0];

  const proposal2 = PublicKey.findProgramAddressSync(
    // seeds = [b"poll", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
    [Buffer.from("proposal"), lock.toBytes(), new BN(2).toArrayLike(Buffer, 'le', 8)],
    program.programId
  )[0];

  const proposalStandardUser2 = PublicKey.findProgramAddressSync(
    // seeds = [b"poll", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
    [Buffer.from("proposal"), lock.toBytes(), new BN(3).toArrayLike(Buffer, 'le', 8)],
    program.programId
  )[0];

  const proposal3 = PublicKey.findProgramAddressSync(
    // seeds = [b"poll", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
    [Buffer.from("proposal"), lock.toBytes(), new BN(3).toArrayLike(Buffer, 'le', 8)],
    program.programId
  )[0];

  const proposalOptionUser2 = PublicKey.findProgramAddressSync(
    // seeds = [b"poll", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
    [Buffer.from("proposal"), lock.toBytes(), new BN(4).toArrayLike(Buffer, 'le', 8)],
    program.programId
  )[0];



  let signerAta: Account;
  let user1Ata: Account;
  let user2Ata: Account;
  let user3Ata: Account;

  const decimals = 6;

  const day = new BN(86400);
  const week = new BN(86400 * 7);
  const min = new BN(100 * 1 * 10 ** decimals);

  before(async () => {

    if (rpc == "https://api.devnet.solana.com") {
      signerAta = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet.payer,
        mint,
        wallet.publicKey
      );

      let user1MintTo = await mintTo(
        connection,
        wallet.payer,
        mint,
        signerAta.address,
        wallet.publicKey,
        1_000_000 * 1 * 10 ** decimals
      );
      console.log(`https://explorer.solana.com/tx/${user1MintTo}?cluster=devnet`);

    } else {
      await anchor
        .getProvider()
        .connection.requestAirdrop(
          user1.publicKey,
          100 * LAMPORTS_PER_SOL
        )
        .then(confirmTx);

      await anchor
        .getProvider()
        .connection.requestAirdrop(
          user2.publicKey,
          100 * anchor.web3.LAMPORTS_PER_SOL
        )
        .then(confirmTx);

      await anchor
        .getProvider()
        .connection.requestAirdrop(
          user3.publicKey,
          100 * LAMPORTS_PER_SOL
        )
        .then(confirmTx);


      let token = await createMint(
        connection,
        user1,
        user1.publicKey,
        user1.publicKey,
        decimals,
        keypair
      );

      console.log("Token : ", token.toBase58());

      user1Ata = await getOrCreateAssociatedTokenAccount(
        connection,
        user1,
        token,
        user1.publicKey
      );
      console.log("User 1 Associated Token Aaccount : ", user1Ata.address.toBase58());

      let user1MintTo = await mintTo(
        connection,
        user1,
        token,
        user1Ata.address,
        user1.publicKey,
        300 * 1 * 10 ** decimals
      );
      console.log(`https://explorer.solana.com/tx/${user1MintTo}?cluster=devnet`);
      let user1TokenAmount = await connection.getTokenAccountBalance(user1Ata.address);
      console.log(
        `minted ${user1TokenAmount.value.uiAmountString} ${token.toBase58()} tokens for user1`
      );

      user2Ata = await getOrCreateAssociatedTokenAccount(
        connection,
        user1,
        token,
        user2.publicKey
      );

      let user2MintTo = await mintTo(
        connection,
        user1,
        token,
        user2Ata.address,
        user1.publicKey,
        100 * 1 * 10 ** decimals
      );
      console.log(`https://explorer.solana.com/tx/${user2MintTo}?cluster=devnet`);
      let user2TokenAmount = await connection.getTokenAccountBalance(user2Ata.address);
      console.log(
        `minted ${user2TokenAmount.value.uiAmountString} ${token.toBase58()} tokens for user2`
      );

      user3Ata = await getOrCreateAssociatedTokenAccount(
        connection,
        user1,
        token,
        user3.publicKey
      );

      let user3MintTo = await mintTo(
        connection,
        user1,
        token,
        user3Ata.address,
        user1.publicKey,
        100 * 1 * 10 ** decimals
      );
      console.log(`https://explorer.solana.com/tx/${user3MintTo}?cluster=devnet`);
      let user3TokenAmount = await connection.getTokenAccountBalance(user3Ata.address);
      console.log(
        `minted ${user3TokenAmount.value.uiAmountString} ${token.toBase58()} tokens for user3`
      );

    }
  });

  it("initialize analytics", async () => {
    if (rpc == "https://api.devnet.solana.com") {
      await program.methods.initialize()
        .accountsStrict({
          signer: wallet.publicKey,
          auth,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID
        })
        .signers([wallet.payer])
        .rpc()
        .then(confirmTx);
    } else {
      await program.methods.initialize()
        .accountsStrict({
          signer: user1.publicKey,
          auth,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID
        })
        .signers([user1])
        .rpc()
        .then(confirmTx);
    }
  });

  // it("create an active staking rewards locker, min poll threshold 50% , min. tokens to start poll 100", async () => {
  //   //   // await program.methods.daoCreate({ twentyFourHours: {} }, 51, new BN(100), "Monolith DAO")
  //   if (rpc == "https://api.devnet.solana.com") {
  //     console.log("running on devnet");
  //     await program.methods.lockNew(0, week, new BN(0), 51, 25, min, "SOON")
  //       .accountsStrict({
  //         signer: wallet.publicKey,
  //         auth,
  //         lock,
  //         signerAta: signerAta.address,
  //         vault,
  //         mint,
  //         analytics,
  //         systemProgram: SYSTEM_PROGRAM_ID,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
  //       })
  //       .signers([wallet.payer])
  //       .rpc()
  //       .then(confirmTx)
  //       .then(async () => {
  //         const debug = await program.account.lock.fetch(lock);
  //         console.log(debug)
  //       });
  //   } else {
  //     console.log("running on localnet");
  //     await program.methods.lockNew(0, day, new BN(0), 51, 25, min, "SOON")
  //       .accountsStrict({
  //         signer: user1.publicKey,
  //         auth,
  //         lock,
  //         signerAta: user1Ata.address,
  //         vault,
  //         mint,
  //         analytics,
  //         systemProgram: SYSTEM_PROGRAM_ID,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
  //       })
  //       .signers([user1])
  //       .rpc()
  //       .then(confirmTx)
  //       .then(async () => {
  //         const debug = await program.account.lock.fetch(lock);
  //         console.log(debug)
  //       });
  //   }
  // });

  it("create asr lock", async () => {
    if (rpc == "https://api.devnet.solana.com") {
      console.log("running on devnet");
      await program.methods.lockNew(0, true, day, new BN(43200), new BN(86400), 51, 25, min, "Monolith", "MONO")
        .accountsStrict({
          signer: wallet.publicKey,
          auth,
          lock,
          signerAta: signerAta.address,
          vault,
          mint,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
        })
        .signers([wallet.payer])
        .rpc()
        .then(confirmTx)
        .then(async () => {
          const debug = await program.account.lock.fetch(lock);
          console.log(debug)
        });
    } else {
      console.log("running on localnet");
      await program.methods.lockNew(
        0, //config
        false, //permissionless
        new BN(15), //season_duration
        new BN(5), // voting_period
        new BN(5), // lock_duration
        51, //approval_threshold
        25, //quorum
        min, // amount
        "Monolith", //name 
        "MONO" // symbol
      )
        .accountsStrict({
          signer: user1.publicKey,
          auth,
          lock,
          signerAta: user1Ata.address,
          vault,
          mint,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
        })
        .signers([user1])
        .rpc()
        .then(confirmTx)
        .then(async () => {
          const debug = await program.account.lock.fetch(lock);
          console.log(debug);
          assert.strictEqual("Monolith", debug.config.name);
        });
    }
  });

  // it("User 2 Create Permissioned ASR Vault, Voting 1 Day, Approval Threshold 51% , 100 Tokens", async () => {
  //   if (rpc == "https://api.devnet.solana.com") {
  //     console.log("running on devnet");
  //     await program.methods.lockNew(0, true, day, new BN(0), 51, 25, min, "WBA", "WBA")
  //       .accountsStrict({
  //         signer: wallet.publicKey,
  //         auth,
  //         lock,
  //         signerAta: signerAta.address,
  //         vault,
  //         mint,
  //         analytics,
  //         systemProgram: SYSTEM_PROGRAM_ID,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
  //       })
  //       .signers([wallet.payer])
  //       .rpc()
  //       .then(confirmTx)
  //       .then(async () => {
  //         const debug = await program.account.lock.fetch(lock);
  //         console.log(debug)
  //       });
  //   } else {
  //     console.log("running on localnet");
  //     // voting escrow
  //     // await program.methods.lockerNew(1, day, new BN(86400 * 7 * 52), 51, min, "SOON")
  //     // active staking rewards
  //     // await program.methods.lockNew(0, day, new BN(0), 51, 25, min, "SOON")
  //     await program.methods.lockNew(0, true, day, new BN(0), 51, 25, min, "WBA", "WBA")
  //       .accountsStrict({
  //         signer: user2.publicKey,
  //         auth,
  //         //user: user1Pda,
  //         lock,
  //         signerAta: user2Ata.address,
  //         vault,
  //         mint,
  //         analytics,
  //         systemProgram: SYSTEM_PROGRAM_ID,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
  //       })
  //       .signers([user1])
  //       .rpc()
  //       .then(confirmTx)
  //       .then(async () => {
  //         const debug = await program.account.lock.fetch(lock);
  //         assert.strictEqual("Monolith", debug.config.name);
  //       });
  //   }
  // });


  it("user1 deposit asr tokens", async () => {
    await program.methods.asrDeposit(min, "MONO")
      .accountsStrict({
        creator: user1.publicKey,
        signerAta: user1Ata.address,
        mint,
        lock,
        vault,
        auth,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.lock.fetch(lock);
        debug.seasons.forEach(season => {
          console.log(`season have ${season.asr.length} reward tokens`)
          assert.strictEqual(1, season.asr.length);
          season.asr.map(x => assert.strictEqual(100, x.amount.toNumber() / (1 * 10 ** 6)));
        })
      })
  });

  it("user1 deposit asr tokens again", async () => {
    await program.methods.asrDeposit(min, "MONO")
      .accountsStrict({
        creator: user1.publicKey,
        signerAta: user1Ata.address,
        mint,
        lock,
        vault,
        auth,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.lock.fetch(lock);
        debug.seasons.map(season => {
          season.asr.map(r => {
            console.log(`ASR Reward : ${r.amount.toNumber() / (1 * 10 ** decimals)} ${r.mint.toString()}`)
            assert.strictEqual(r.symbol, "MONO");
            assert.strictEqual(r.amount.toNumber() / (1 * 10 ** decimals), 200);
          })
        });
      });
  });

  it("user2 try deposit ASR (spam) to permissioned lock", async () => {
    await assert.rejects((async () => {
      await program.methods.asrDeposit(new BN(50 * 10 ** 6), "MONO")
        .accountsStrict({
          creator: user2.publicKey,
          signerAta: user2Ata.address,
          mint,
          lock,
          vault,
          auth,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
        })
        .signers([user2])
        .rpc()
        .then(confirmTx);
    })(), (err: any) => {
      console.log(err.error.errorCode.code)
      assert.strictEqual(err.error.errorCode.code, "UnauthorizedManagersOnly");
      return true
    });
  });


  it("register user1 to lock", async () => {
    await program.methods.register()
      .accountsStrict({
        owner: user1.publicKey,
        user: user1Pda,
        auth,
        lock,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.user.fetch(user1Pda);
        assert.strictEqual(debug.owner.toString(), user1.publicKey.toString());
      });
  });

  it("user1 stake 100 tokens", async () => {
    await program.methods.stakeNew(min)
      .accountsStrict({
        owner: user1.publicKey,
        user: user1Pda,
        auth,
        lock,
        signerAta: user1Ata.address,
        vault: user1Vault,
        mint,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.lock.fetch(lock);
        console.log("Lock Voting Power : ", debug.totalDeposits.toNumber() / (1 * 10 ** decimals));
        assert.strictEqual(debug.totalDeposits.toNumber() / (1 * 10 ** decimals), 100);
        const user = await program.account.user.fetch(user1Pda);
        user.deposits.map((deposit, index) => {
          console.log(`User 1 Deposit ${index} `, deposit.amount.toNumber() / (1 * 10 ** decimals));
          assert.strictEqual(deposit.amount.toNumber() / (1 * 10 ** decimals), 100);
        })
      });
  });

  it("register user2 to lock", async () => {
    await program.methods.register()
      .accountsStrict({
        owner: user2.publicKey,
        user: user2Pda,
        auth,
        lock,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user2])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.user.fetch(user2Pda);
        assert.strictEqual(debug.owner.toString(), user2.publicKey.toString());
      });
  });

  it("user2 stake 100 tokens", async () => {
    await program.methods.stakeNew(min)
      .accountsStrict({
        owner: user2.publicKey,
        user: user2Pda,
        auth,
        lock,
        signerAta: user2Ata.address,
        vault: user2Vault,
        mint,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
      })
      .signers([user2])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.lock.fetch(lock);
        console.log("Lock Voting Power : ", debug.totalDeposits.toNumber() / (1 * 10 ** decimals));
        assert.strictEqual(debug.totalDeposits.toNumber() / (1 * 10 ** decimals), 200);
        const user = await program.account.user.fetch(user2Pda);
        user.deposits.map((deposit, index) => {
          console.log(`User 2 Deposit ${index} `, deposit.amount.toNumber() / (1 * 10 ** decimals));
          assert.strictEqual(deposit.amount.toNumber() / (1 * 10 ** decimals), 100);
        })
      });
  });

  it("user1 start proposal core (type 0)", async () => {
    await program.methods.proposalCore(
      0,
      true, // permissionless
      new BN(86400 * 7), // season_duration
      new BN(86400), // voting_period
      null, // lock_duration
      66, // threshold
      20, // quorum
      new BN(42 * 1 * 10 ** decimals), // amount
      "ASR", // name
      "ASR", // symbol
    )
      .accountsStrict({
        signer: user1.publicKey,
        proposal: proposal1,
        lock,
        user: user1Pda,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.proposal.fetch(proposal1);
        console.log(debug);
        // assert.strictEqual(debugTitle, title);
      });
  });

  it("user2 cannot start proposal core (type 0)", async () => {
    await assert.rejects((async () => {
      await program.methods.proposalCore(
        0,
        null, // permissionless
        null, // season_duration
        null, // voting_period
        null, // lock_duration
        null, // threshold
        null, // quorum
        null, // amount
        null, // name
        null, // symbol
      ).accountsStrict({
        signer: user2.publicKey,
        proposal: proposalCoreUser2,
        lock,
        user: user2Pda,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
        .signers([user2])
        .rpc()
        .then(confirmTx);
    })(), (err: any) => {
      console.log(err.error.errorCode.code)
      assert.strictEqual(err.error.errorCode.code, "UnauthorizedManagersOnly");
      return true
    });
  });

  it("user1 start proposal standard (type 1)", async () => {
    const title = "proposal standard";
    const content = "this proposal have 3 default choices : for, against & abstain"

    console.log("title length : ", title.length)
    console.log("content length : ", content.length)

    await program.methods.proposalStandard(title, content)
      .accountsStrict({
        owner: user1.publicKey,
        proposal: proposal2,
        lock,
        user: user1Pda,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.proposal.fetch(proposal2);
        const debugTitle = debug.title;
        console.log("Proposal Title : ", debugTitle);
        assert.strictEqual(debugTitle, title);
        const debugContent = debug.content;
        console.log("Proposal Content : ", debugContent);
        assert.strictEqual(debugContent, content);
      });
  });

  it("user2 cannot start proposal standard (type 1)", async () => {
    await assert.rejects((async () => {
      await program.methods.proposalStandard("rogue proposal", "this lock is permissioned",)
        .accountsStrict({
          owner: user2.publicKey,
          proposal: proposalStandardUser2,
          lock,
          user: user2Pda,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([user2])
        .rpc()
        .then(confirmTx);
    })(), (err: any) => {
      console.log(err.error.errorCode.code)
      assert.strictEqual(err.error.errorCode.code, "UnauthorizedManagersOnly");
      return true
    });
  });

  it("user1 start proposal option (type 2)", async () => {
    const title = "proposal option";
    const content = "this proposal have  5 options (up to 255)"

    console.log("title length : ", title.length)
    console.log("content length : ", content.length)

    await program.methods.proposalOption(
      title,
      content,
      [
        {
          id: 0,
          votingPower: new BN(0),
          title: "Option 1",
        },
        {
          id: 1,
          votingPower: new BN(0),
          title: "Option 2",
        },
        {
          id: 2,
          votingPower: new BN(0),
          title: "Option 3",
        },
        {
          id: 3,
          votingPower: new BN(0),
          title: "Option 4",
        },
        {
          id: 4,
          votingPower: new BN(0),
          title: "Option 5",
        },
      ],
    )
      .accountsStrict({
        owner: user1.publicKey,
        proposal: proposal3,
        lock,
        user: user1Pda,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.proposal.fetch(proposal3);
        const debugTitle = debug.title;
        console.log("Proposal Title : ", debugTitle);
        assert.strictEqual(debugTitle, title);
        const debugContent = debug.content;
        console.log("Proposal Content : ", debugContent);
        assert.strictEqual(debugContent, content);
      });
  });

  it("user2 cannot start proposal option (type 2)", async () => {
    await assert.rejects((async () => {
      await program.methods.proposalOption(
        "rogue proposal",
        "this lock is permissioned",
        [
          {
            id: 0,
            votingPower: new BN(0),
            title: "Option 1",
          },
          {
            id: 1,
            votingPower: new BN(0),
            title: "Option 2",
          },
        ],
      )
        .accountsStrict({
          owner: user2.publicKey,
          proposal: proposalOptionUser2,
          lock,
          user: user2Pda,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([user2])
        .rpc()
        .then(confirmTx);
    })(), (err: any) => {
      console.log(err.error.errorCode.code)
      assert.strictEqual(err.error.errorCode.code, "UnauthorizedManagersOnly");
      return true
    });
  });

  it("user1 vote 'For' on proposal core /w 100 voting power", async () => {
    await program.methods.voteNew(new BN(1), 0)
      .accountsStrict({
        owner: user1.publicKey,
        user: user1Pda,
        proposal: proposal1,
        lock,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.proposal.fetch(proposal1);
        assert.strictEqual(debug.choices.length, 3);
        debug.choices.forEach((choice, index) => {
          const power = choice.votingPower.toNumber() / (1 * 10 ** decimals);
          if (index == 0) {
            assert.strictEqual(power, 100);
          }
          console.log(`Proposal Choice ${index} : ${power}`);
          console.log(choice);
        })
      });
  });

  it("user1 vote 'For' on proposal standard (type 1) /w 100 voting power", async () => {
    await program.methods.voteNew(new BN(2), 0)
      .accountsStrict({
        owner: user1.publicKey,
        user: user1Pda,
        proposal: proposal2,
        lock,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.proposal.fetch(proposal2);
        assert.strictEqual(debug.choices.length, 3);
        debug.choices.forEach((choice, index) => {
          const power = choice.votingPower.toNumber() / (1 * 10 ** decimals);
          if (index == 0) {
            assert.strictEqual(power, 100);
          }
          console.log(`Proposal Choice ${index} : ${power}`);
          console.log(choice);
        })
      });
  });

  it("user1 tries voting twice on proposal core", async () => {
    await assert.rejects((async () => {
      await program.methods.voteNew(new BN(1), 0)
        .accountsStrict({
          owner: user1.publicKey,
          user: user1Pda,
          proposal: proposal1,
          lock,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([user1])
        .rpc()
        .then(confirmTx);
    })(), (err: any) => {
      console.log(err.error.errorCode.code)
      assert.strictEqual(err.error.errorCode.code, "UserAlreadyVotedThisPoll");
      return true
    });
  });

  it("user1 tries voting twice on proposal standard", async () => {
    await assert.rejects((async () => {
      await program.methods.voteNew(new BN(2), 0)
        .accountsStrict({
          owner: user1.publicKey,
          user: user1Pda,
          proposal: proposal2,
          lock,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([user1])
        .rpc()
        .then(confirmTx);
    })(), (err: any) => {
      console.log(err.error.errorCode.code)
      assert.strictEqual(err.error.errorCode.code, "UserAlreadyVotedThisPoll");
      return true
    });
  });


  it("register user3 to lock", async () => {
    await program.methods.register()
      .accountsStrict({
        owner: user3.publicKey,
        user: user3Pda,
        auth,
        lock,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user3])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.user.fetch(user3Pda);
        assert.strictEqual(debug.owner.toString(), user3.publicKey.toString());
      });

  });

  it("user3 tries to vote without voting power", async () => {
    await assert.rejects((async () => {
      await program.methods.voteNew(new BN(1), 0)
        .accountsStrict({
          owner: user3.publicKey,
          user: user3Pda,
          proposal: proposal1,
          lock,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([user3])
        .rpc()
        .then(confirmTx)
    })(), (err: any) => {
      console.log(err.error.errorCode.code)
      assert.strictEqual(err.error.errorCode.code, "UserHaveNoVotingPowerInThisLock");
      return true
    });
  });

  it("user3 stake 100 tokens", async () => {
    await program.methods.stakeNew(min)
      .accountsStrict({
        owner: user3.publicKey,
        user: user3Pda,
        auth,
        lock,
        signerAta: user3Ata.address,
        vault: user3Vault,
        mint,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
      })
      .signers([user3])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.lock.fetch(lock);
        console.log("Lock Voting Power : ", debug.totalDeposits.toNumber() / (1 * 10 ** decimals));
        assert.strictEqual(debug.totalDeposits.toNumber() / (1 * 10 ** decimals), 300);
        const user = await program.account.user.fetch(user3Pda);
        user.deposits.map((deposit, index) => {
          console.log(`User 3 Deposit ${index} `, deposit.amount.toNumber() / (1 * 10 ** decimals));
          assert.strictEqual(deposit.amount.toNumber() / (1 * 10 ** decimals), 100);
        })
      });
  });

  it("user3 deactivate his staked deposits", async () => {
    await program.methods.stakeDeactivate()
      .accountsStrict({
        owner: user3.publicKey,
        user: user3Pda,
        lock,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user3])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.user.fetch(user3Pda);
        debug.deposits.forEach(deposit => {
          console.log(deposit)
          assert.strictEqual(deposit.deactivating, true);
        });
        let user3TokenAmount = await connection.getTokenAccountBalance(user3Ata.address);
        console.log(`User 3 now have ${user3TokenAmount.value.uiAmount} Tokens`)
      });
  });

  it("user2 vote 'For' on poll 0 /w 100 voting power", async () => {
    await program.methods.voteNew(new BN(1), 0)
      .accountsStrict({
        owner: user2.publicKey,
        user: user2Pda,
        proposal: proposal1,
        lock,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user2])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.proposal.fetch(proposal1);
        assert.strictEqual(debug.choices.length, 3);
        debug.choices.forEach((choice, index) => {
          if (index == 0) {
            assert.strictEqual(choice.votingPower.toNumber() / (1 * 10 ** decimals), 200);
          } else if (index == 1) {
            assert.strictEqual(choice.votingPower.toNumber() / (1 * 10 ** decimals), 0);
          }
          console.log(`Proposal Choice ${index} : ${(choice.votingPower.toNumber() / (1 * 10 ** decimals)).toFixed(2)}`);
          console.log(choice);
        })
      });
  });

  it("user2 vote 'Against' on proposal standard (type 1) /w 100 voting power", async () => {
    await program.methods.voteNew(new BN(2), 1)
      .accountsStrict({
        owner: user2.publicKey,
        user: user2Pda,
        proposal: proposal2,
        lock,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user2])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.proposal.fetch(proposal2);
        assert.strictEqual(debug.choices.length, 3);
        debug.choices.forEach((choice, index) => {
          if (index == 0) {
            assert.strictEqual(choice.votingPower.toNumber() / (1 * 10 ** decimals), 100);
          } else if (index == 1) {
            assert.strictEqual(choice.votingPower.toNumber() / (1 * 10 ** decimals), 100);
          }
          console.log(`Proposal Choice ${index} : ${(choice.votingPower.toNumber() / (1 * 10 ** decimals)).toFixed(2)}`);
          console.log(choice);
        })
      });
  });


  it("User3 vote 'Abstain' on proposal core /w decreasing voting power", async () => {
    await program.methods.voteNew(new BN(1), 2)
      .accountsStrict({
        owner: user3.publicKey,
        user: user3Pda,
        proposal: proposal1,
        lock,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user3])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.proposal.fetch(proposal1);
        const user = await program.account.user.fetch(user3Pda);
        user.deposits.forEach(deposit => {
          console.log("Deposit Deactivation Start : ", new Date(deposit.deactivationStart.toNumber() * 1000).toISOString());
        })
        console.log("Lock created At : ", new Date(debug.createdAt.toNumber() * 1000).toISOString());
        console.log("Now : ", new Date().toISOString());
        assert.strictEqual(debug.choices.length, 3);
        debug.choices.forEach((choice, index) => {
          if (index == 0) {
            assert.strictEqual(choice.votingPower.toNumber() / (1 * 10 ** decimals), 200);
          } else if (index == 1) {
            assert.strictEqual(choice.votingPower.toNumber() / (1 * 10 ** decimals), 0);
          } else if (index == 2) {
            assert.notEqual((choice.votingPower.toNumber() / (1 * 10 ** decimals)).toFixed(2), 0);
          }
          console.log(`Proposal Choice ${index} : ${(choice.votingPower.toNumber() / (1 * 10 ** decimals)).toFixed(2)}`);
          console.log(choice);
        })
      }).catch(err => console.log(err));
  });


  it("user1 tries to execute proposal core before end of voting period", async () => {
    await assert.rejects((async () => {
      await program.methods.proposalExecute()
        .accountsStrict({
          owner: user1.publicKey,
          lock,
          proposal: proposal1,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([user1])
        .rpc()
        .then(confirmTx)
    })(), (err: any) => {
      console.log(err.error.errorCode.code)
      assert.strictEqual(err.error.errorCode.code, "WaitForVotingPeriodToEnd");
      return true
    });
  });

  it("user1 tries to execute proposal standard before end of voting period", async () => {
    await assert.rejects((async () => {
      await program.methods.proposalExecute()
        .accountsStrict({
          owner: user1.publicKey,
          lock,
          proposal: proposal2,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([user1])
        .rpc()
        .then(confirmTx)
    })(), (err: any) => {
      console.log(err.error.errorCode.code)
      assert.strictEqual(err.error.errorCode.code, "WaitForVotingPeriodToEnd");
      return true
    });
  });

  const proposal2Execute = async () => {
    return new Promise(resolve => {
      setTimeout(async () => {
        await program.methods.proposalExecute()
          .accountsStrict({
            owner: user1.publicKey,
            lock,
            proposal: proposal2,
            analytics,
            systemProgram: SYSTEM_PROGRAM_ID,
          })
          .signers([user1])
          .rpc()
          .then(confirmTx)
          .then(async () => {
            const debug = await program.account.proposal.fetch(proposal2);
            console.log(debug);
            resolve(debug.executed);
          }).catch(err => console.log(err));
      }, 16000)
    })
  }

  it("user1 execute proposal standard after end of voting period", async () => {
    const executed = await proposal2Execute();
    console.log(executed);
    assert.strictEqual(executed, true);
  }).timeout(17000);

  it("user1 execute proposal option after end of voting period", async () => {
    await program.methods.proposalExecute()
      .accountsStrict({
        owner: user1.publicKey,
        lock,
        proposal: proposal3,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
  });



  it("user1 deactivate his staked deposits", async () => {
    await program.methods.stakeDeactivate()
      .accountsStrict({
        owner: user1.publicKey,
        user: user1Pda,
        lock,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.user.fetch(user1Pda);
        debug.deposits.forEach(deposit => {
          console.log(deposit)
          assert.strictEqual(deposit.deactivating, true);
        });
        let user1TokenAmount = await connection.getTokenAccountBalance(user1Ata.address);
        console.log(`User 1 now have ${user1TokenAmount.value.uiAmount} Tokens`)
      });
  });

  const user1ClaimStake = async () => {
    return new Promise(resolve => {
      setTimeout(async () => {
        await program.methods.stakeClaim()
          .accountsStrict({
            owner: user1.publicKey,
            auth,
            lock,
            user: user1Pda,
            signerAta: user1Ata.address,
            mint,
            vault: user1Vault,
            analytics,
            systemProgram: SYSTEM_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
          })
          .signers([user1])
          .rpc()
          .then(confirmTx)
          .then(async () => {
            let user1TokenAmount = await connection.getTokenAccountBalance(user1Ata.address);
            console.log(`User 1 now have ${user1TokenAmount.value.uiAmount} Tokens`)
            resolve(user1TokenAmount.value.uiAmount)
          }).catch(err => console.log(err));
      }, 6000)
    })
  }

  it("user1 claim his deactivated staked deposits", async () => {
    const claim = await user1ClaimStake();
    assert.strictEqual(100, claim);
  }).timeout(7000);

  it("rejects : user1 tries claim twice his deactivated staked deposits", async () => {
    await assert.rejects((async () => {
      await program.methods.stakeClaim()
        .accountsStrict({
          owner: user1.publicKey,
          auth,
          lock,
          user: user1Pda,
          signerAta: user1Ata.address,
          mint,
          vault: user1Vault,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
        })
        .signers([user1])
        .rpc()
        .then(confirmTx)
    })(), (err: any) => {
      console.log(err.error.errorCode.code)
      assert.strictEqual(err.error.errorCode.code, "NoDepositsReadyToClaimForThisUserInThisLocker");
      return true
    });
  });

  it("user1 execute proposal core after end of voting period", async () => {
    await program.methods.proposalExecute()
      .accountsStrict({
        owner: user1.publicKey,
        lock,
        proposal: proposal1,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
  });

  it("user1 asr rewards restaked for lock mint season 1 rewards", async () => {
    await program.methods.asrClaim()
      .accountsStrict({
        owner: user1.publicKey,
        user: user1Pda,
        auth,
        lock,
        userVault: user1Vault,
        signerAta: user1Ata.address,
        vault,
        mint,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
  });

  it("reject : user1 tries claim twice his asr rewards for season 1", async () => {
    await assert.rejects((async () => {
      await program.methods.asrClaim()
        .accountsStrict({
          owner: user1.publicKey,
          user: user1Pda,
          auth,
          lock,
          userVault: user1Vault,
          signerAta: user1Ata.address,
          vault,
          mint,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
        })
        .signers([user1])
        .rpc()
        .then(confirmTx)
    })(), (err: any) => {
      console.log(err.error.errorCode.code)
      assert.strictEqual(err.error.errorCode.code, "UserAlreadyClaimedThis");
      return true
    });
  }).timeout(18000);


  // after(async () => {
  // setTimeout(async () => {
  // const token = new PublicKey(mint);
  // let user1TokenAmount = await connection.getTokenAccountBalance(user1Ata.address);
  // console.log(
  //   `User1 now have ${user1TokenAmount.value.uiAmountString} ${token.toBase58()} tokens`
  // );
  // let user1VaultTokenAmount = await connection.getTokenAccountBalance(user1Vault);
  // console.log(
  //   `User1 Vault now have ${user1VaultTokenAmount.value.uiAmountString} ${token.toBase58()} tokens`
  // );
  // const debug = await program.account.user.fetch(user1Pda);
  // debug.deposits.map((deposit, index) => {
  //   console.log(`deposit ${index}`, deposit.amount.toNumber())
  // });
  // // console.log(debug);
  // // debug.seasons.map(season => console.log("asr rewards : ", season.asr));
  // // const tokens = await connection.getTokenAccountBalance(vault);
  // // console.log(`asr vault now have ${tokens.value.uiAmount}`)
  // // const dgb = await program.account.user.fetch(user1Pda);
  // // console.log(dgb)

  // }, 30000)
  // });
});

const confirmTx = async (signature: string) => {
  const latestBlockhash = await anchor
    .getProvider()
    .connection.getLatestBlockhash();
  await anchor.getProvider().connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    commitment
  );
};

