import {
  ACTIONS_CORS_HEADERS,
  ACTIONS_CORS_HEADERS_MIDDLEWARE,
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

import axios, { AxiosResponse } from "axios";

// GET request handler
export async function GET(request: Request) {
  const planUid = "ee50a79f6ee9426ab7ab4c2d9ea06b9c";
  const API_URL = "https://api.socialcap.dev/api/query";
  const API_URL_LOCAL = "http://localhost:30800/api/query";
  const url = new URL(request.url);
  const response: AxiosResponse = await axios.get(
    `${API_URL}/get_plan?params={"uid":"${planUid}"}`,
    {
      headers: {
        ...ACTIONS_CORS_HEADERS,
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJlYzNjNmUyNTRkMGI0MmRlYmQ5MzlkOWE3YmQ3Y2FjYyIsInNlc3Npb25fa2V5IjoiOWQ4MzM5YTAwZjU3NDA3NTk3MDg0YzBkMGExYzQyMWYiLCJjcmVhdGVkX3V0YyI6IjIwMjQtMDgtMjRUMTM6MTU6MjEuNjczWiIsImV4cGlyZXNfdXRjIjpudWxsLCJpYXQiOjE3MjQ1MDUzMjF9.OEoXYEHcsyAoVmuwGc8TZlk5kBa-t-3REYjzL-FuLLc",
      },
    }
  );

  if (!response.data) {
    return new Response("Could not get claim", { status: 500 });
  }
  const claim = response.data.data;
  console.log("claim form data", response.data.data);
  
  const evidenceFormData: any[] = JSON.parse(response.data.data.evidence);
  console.log("evidence form data", evidenceFormData);
  let hrefParams  =   evidenceFormData.map((field) => (`${field.sid}={${field.sid}}`))
  console.log("sids", hrefParams)
  let parameters = evidenceFormData.map((field) => ({name: field.sid, label: field.description}));
  console.log("parameters", parameters)
  const payload: ActionGetResponse = {
    type: "action",
    icon: claim.image, // Local icon path
    title: claim.name,
    description: claim.description,
    label: "Claim this credential",
    links: {
      actions: [
        {
          href: `/api/claim/${hrefParams.join("&")}`,  /// replace with Socialcap call  . Parameters are in the href , sid property from field
          label: 'Claim',
          parameters: parameters,
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
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;
  transaction.lastValidBlockHeight = (
    await connection.getLatestBlockhash()
  ).lastValidBlockHeight;

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
