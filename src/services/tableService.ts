import { TableClient, TableEntity, odata } from "@azure/data-tables";

let tableClientCache: Map<string, TableClient> = new Map();

const getTableClient = (tableName: string): TableClient => {
  if (!tableClientCache.has(tableName)) {
    const connectionString = process.env.AzureWebJobsStorage;

    if (!connectionString) {
      throw new Error("AzureWebJobsStorage connection string must be set in environment variables");
    }

    const client = TableClient.fromConnectionString(connectionString, tableName);
    tableClientCache.set(tableName, client);
  }

  return tableClientCache.get(tableName)!;
};

const retrieveEntity = async (
  tableName: string,
  partitionKey: string,
  rowKey: string
): Promise<any | null> => {
  try {
    const client = getTableClient(tableName);
    const entity = await client.getEntity(partitionKey, rowKey);
    return entity;
  } catch (error: any) {
    if (error.statusCode === 404) {
      return null;
    }
    throw error;
  }
};

const insertEntity = async (tableName: string, entity: any): Promise<any> => {
  const client = getTableClient(tableName);
  await client.createEntity(entity);

  // Return the created entity
  return await client.getEntity(entity.partitionKey, entity.rowKey);
};

const queryEntities = async (tableName: string, filter?: string): Promise<any[]> => {
  const client = getTableClient(tableName);
  const entities: any[] = [];

  const iterator = client.listEntities({ queryOptions: { filter } });

  for await (const entity of iterator) {
    entities.push(entity);
  }

  return entities;
};

const updateEntity = async (tableName: string, entity: any): Promise<any> => {
  const client = getTableClient(tableName);

  // Use merge mode to update only provided properties
  await client.updateEntity(entity, "Merge");

  // Return the updated entity
  return await client.getEntity(entity.partitionKey, entity.rowKey);
};

const deleteEntity = async (tableName: string, entity: any): Promise<any> => {
  const client = getTableClient(tableName);

  // First retrieve the entity before deleting
  const deletedEntity = await client.getEntity(entity.partitionKey, entity.rowKey);

  // Delete the entity
  await client.deleteEntity(entity.partitionKey, entity.rowKey);

  return deletedEntity;
};

export { retrieveEntity, insertEntity, queryEntities, updateEntity, deleteEntity };
