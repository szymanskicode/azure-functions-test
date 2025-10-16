import * as azure from "azure-storage";
import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { queryEntities } from "../services/tableService";

export async function GetPost(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    const { blog, id } = request.params;

    const query = new azure.TableQuery()
      .where("PartitionKey eq ? and RowKey eq ?", blog, id)
      .select(["RowKey", "Title", "Content", "Author", "Timestamp"]);

    const result = await queryEntities("Posts", query);

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
