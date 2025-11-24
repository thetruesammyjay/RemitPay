import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Remiteasy } from "../target/types/remiteasy";
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  getOrCreateAssociatedTokenAccount,
  mintTo 
} from "@solana/spl-token";
import { assert } from "chai";

describe("remiteasy", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Remiteasy as Program<Remiteasy>;
  
  // Test accounts
  const admin = provider.wallet;
  let sender: anchor.web3.Keypair;
  let recipient: anchor.web3.Keypair;
  let usdcMint: anchor.web3.PublicKey;
  let senderTokenAccount: any;
  let recipientTokenAccount: any;
  
  // PDAs
  let programStatePda: anchor.web3.PublicKey;
  let programStateBump: number;
  let escrowAuthorityPda: anchor.web3.PublicKey;
  let escrowAuthorityBump: number;
  
  const INITIAL_USDC_AMOUNT = 1000 * 1_000_000; // 1000 USDC

  before(async () => {
    // Generate keypairs
    sender = anchor.web3.Keypair.generate();
    recipient = anchor.web3.Keypair.generate();
    
    // Airdrop SOL
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(sender.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(recipient.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL)
    );
    
    // Create USDC mint
    usdcMint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      admin.publicKey,
      6 // USDC has 6 decimals
    );
    
    // Create token accounts
    senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      usdcMint,
      sender.publicKey
    );
    
    recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      usdcMint,
      recipient.publicKey
    );
    
    // Mint USDC to sender
    await mintTo(
      provider.connection,
      admin.payer,
      usdcMint,
      senderTokenAccount.address,
      admin.publicKey,
      INITIAL_USDC_AMOUNT
    );
    
    // Derive PDAs
    [programStatePda, programStateBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      program.programId
    );
    
    [escrowAuthorityPda, escrowAuthorityBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow_authority")],
      program.programId
    );
  });

  it("Initializes the program", async () => {
    const feePercentage = 50; // 0.5% fee
    
    const tx = await program.methods
      .initialize(feePercentage)
      .accounts({
        programState: programStatePda,
        admin: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    console.log("Initialize transaction signature:", tx);
    
    // Fetch and verify program state
    const programState = await program.account.programState.fetch(programStatePda);
    assert.equal(programState.admin.toBase58(), admin.publicKey.toBase58());
    assert.equal(programState.feePercentage, feePercentage);
    assert.equal(programState.totalTransfers.toString(), "0");
    assert.equal(programState.totalVolume.toString(), "0");
  });

  it("Sends a transfer", async () => {
    const transferAmount = new anchor.BN(100 * 1_000_000); // 100 USDC
    const memo = "Test payment for services";
    
    // Get program state to derive transfer PDA
    const programState = await program.account.programState.fetch(programStatePda);
    const transferIndex = programState.totalTransfers;
    
    const [transferAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("transfer"),
        sender.publicKey.toBuffer(),
        transferIndex.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
    
    const [escrowTokenAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), transferAccountPda.toBuffer()],
      program.programId
    );
    
    const tx = await program.methods
      .sendTransfer(transferAmount, memo)
      .accounts({
        programState: programStatePda,
        transferAccount: transferAccountPda,
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        senderTokenAccount: senderTokenAccount.address,
        escrowTokenAccount: escrowTokenAccountPda,
        escrowAuthority: escrowAuthorityPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([sender])
      .rpc();
    
    console.log("Send transfer transaction signature:", tx);
    
    // Verify transfer account
    const transferAccount = await program.account.transferAccount.fetch(transferAccountPda);
    assert.equal(transferAccount.sender.toBase58(), sender.publicKey.toBase58());
    assert.equal(transferAccount.recipient.toBase58(), recipient.publicKey.toBase58());
    assert.equal(transferAccount.amount.toString(), transferAmount.toString());
    assert.equal(transferAccount.memo, memo);
    assert.deepEqual(transferAccount.status, { pending: {} });
    
    // Verify program state updated
    const updatedProgramState = await program.account.programState.fetch(programStatePda);
    assert.equal(updatedProgramState.totalTransfers.toString(), "1");
  });

  it("Receives a transfer", async () => {
    const transferAmount = new anchor.BN(50 * 1_000_000); // 50 USDC
    const memo = "Another test payment";
    
    // Send a new transfer
    const programState = await program.account.programState.fetch(programStatePda);
    const transferIndex = programState.totalTransfers;
    
    const [transferAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("transfer"),
        sender.publicKey.toBuffer(),
        transferIndex.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
    
    const [escrowTokenAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), transferAccountPda.toBuffer()],
      program.programId
    );
    
    await program.methods
      .sendTransfer(transferAmount, memo)
      .accounts({
        programState: programStatePda,
        transferAccount: transferAccountPda,
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        senderTokenAccount: senderTokenAccount.address,
        escrowTokenAccount: escrowTokenAccountPda,
        escrowAuthority: escrowAuthorityPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([sender])
      .rpc();
    
    // Get recipient's initial balance
    const recipientBalanceBefore = (await provider.connection.getTokenAccountBalance(
      recipientTokenAccount.address
    )).value.amount;
    
    // Receive the transfer
    const tx = await program.methods
      .receiveTransfer()
      .accounts({
        transferAccount: transferAccountPda,
        recipient: recipient.publicKey,
        recipientTokenAccount: recipientTokenAccount.address,
        escrowTokenAccount: escrowTokenAccountPda,
        escrowAuthority: escrowAuthorityPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([recipient])
      .rpc();
    
    console.log("Receive transfer transaction signature:", tx);
    
    // Verify transfer completed
    const transferAccount = await program.account.transferAccount.fetch(transferAccountPda);
    assert.deepEqual(transferAccount.status, { completed: {} });
    assert.isNotNull(transferAccount.completedAt);
    
    // Verify recipient received tokens
    const recipientBalanceAfter = (await provider.connection.getTokenAccountBalance(
      recipientTokenAccount.address
    )).value.amount;
    
    const balanceIncrease = new anchor.BN(recipientBalanceAfter).sub(new anchor.BN(recipientBalanceBefore));
    assert.equal(balanceIncrease.toString(), transferAmount.toString());
  });

  it("Cancels a transfer", async () => {
    const transferAmount = new anchor.BN(25 * 1_000_000); // 25 USDC
    const memo = "Transfer to be cancelled";
    
    // Send a new transfer
    const programState = await program.account.programState.fetch(programStatePda);
    const transferIndex = programState.totalTransfers;
    
    const [transferAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("transfer"),
        sender.publicKey.toBuffer(),
        transferIndex.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
    
    const [escrowTokenAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), transferAccountPda.toBuffer()],
      program.programId
    );
    
    await program.methods
      .sendTransfer(transferAmount, memo)
      .accounts({
        programState: programStatePda,
        transferAccount: transferAccountPda,
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        senderTokenAccount: senderTokenAccount.address,
        escrowTokenAccount: escrowTokenAccountPda,
        escrowAuthority: escrowAuthorityPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([sender])
      .rpc();
    
    // Get sender's balance before cancellation
    const senderBalanceBefore = (await provider.connection.getTokenAccountBalance(
      senderTokenAccount.address
    )).value.amount;
    
    // Cancel the transfer
    const tx = await program.methods
      .cancelTransfer()
      .accounts({
        transferAccount: transferAccountPda,
        sender: sender.publicKey,
        senderTokenAccount: senderTokenAccount.address,
        escrowTokenAccount: escrowTokenAccountPda,
        escrowAuthority: escrowAuthorityPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([sender])
      .rpc();
    
    console.log("Cancel transfer transaction signature:", tx);
    
    // Verify transfer cancelled
    const transferAccount = await program.account.transferAccount.fetch(transferAccountPda);
    assert.deepEqual(transferAccount.status, { cancelled: {} });
    
    // Verify sender got tokens back
    const senderBalanceAfter = (await provider.connection.getTokenAccountBalance(
      senderTokenAccount.address
    )).value.amount;
    
    const balanceIncrease = new anchor.BN(senderBalanceAfter).sub(new anchor.BN(senderBalanceBefore));
    assert.equal(balanceIncrease.toString(), transferAmount.toString());
  });

  it("Fails when non-recipient tries to receive", async () => {
    const transferAmount = new anchor.BN(10 * 1_000_000); // 10 USDC
    
    const programState = await program.account.programState.fetch(programStatePda);
    const transferIndex = programState.totalTransfers;
    
    const [transferAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("transfer"),
        sender.publicKey.toBuffer(),
        transferIndex.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
    
    const [escrowTokenAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), transferAccountPda.toBuffer()],
      program.programId
    );
    
    await program.methods
      .sendTransfer(transferAmount, "Test")
      .accounts({
        programState: programStatePda,
        transferAccount: transferAccountPda,
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        senderTokenAccount: senderTokenAccount.address,
        escrowTokenAccount: escrowTokenAccountPda,
        escrowAuthority: escrowAuthorityPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([sender])
      .rpc();
    
    // Try to receive with wrong recipient (sender)
    try {
      await program.methods
        .receiveTransfer()
        .accounts({
          transferAccount: transferAccountPda,
          recipient: sender.publicKey, // Wrong recipient!
          recipientTokenAccount: senderTokenAccount.address,
          escrowTokenAccount: escrowTokenAccountPda,
          escrowAuthority: escrowAuthorityPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([sender])
        .rpc();
      
      assert.fail("Should have failed with unauthorized receipt");
    } catch (error) {
      assert.include(error.message, "UnauthorizedReceipt");
    }
  });

  it("Fails when non-sender tries to cancel", async () => {
    const transferAmount = new anchor.BN(10 * 1_000_000);
    
    const programState = await program.account.programState.fetch(programStatePda);
    const transferIndex = programState.totalTransfers;
    
    const [transferAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("transfer"),
        sender.publicKey.toBuffer(),
        transferIndex.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
    
    const [escrowTokenAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), transferAccountPda.toBuffer()],
      program.programId
    );
    
    await program.methods
      .sendTransfer(transferAmount, "Test")
      .accounts({
        programState: programStatePda,
        transferAccount: transferAccountPda,
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        senderTokenAccount: senderTokenAccount.address,
        escrowTokenAccount: escrowTokenAccountPda,
        escrowAuthority: escrowAuthorityPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([sender])
      .rpc();
    
    // Try to cancel with wrong sender (recipient)
    try {
      await program.methods
        .cancelTransfer()
        .accounts({
          transferAccount: transferAccountPda,
          sender: recipient.publicKey, // Wrong sender!
          senderTokenAccount: recipientTokenAccount.address,
          escrowTokenAccount: escrowTokenAccountPda,
          escrowAuthority: escrowAuthorityPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([recipient])
        .rpc();
      
      assert.fail("Should have failed with unauthorized cancellation");
    } catch (error) {
      assert.include(error.message, "UnauthorizedCancellation");
    }
  });
});
