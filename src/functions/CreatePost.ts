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
      partitionKey: blog,
      rowKey: new Date().getTime().toString(),
      title: title,
      content: content,
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
