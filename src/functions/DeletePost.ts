import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { deleteEntity, retrieveEntity } from "../services/tableService";

export async function DeletePost(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    if (request.method !== "DELETE") {
      return { status: 405, body: "Method Not Allowed" };
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
      partitionKey: blog,
      rowKey: id,
    };

    await deleteEntity("Posts", entity);

    return {
      status: 200,
      body: JSON.stringify({ message: "Post deleted successfully" }),
    };
  } catch (error) {
    return { status: 500, body: error.message };
  }
}

app.http("DeletePost", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: DeletePost,
  route: "DeletePost/{blog}/{id}",
});
