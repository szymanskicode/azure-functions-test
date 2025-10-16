import * as azure from "azure-storage";
import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { updateEntity, retrieveEntity } from "../services/tableService";

interface UpdatePostBody {
  title?: string;
  content?: string;
}

export async function UpdatePost(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    if (request.method !== "PUT") {
      return { status: 405, body: "Method Not Allowed" };
    }

    let body: UpdatePostBody;

    try {
      body = (await request.json()) as UpdatePostBody;
    } catch (error) {
      return {
        status: 400,
        body: "Provided body is missing or not a valid JSON",
      };
    }

    const { title, content } = body;

    if (!title && !content) {
      return { status: 400, body: "Please pass title or content" };
    }

    const { blog, id } = request.params;

    // Check if entity exists
    const existingEntity = await retrieveEntity("Posts", blog, id);

    if (!existingEntity) {
      return {
        status: 404,
        body: JSON.stringify({ error: "Post not found" }),
      };
    }

    const entity = {
      PartitionKey: { _: blog },
      RowKey: { _: id },
    };

    if (title) {
      entity["Title"] = { _: title };
    }

    if (content) {
      entity["Content"] = { _: content };
    }

    const result = await updateEntity("Posts", entity);

    return {
      status: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return { status: 500, body: error.message };
  }
}

app.http("UpdatePost", {
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: UpdatePost,
  route: "UpdatePost/{blog}/{id}",
});
