import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { queryEntities } from "../services/tableService";

export async function GetPost(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    const { blog, id } = request.params;

    const filter = `PartitionKey eq '${blog}' and RowKey eq '${id}'`;

    const result = await queryEntities("Posts", filter);

    return {
      status: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return { status: 500, body: error.message };
  }
}

app.http("GetPost", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: GetPost,
  route: "GetPosts/{blog}/{id}",
});
