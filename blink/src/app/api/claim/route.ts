import {
    ACTIONS_CORS_HEADERS,
    ActionGetResponse,
    ActionPostRequest,
    ActionPostResponse,
    createPostResponse,
  } from "@solana/actions";
  import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
  } from "@solana/web3.js";
  
  // GET request handler
  export async function GET(request: Request) {
    const url = new URL(request.url);
    const payload: ActionGetResponse = {
      type: "action",  
      icon: "/images/soldevs.png", // Local icon path
      title: "Vote on this claim",
      description: "Most valuable dev on Solana",
      label: "Vote",
      links: {
        actions: [
          {
            label: "Approve :)",
            href: `${url.href}?claim=xxxxxx&community=xxxxxx&vote=1`,
          },
          {
            label: "Reject :(",
            href: `${url.href}?claim=xxxxxx&community=xxxxxx&vote=0`,
          },
          {
            label: "Absent :|",
            href: `${url.href}?claim=xxxxxx&community=xxxxxx&vote=-1`,
          },
        ],
      },
    };
    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  }
  
  export const OPTIONS = GET; // OPTIONS request handler
  
  // POST request handler
  export async function POST(request: Request) {
    const body: ActionPostRequest = await request.json();
    const url = new URL(request.url);
    const amount = url.searchParams.get("claim");
    const community = url.searchParams.get("community");
    let sender;
  
    try {
      sender = new PublicKey(body.account);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid account",
          },
        }),
        {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        }
      );
    }
  
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
    // TODO : Replace with your transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender, // Sender public key
        toPubkey: new PublicKey(""), // Replace with your recipient public key
        lamports: 1 * LAMPORTS_PER_SOL,
      })
    );
    transaction.feePayer = sender;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.lastValidBlockHeight = (await connection.getLatestBlockhash()).lastValidBlockHeight;
  
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: "Transaction created",
      },
    });
    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  }