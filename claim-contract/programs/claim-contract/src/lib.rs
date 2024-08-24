use anchor_lang::prelude::*;

declare_id!("DsizHqMmG29T3W74m8TxSSMnQA9XcBS3UPcngnRoYCgT");

#[program]
pub mod claim_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
