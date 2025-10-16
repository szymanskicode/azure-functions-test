import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { insertEntity } from "../services/tableService";

interface CreatePostBody {
  title: string;
  content: string;
  blog: string;
}

export async function CreatePost(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    if (request.method !== "POST") {
      return { status: 405, body: "Method Not Allowed" };
    }

    let body: CreatePostBody;

    try {
      body = (await request.json()) as CreatePostBody;
    } catch (error) {
      return {
        status: 400,
        body: "Provided body is missing or not a valid JSON",
      };
    }

    const { title, content, blog } = body;

    if (!title || !content || !blog) {
      return { status: 400, body: "Missing required fields" };
    }

    const entity = {
      PartitionKey: { _: blog },
      RowKey: { _: new Date().getTime().toString() },
      Title: { _: title },
      Content: { _: content },
    };

    const result = await insertEntity("Posts", entity);

    return {
      status: 201,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return { status: 500, body: error.message };
  }
}

app.http("CreatePost", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: CreatePost,
});
