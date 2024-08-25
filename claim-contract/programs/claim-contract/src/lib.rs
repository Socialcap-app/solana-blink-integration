use anchor_lang::prelude::*;

declare_id!("DsizHqMmG29T3W74m8TxSSMnQA9XcBS3UPcngnRoYCgT");

#[program]
pub mod claim_contract {
    use super::*;

    pub fn create_claim(
      ctx: Context<CreateClaim>,
      uid: String,
      community_uid: String,
      plan_uid: String,
      email: String
    ) -> Result<()> {
        let claim = &mut ctx.accounts.claim;
        // if claim.state != "0" {
        //   return Err(error!(ErrorCode::AlreadyCreated));
        // }        
        claim.uid = (*uid).to_string();
        claim.community_uid = (*community_uid).to_string();
        claim.plan_uid = (*plan_uid).to_string();
        claim.applicant_pk = *ctx.accounts.signer.key;
        claim.applicant_email = (*email).to_string();
        claim.created_utc = Clock::get()?.unix_timestamp;
        // emit!(GameCreated { name, game_type });
        Ok(())
    }
}

#[account]
pub struct Claim {
    pub uid: String,
    pub community_uid: String,
    pub plan_uid: String,
    pub state: String,
    pub applicant_pk: Pubkey,
    pub applicant_email: String,
    pub result: String,
    pub created_utc: i64,
    pub closed_utc: i64
}

#[derive(Accounts)]
pub struct CreateClaim<'info> {
  #[account(
    init,
    payer = signer,
    space = 600,
    seeds = [b"claim".as_ref(), signer.key().as_ref()],
    bump
  )]
  pub claim: Account<'info,Claim>,
  #[account(mut)]
  pub signer: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Claim already created")]
    AlreadyCreated,
    // #[msg("You can't use this cell now")]
    // InvalidCell,
    // #[msg("You can't play, this game status is ended")]
    // FinishedGame,
}
