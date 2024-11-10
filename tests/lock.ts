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
import { Lock } from "../target/types/lock";
import { BN } from "bn.js";
import * as assert from "assert";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

const commitment: Commitment = "confirmed";

describe("lock", () => {

  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const program = anchor.workspace.Lock as Program<Lock>;

  //@ts-ignore
  const connection: Connection = anchor.getProvider().connection;

  const wallet = provider.wallet as anchor.Wallet;

  const user1 = new Keypair();
  const user2 = new Keypair();
  const user3 = new Keypair();

  const rpc = provider.connection.rpcEndpoint;

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

  const poll = PublicKey.findProgramAddressSync(
    // seeds = [b"poll", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
    [Buffer.from("poll"), lock.toBytes(), new BN(1).toArrayLike(Buffer, 'le', 8)],
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
        200 * 1 * 10 ** decimals
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
  //     await program.methods.lockerNew(0, week, new BN(0), 51, min, "SOON")
  //       .accountsStrict({
  //         signer: wallet.publicKey,
  //         auth,
  //         locker,
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
  //         const debug = await program.account.locker.fetch(locker);
  //         console.log(debug)
  //       });
  //   } else {
  //     console.log("running on localnet");
  //     await program.methods.lockerNew(0, day, new BN(0), 51, min, "SOON")
  //       .accountsStrict({
  //         signer: user1.publicKey,
  //         auth,
  //         locker,
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
  //         const debug = await program.account.locker.fetch(locker);
  //         console.log(debug)
  //       });
  //   }
  // });

  it("create voting escrow locker, lock time 1 year, min poll threshold 51% , min. tokens to start poll 100", async () => {
    //   // await program.methods.daoCreate({ twentyFourHours: {} }, 51, new BN(100), "Monolith DAO")
    if (rpc == "https://api.devnet.solana.com") {
      console.log("running on devnet");
      await program.methods.lockNew(0, week, new BN(86400 * 7 * 52), 51, 25, min, "SOON")
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
      // voting escrow
      // await program.methods.lockerNew(1, day, new BN(86400 * 7 * 52), 51, min, "SOON")
      // active staking rewards
      // await program.methods.lockNew(0, day, new BN(0), 51, 25, min, "SOON")
      await program.methods.lockNew(0, new BN(5), new BN(0), 51, 25, min, "SOON")
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
          console.log(debug)
        });
    }
  });

  it("user1 deposit asr tokens", async () => {
    await program.methods.asrDeposit(min)
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
        console.log(debug);
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
        const debug = await program.account.lock.fetch(lock);
        console.log(debug);
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
        console.log(debug);
        const user = await program.account.user.fetch(user1Pda);
        console.log(user);
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
        const debug = await program.account.lock.fetch(lock);
        console.log(debug);
      });
  });

  it("user2 stake 50 tokens", async () => {
    await program.methods.stakeNew(new BN(50 * 1 * 10 ** 6))
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
        console.log(debug);
        const user = await program.account.user.fetch(user2Pda);
        console.log(user)
      });
  });

  it("user1 start poll", async () => {
    const title = "mainnet release";
    const content = "i think we're ready !"

    console.log("title length : ", title.length)
    console.log("content length : ", content.length)

    await program.methods.pollNew(
      title,
      [
        {
          id: 0,
          votingPower: 0,
          title: "yes",
        },
        {
          id: 1,
          votingPower: 0,
          title: "no",
        },
      ],
    )
      .accountsStrict({
        owner: user1.publicKey,
        poll,
        lock,
        user: user1Pda,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.lock.fetch(lock);
        console.log(debug);
        const dbg = await program.account.poll.fetch(poll);
        console.log(dbg);
      });
  });

  it("user1 vote 'approve' on poll 0 /w 100 voting power", async () => {
    await program.methods.voteNew(new BN(1), 0)
      .accountsStrict({
        owner: user1.publicKey,
        user: user1Pda,
        poll,
        lock,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.lock.fetch(lock);
        console.log(debug);
        const dbg = await program.account.poll.fetch(poll);
        console.log(dbg);
      });
  });

  it("user1 tries voting twice", async () => {
    await assert.rejects((async () => {
      await program.methods.voteNew(new BN(1), 0)
        .accountsStrict({
          owner: user1.publicKey,
          user: user1Pda,
          poll,
          lock,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([user1])
        .rpc()
        .then(confirmTx);
    })());
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
        const debug = await program.account.lock.fetch(lock);
        console.log(debug);
      });
  });

  it("user3 tries to vote without voting power", async () => {
    await assert.rejects((async () => {
      await program.methods.voteNew(new BN(1), 0)
        .accountsStrict({
          owner: user3.publicKey,
          user: user3Pda,
          poll,
          lock,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([user3])
        .rpc()
        .then(confirmTx)
    })()); // current function returns rejected promise
  });

  it("user2 vote 'reject' on poll 0 /w 50 voting power", async () => {
    await program.methods.voteNew(new BN(1), 1)
      .accountsStrict({
        owner: user2.publicKey,
        user: user2Pda,
        poll,
        lock,
        analytics,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user2])
      .rpc()
      .then(confirmTx)
      .then(async () => {
        const debug = await program.account.lock.fetch(lock);
        console.log(debug);
        const db = await program.account.poll.fetch(poll);
        console.log(db);
        const dgb = await program.account.user.fetch(user2Pda);
        console.log(dgb);
      });
  });

  it("user1 tries to execute poll 0 before end of voting period", async () => {
    await assert.rejects((async () => {
      await program.methods.pollExecute()
        .accountsStrict({
          owner: user1.publicKey,
          lock,
          poll,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([user1])
        .rpc()
        .then(confirmTx)
    })());
  });

  it("user1 execute poll 0 after end of voting period", async () => {
    setTimeout(async () =>
      await program.methods.pollExecute()
        .accountsStrict({
          owner: user1.publicKey,
          lock,
          poll,
          analytics,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([user1])
        .rpc()
        .then(confirmTx)
        .then(async () => {
          const debug = await program.account.poll.fetch(poll);
          console.log(debug);
          const dg = await program.account.lock.fetch(lock);
          console.log(dg);
        })
      , 5000);
  }).timeout(6000);

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
        console.log(debug);
      });
  });

  it("user1 claim his deactivated staked deposits", async () => {
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
        .then(confirmTx);
    }, 6000)
  }).timeout(7000);

  it("user1 claim his deactivated staked deposits", async () => {
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
        .then(confirmTx);
    }, 6000)
  }).timeout(7000);

  it("user1 claim his asr rewards for season 1", async () => {
    setTimeout(async () => {
      await program.methods.asrClaim()
        .accountsStrict({
          owner: user1.publicKey,
          user: user1Pda,
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
        .then(confirmTx);
    }, 7000)
  }).timeout(8000);

  after(async () => {
    setTimeout(async () => {
      const token = new PublicKey(mint);
      let user1TokenAmount = await connection.getTokenAccountBalance(user1Ata.address);
      console.log(
        `User1 now have ${user1TokenAmount.value.uiAmountString} ${token.toBase58()} tokens`
      );
      const debug = await program.account.lock.fetch(lock);
      console.log(debug);
      debug.seasons.map(season => console.log("asr rewards : ", season.asr));
      const tokens = await connection.getTokenAccountBalance(vault);
      console.log(`asr vault now have ${tokens.value.uiAmount}`)
      const dgb = await program.account.user.fetch(user1Pda);
      console.log(dgb)

    }, 16000)
  });
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

