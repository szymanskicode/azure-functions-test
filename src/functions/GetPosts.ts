import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { queryEntities } from "../services/tableService";

export async function GetPosts(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    const blog = request.params.blog;

    const filter = `PartitionKey eq '${blog}'`;

    const result = await queryEntities("Posts", filter);

    return {
      status: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return { status: 500, body: error.message };
  }
}

app.http("GetPosts", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: GetPosts,
  route: "GetPosts/{blog}",
});
